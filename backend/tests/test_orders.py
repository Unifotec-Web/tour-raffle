"""PostgreSQL race and recovery checks for sandbox checkout."""
import hashlib
import hmac
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text

from app.core.config import settings
from app.models.models import Campaign, CheckoutHold, Coupon, Entry, NotificationRecord, Order, ProviderEvent, RemedyRecord
from app.services.orders import close_registration, confirm_payment, issue_paid_order, schedule_reminders
from app.services.payment_providers import ProviderError, parse_webhook
from app.services.redemption import utcnow
from test_redemption import ORIGIN, client, database, seed


@pytest.fixture(autouse=True)
def fake_enabled(monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "test")
    monkeypatch.setattr(settings, "ENABLE_FAKE_PAYMENTS", True)
    monkeypatch.setattr(settings, "FAKE_PAYMENT_SECRET", "local-test-key")


def create(api, campaign_id, quantity=1, key=None):
    return api.post("/api/v1/orders", json={"campaign_id": str(campaign_id), "quantity": quantity, "provider": "fake", "idempotency_key": key or str(uuid4())}, headers=ORIGIN)


def start(api, order_id):
    result = api.post(f"/api/v1/orders/{order_id}/checkout", headers=ORIGIN)
    assert result.status_code == 200, result.text
    return result.json()


def fake_payload(order, event_id=None, amount=None, currency="USD", kind="payment.success"):
    return json.dumps({"id": event_id or "evt-" + order["id"], "type": kind, "data": {"reference": order["reference"], "transaction_id": "txn-" + order["id"], "amount": amount if amount is not None else int(float(order["total_amount"]) * 100), "currency": currency, "order_id": order["id"]}}, sort_keys=True, separators=(",", ":")).encode()


def send(raw):
    sig = hmac.new(settings.FAKE_PAYMENT_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    return TestClient(__import__("app.main", fromlist=["app"]).app).post("/api/v1/webhooks/fake", content=raw, headers={"x-fake-signature": sig})


def test_final_slots_idempotency_ownership_and_pricing(database):
    cid, uid, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner, other = client(tokens[0]), client(tokens[1])
    assert create(TestClient(__import__("app.main", fromlist=["app"]).app), cid).status_code == 401
    first = create(owner, cid, quantity=1, key="same-key-123"); assert first.status_code == 201, first.text
    same = create(owner, cid, quantity=1, key="same-key-123"); assert same.json()["id"] == first.json()["id"]
    assert create(owner, cid, quantity=2, key="same-key-123").status_code == 409
    assert first.json()["unit_amount"] == "10.00" and first.json()["total_amount"] == "10.00"
    assert other.get("/api/v1/orders/" + first.json()["id"]).status_code == 404
    assert other.post("/api/v1/orders/" + first.json()["id"] + "/checkout", headers=ORIGIN).status_code == 404
    with ThreadPoolExecutor(max_workers=6) as workers:
        results = list(workers.map(lambda _: create(client(tokens[0]), cid), range(6)))
    assert sum(r.status_code == 201 for r in results) == 1
    assert all(r.status_code in (201, 409) for r in results)
    with database() as db:
        c = db.get(Campaign, cid)
        assert c.active_holds == 2 and c.current_entries + c.unused_reservations + c.active_holds <= c.max_capacity


def test_verified_payment_issues_once_redemption_does_not_double_count(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0])
    order = create(owner, cid, quantity=2).json(); checkout = start(owner, order["id"])
    assert order["total_amount"] == "20.00"
    raw = fake_payload(checkout)
    assert send(raw).json()["status"] == "issued"
    assert send(raw).json()["status"] == "issued"
    with database() as db:
        c = db.get(Campaign, cid)
        assert (c.current_entries, c.unused_reservations, c.active_holds, c.issued_count) == (0, 2, 0, 2)
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.order_id == order["id"])) == 2
        assert db.scalar(select(func.count()).select_from(ProviderEvent)) == 1
    codes = [c["code"] for c in owner.get("/api/v1/users/me/coupons").json()]
    first = owner.post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN)
    assert first.status_code == 200, first.text
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN).json()["created"] is False
    with database() as db:
        c = db.get(Campaign, cid)
        assert (c.current_entries, c.unused_reservations, c.active_holds) == (1, 1, 0)
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[1]}, headers=ORIGIN).status_code == 200
    with database() as db:
        c = db.get(Campaign, cid)
        assert (c.status, c.current_entries, c.unused_reservations) == ("closed", 2, 0)
        assert db.scalar(select(func.count()).select_from(Entry)) == 2
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.status == "registered")) == 2


def test_signature_mismatch_and_paid_issuance_recovery(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0]); checkout = start(owner, create(owner, cid).json()["id"])
    raw = fake_payload(checkout, amount=1001)
    assert send(raw).status_code == 409
    with database() as db:
        mismatch = db.get(Order, __import__("uuid").UUID(checkout["id"]))
        assert mismatch.status == "reconciliation_required" and str(mismatch.paid_amount) == "10.01" and mismatch.paid_currency == "USD"
        assert db.scalar(select(func.count()).select_from(RemedyRecord).where(RemedyRecord.reason == "amount_currency_mismatch")) == 1
    assert TestClient(__import__("app.main", fromlist=["app"]).app).post("/api/v1/webhooks/fake", content=fake_payload(checkout), headers={"x-fake-signature": "bad"}).status_code == 409
    checkout = start(owner, create(owner, cid).json()["id"])
    raw = fake_payload(checkout)
    with database() as db:
        result = confirm_payment(db, __import__("uuid").UUID(checkout["id"]), "fake", "event-recovery", "txn-recovery", checkout["reference"], 1000, "USD", raw)
        assert result.status == "paid_pending_issuance"
    with database() as db:
        assert db.scalar(select(func.count()).select_from(Coupon)) == 0
        issue_paid_order(db, __import__("uuid").UUID(checkout["id"]))
        issue_paid_order(db, __import__("uuid").UUID(checkout["id"]))
        assert db.scalar(select(func.count()).select_from(Coupon)) == 1
        assert db.get(Campaign, cid).unused_reservations == 1


def test_expired_hold_reacquires_or_records_paid_remedy(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner = client(tokens[0]); first = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == first["id"])).expires_at = utcnow() - timedelta(seconds=1)
        db.commit()
    assert send(fake_payload(first)).json()["status"] == "issued"  # No competing reservation.
    with database() as db:
        c = db.get(Campaign, cid)
        assert (c.active_holds, c.unused_reservations, c.issued_count) == (0, 1, 1)

    with database.kw["bind"].begin() as connection:
        connection.execute(text("TRUNCATE users, campaigns RESTART IDENTITY CASCADE"))
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner = client(tokens[0]); late = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == late["id"])).expires_at = utcnow() - timedelta(seconds=1)
        db.commit()
    competitor = create(owner, cid); assert competitor.status_code == 201
    assert send(fake_payload(late)).json()["status"] == "reconciliation_required"
    with database() as db:
        c = db.get(Campaign, cid)
        assert c.active_holds == 1 and c.unused_reservations == 0 and c.issued_count == 0
        assert db.scalar(select(func.count()).select_from(RemedyRecord).where(RemedyRecord.reason == "paid_without_capacity")) == 1
        assert db.get(Order, __import__("uuid").UUID(late["id"])).paid_amount == 10


def test_deadline_closure_reminders_and_frozen_eligibility(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0]); checkout = start(owner, create(owner, cid, quantity=2).json()["id"])
    assert send(fake_payload(checkout)).json()["status"] == "issued"
    codes = [c["code"] for c in owner.get("/api/v1/users/me/coupons").json()]
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN).status_code == 200
    with database() as db:
        c = db.get(Campaign, cid)
        c.end_date = utcnow() + timedelta(hours=1)
        db.commit()
    with database() as db:
        assert schedule_reminders(db, cid) == 1
        assert schedule_reminders(db, cid) == 0
        assert db.scalar(select(func.count()).select_from(NotificationRecord)) == 1
    with database() as db:
        c = db.get(Campaign, cid)
        c.end_date = utcnow() - timedelta(seconds=1)
        db.commit()
    response = owner.post("/api/v1/coupons/redeem", json={"code": codes[1]}, headers=ORIGIN)
    assert response.status_code == 409
    with database() as db:
        c = db.get(Campaign, cid)
        assert c.status == "closed" and c.current_entries == 1 and c.unused_reservations == 0
        assert db.scalar(select(Coupon.status).where(Coupon.code == codes[1])) == "expired"
        assert db.scalar(select(func.count()).select_from(RemedyRecord).where(RemedyRecord.reason == "expired_unused")) == 1
        assert db.scalar(select(func.count()).select_from(Entry)) == 1
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[1]}, headers=ORIGIN).status_code == 409


def test_currency_mismatch_and_failure_then_success(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0])
    currency_order = start(owner, create(owner, cid).json()["id"])
    assert send(fake_payload(currency_order, currency="EUR")).status_code == 409
    with database() as db:
        order = db.get(Order, __import__("uuid").UUID(currency_order["id"]))
        assert order.paid_currency == "EUR" and order.fx_snapshot is None and order.status == "reconciliation_required"
        assert db.scalar(select(func.count()).select_from(Coupon)) == 0
    checkout = start(owner, create(owner, cid).json()["id"])
    failed = send(fake_payload(checkout, event_id="failure-event", kind="payment.failed"))
    assert failed.status_code == 200 and failed.json()["status"] == "failed"
    assert send(fake_payload(checkout, event_id="failure-event", kind="payment.failed")).json()["status"] == "failed"
    assert send(fake_payload(checkout, event_id="success-after-failure")).json()["status"] == "issued"
    with database() as db:
        assert db.get(Campaign, cid).active_holds == 0
        assert db.scalar(select(func.count()).select_from(Coupon)) == 1


def test_concurrent_callbacks_and_issuance_rollback(database, monkeypatch):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0]); checkout = start(owner, create(owner, cid).json()["id"])
    raw = fake_payload(checkout)
    with ThreadPoolExecutor(max_workers=6) as workers:
        results = list(workers.map(lambda _: send(raw), range(6)))
    assert all(result.status_code == 200 for result in results), [r.text for r in results]
    with database() as db:
        assert db.scalar(select(func.count()).select_from(Coupon)) == 1
        assert db.get(Campaign, cid).issued_count == 1
    next_checkout = start(owner, create(owner, cid).json()["id"])
    raw2 = fake_payload(next_checkout)
    with database() as db:
        confirm_payment(db, __import__("uuid").UUID(next_checkout["id"]), "fake", "pending-issuance-event", "pending-issuance-txn", next_checkout["reference"], 1000, "USD", raw2)
    existing_code = owner.get("/api/v1/users/me/coupons").json()[0]["code"]
    monkeypatch.setattr("app.services.orders.secrets.token_hex", lambda _: existing_code[3:].lower())
    with database() as db, pytest.raises(Exception):
        issue_paid_order(db, __import__("uuid").UUID(next_checkout["id"]))
    with database() as db:
        assert db.get(Order, __import__("uuid").UUID(next_checkout["id"])).status == "paid_pending_issuance"
        assert db.get(Campaign, cid).issued_count == 1
        assert db.scalar(select(func.count()).select_from(Coupon)) == 1
    monkeypatch.undo()
    with database() as db:
        issue_paid_order(db, __import__("uuid").UUID(next_checkout["id"]))
        assert db.get(Campaign, cid).issued_count == 2
        assert db.scalar(select(func.count()).select_from(Coupon)) == 2


def test_late_callback_cannot_change_draw_snapshot(database, monkeypatch):
    cid, _, _, tokens = seed(database, capacity=3, coupon_count=0)
    owner, admin = client(tokens[0]), client(tokens[1])
    with database() as db:
        from app.models.models import User
        db.scalar(select(User).where(User.email.like("stranger-%"))).role = "admin"
        db.commit()
    paid = start(owner, create(owner, cid, quantity=2).json()["id"])
    assert send(fake_payload(paid)).json()["status"] == "issued"
    code = owner.get("/api/v1/users/me/coupons").json()[0]["code"]
    assert owner.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN).status_code == 200
    late = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        campaign = db.get(Campaign, cid)
        campaign.end_date = utcnow() - timedelta(seconds=1)
        db.commit()
    monkeypatch.setattr(settings, "ENABLE_LOCAL_DRAW", True)
    prepared = admin.post(f"/api/v1/admin/draws/{cid}/prepare", headers=ORIGIN)
    assert prepared.status_code == 200, prepared.text
    hash_before = prepared.json()["snapshot_hash"]
    assert send(fake_payload(late)).json()["status"] == "reconciliation_required"
    assert send(fake_payload(paid, event_id="refund-after-snapshot", kind="payment.refunded")).status_code == 200
    again = admin.post(f"/api/v1/admin/draws/{cid}/prepare", headers=ORIGIN)
    assert again.status_code == 200 and again.json()["snapshot_hash"] == hash_before
    with database() as db:
        assert db.get(Campaign, cid).current_entries == 1
        assert db.scalar(select(func.count()).select_from(Entry)) == 1
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.status == "expired")) == 1
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.status == "registered")) == 1
        assert db.scalar(select(func.count()).select_from(RemedyRecord).where(RemedyRecord.reason == "refund_or_dispute")) == 1
        assert db.scalar(select(func.count()).select_from(RemedyRecord)) >= 2


def test_admin_recovery_and_reminders_require_admin(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    member = client(tokens[0]); admin = client(tokens[1])
    assert member.post("/api/v1/admin/orders/recover", headers=ORIGIN).status_code == 403
    assert member.post(f"/api/v1/admin/campaigns/{cid}/reminders", headers=ORIGIN).status_code == 403
    assert member.get("/api/v1/admin/remedies").status_code == 403
    with database() as db:
        from app.models.models import User
        db.scalar(select(User).where(User.email.like("stranger-%"))).role = "admin"
        db.commit()
    assert admin.post(f"/api/v1/admin/campaigns/{cid}/reminders", headers=ORIGIN).status_code == 200
    assert admin.get("/api/v1/admin/remedies").status_code == 200


def test_expired_hold_payment_confirmation_races_new_checkout(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner = client(tokens[0]); late = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == late["id"])).expires_at = utcnow() - timedelta(seconds=1)
        db.commit()
    with ThreadPoolExecutor(max_workers=2) as workers:
        payment_future = workers.submit(lambda: send(fake_payload(late)))
        checkout_future = workers.submit(lambda: create(client(tokens[0]), cid))
        payment_result, checkout_result = payment_future.result(), checkout_future.result()
    assert payment_result.status_code == 200 and checkout_result.status_code in (201, 409)
    with database() as db:
        campaign = db.get(Campaign, cid)
        paid = db.get(Order, __import__("uuid").UUID(late["id"]))
        assert paid.paid_amount == 10 and paid.status in ("issued", "reconciliation_required")
        assert campaign.current_entries + campaign.unused_reservations + campaign.active_holds <= campaign.max_capacity
        assert campaign.issued_count + campaign.active_holds <= campaign.max_capacity
        assert (paid.status == "issued") != (checkout_result.status_code == 201)


def test_issued_codes_are_not_recycled_after_manual_refund_state(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner = client(tokens[0]); checkout = start(owner, create(owner, cid).json()["id"])
    assert send(fake_payload(checkout)).json()["status"] == "issued"
    with database() as db:
        campaign = db.get(Campaign, cid)
        coupon = db.scalar(select(Coupon).where(Coupon.order_id == checkout["id"]))
        coupon.status = "refunded"  # Fixture for a future explicitly reviewed refund decision.
        campaign.unused_reservations -= 1
        db.commit()
    retry = create(owner, cid)
    assert retry.status_code == 409
    with database() as db:
        campaign = db.get(Campaign, cid)
        assert campaign.issued_count == 1 and campaign.active_holds == 0


def test_deadline_purchase_rejection_persists_closure_and_remedy(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner = client(tokens[0]); paid = start(owner, create(owner, cid).json()["id"])
    assert send(fake_payload(paid)).json()["status"] == "issued"
    with database() as db:
        db.get(Campaign, cid).end_date = utcnow() - timedelta(seconds=1)
        db.commit()
    assert create(owner, cid).status_code == 409
    with database() as db:
        campaign = db.get(Campaign, cid)
        assert campaign.status == "closed" and campaign.unused_reservations == 0
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.status == "expired")) == 1
        assert db.scalar(select(func.count()).select_from(RemedyRecord).where(RemedyRecord.reason == "expired_unused")) == 1


def test_failed_draw_prerequisite_still_persists_due_closure(database, monkeypatch):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    with database() as db:
        from app.models.models import User
        db.scalar(select(User).where(User.email.like("stranger-%"))).role = "admin"
        db.get(Campaign, cid).end_date = utcnow() - timedelta(seconds=1)
        db.commit()
    monkeypatch.setattr(settings, "ENABLE_LOCAL_DRAW", True)
    admin = client(tokens[1])
    assert admin.post(f"/api/v1/admin/draws/{cid}/prepare", headers=ORIGIN).status_code == 409
    with database() as db:
        assert db.get(Campaign, cid).status == "closed"
