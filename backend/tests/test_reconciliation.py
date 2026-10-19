"""Milestone 6 PostgreSQL reconciliation and review checks."""
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import UUID

import pytest
from sqlalchemy import func, select

from app.core.config import settings
from app.core.security import new_session_token, token_digest
from app.models.models import AuditLog, AuthSession, Campaign, Coupon, DrawRun, DrawSnapshot, Order, ProviderEvent, RemedyRecord, RemedyReviewEvent, User
from app.services.payment_providers import ProviderError, ProviderPayment
from app.services.orders import close_registration, confirm_payment, lock_campaign
from app.services.redemption import utcnow
from test_orders import create, start
from test_redemption import ORIGIN, client, database, seed


@pytest.fixture(autouse=True)
def fake_enabled(monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "test")
    monkeypatch.setattr(settings, "ENABLE_FAKE_PAYMENTS", True)
    monkeypatch.setattr(settings, "FAKE_PAYMENT_SECRET", "local-test-key")


def admin_client(Session):
    with Session() as db:
        now = utcnow()
        user = User(email="admin-reconcile@example.com", hashed_password="fixture", full_name="Admin", country="Kenya", role="admin", is_active=True, consented_at=now)
        db.add(user); db.flush()
        token = new_session_token()
        db.add(AuthSession(user_id=user.id, token_hash=token_digest(token), expires_at=now + timedelta(hours=1)))
        db.commit()
    return client(token)


def payment_for(order):
    return ProviderPayment("paid", order["reference"], "provider-transaction-" + order["id"],
                           int(float(order["total_amount"]) * 100), order["currency"], order["id"])


def test_permissions_filters_concurrent_reconciliation_and_recovery(database, monkeypatch):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner, other, admin = client(tokens[0]), client(tokens[1]), admin_client(database)
    checkout = start(owner, create(owner, cid).json()["id"])
    import app.api.orders as api_orders
    monkeypatch.setattr(api_orders, "query_payment", lambda provider, reference: payment_for(checkout))
    url = f"/api/v1/admin/orders/{checkout['id']}/reconcile"
    assert owner.get("/api/v1/admin/orders").status_code == 403
    assert other.get("/api/v1/orders/" + checkout["id"]).status_code == 404
    assert owner.post(url, headers=ORIGIN).status_code == 403
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: admin.post(url, headers=ORIGIN), range(4)))
    assert all(result.status_code == 200 for result in results), [r.text for r in results]
    assert all(result.json()["issuance_status"] == "issued" for result in results)
    assert admin.post(f"/api/v1/admin/orders/{checkout['id']}/recover", headers=ORIGIN).status_code == 200
    listing = admin.get("/api/v1/admin/orders?payment_status=paid&issuance_status=issued&limit=1")
    assert listing.status_code == 200 and listing.json()["total"] == 1
    assert admin.get("/api/v1/admin/orders?payment_status=failed").json()["total"] == 0
    with database() as db:
        campaign = db.get(Campaign, cid)
        assert (campaign.unused_reservations, campaign.issued_count) == (1, 1)
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.order_id == UUID(checkout["id"]))) == 1
        assert db.scalar(select(func.count()).select_from(ProviderEvent).where(ProviderEvent.order_id == UUID(checkout["id"]))) == 1
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "payment.reconciled", AuditLog.details.contains(checkout["id"]))) == 4


def test_provider_failure_mismatch_and_frozen_draw(database, monkeypatch):
    cid, uid, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner, admin = client(tokens[0]), admin_client(database)
    checkout = start(owner, create(owner, cid).json()["id"])
    import app.api.orders as api_orders
    def unavailable(*_): raise ProviderError("provider offline")
    monkeypatch.setattr(api_orders, "query_payment", unavailable)
    url = f"/api/v1/admin/orders/{checkout['id']}/reconcile"
    assert admin.post(url, headers=ORIGIN).status_code == 503
    monkeypatch.setattr(api_orders, "query_payment", lambda *_: ProviderPayment("paid", checkout["reference"], "txn-bad", 999, "USD", checkout["id"]))
    assert admin.post(url, headers=ORIGIN).status_code == 409
    with database() as db:
        order = db.get(Order, UUID(checkout["id"]))
        assert order.status == "reconciliation_required"
        assert db.scalar(select(RemedyRecord).where(RemedyRecord.order_id == order.id, RemedyRecord.reason == "amount_currency_mismatch"))
        campaign = db.get(Campaign, cid)
        campaign.status = "closed"
        run = DrawRun(campaign_id=cid, status="prepared", algorithm_version="fixture", prepared_by=uid, prepared_at=utcnow())
        db.add(run); db.flush()
        db.add(DrawSnapshot(run_id=run.id, content='{"entries":[]}', hash="a" * 64, entry_count=0, participant_count=0, winner_count=1, created_at=utcnow()))
        db.commit()
        run_id = run.id
    monkeypatch.setattr(api_orders, "query_payment", lambda *_: payment_for(checkout))
    assert admin.post(url, headers=ORIGIN).status_code == 200
    with database() as db:
        snap = db.get(DrawSnapshot, run_id)
        assert snap.content == '{"entries":[]}' and snap.hash == "a" * 64
        assert db.get(Campaign, cid).status == "closed"
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.order_id == UUID(checkout["id"]))) == 0


def test_duplicate_paid_issuance_recovery_requests(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner, admin = client(tokens[0]), admin_client(database)
    checkout = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        result = confirm_payment(db, UUID(checkout["id"]), "fake", "verified-but-interrupted",
                                 "recovery-txn-" + checkout["id"], checkout["reference"], 1000,
                                 "USD", b"verified-but-interrupted")
        assert result.status == "paid_pending_issuance"
    url = f"/api/v1/admin/orders/{checkout['id']}/recover"
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: admin.post(url, headers=ORIGIN), range(4)))
    assert all(r.status_code == 200 and r.json()["issuance_status"] == "issued" for r in results)
    with database() as db:
        campaign = db.get(Campaign, cid)
        assert campaign.issued_count == 1 and campaign.unused_reservations == 1
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.order_id == UUID(checkout["id"]))) == 1


def test_remedy_review_history_permissions_and_pagination(database):
    cid, _, _, tokens = seed(database, capacity=2, coupon_count=0)
    owner, admin = client(tokens[0]), admin_client(database)
    checkout = start(owner, create(owner, cid).json()["id"])
    with database() as db:
        order = db.get(Order, UUID(checkout["id"]))
        remedy = RemedyRecord(order_id=order.id, reason="paid_without_capacity", details="Fixture", created_at=utcnow())
        db.add(remedy); db.commit(); remedy_id = remedy.id
    assert owner.get("/api/v1/admin/remedy-queue").status_code == 403
    assert owner.post(f"/api/v1/admin/remedy-queue/{remedy_id}/review", json={"decision":"defer","reason":"Awaiting policy decision"}, headers=ORIGIN).status_code == 403
    queue = admin.get("/api/v1/admin/remedy-queue?status=pending_review&limit=1")
    assert queue.status_code == 200 and queue.json()["total"] == 1
    url = f"/api/v1/admin/remedy-queue/{remedy_id}/review"
    assert admin.post(url, json={"decision":"refund","reason":"Not an allowed decision"}, headers=ORIGIN).status_code == 422
    for decision in ("investigate", "escalate"):
        result = admin.post(url, json={"decision":decision,"reason":"Needs explicit policy review"}, headers=ORIGIN)
        assert result.status_code == 200, result.text
    assert len(admin.get(f"/api/v1/admin/remedy-queue/{remedy_id}").json()["history"]) == 2
    assert admin.get("/api/v1/admin/remedy-queue?status=under_review").json()["total"] == 1
    with database() as db:
        assert db.scalar(select(func.count()).select_from(RemedyReviewEvent)) == 2
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "remedy.reviewed", AuditLog.details.contains(str(remedy_id)))) == 2
        assert db.get(Order, UUID(checkout["id"])).status == "checkout_pending"


def test_expired_unused_coupon_enters_review_queue_without_refund(database):
    cid, _, _, tokens = seed(database, capacity=1, coupon_count=0)
    owner, admin = client(tokens[0]), admin_client(database)
    checkout = start(owner, create(owner, cid).json()["id"])
    issued = owner.post(f"/api/v1/test/orders/{checkout['id']}/confirm", headers=ORIGIN)
    assert issued.status_code == 200 and issued.json()["issuance_status"] == "issued"
    with database() as db:
        campaign = lock_campaign(db, cid)
        assert close_registration(db, campaign, "fixture closure")
        db.commit()
    queue = admin.get("/api/v1/admin/remedy-queue?reason=expired_unused")
    assert queue.status_code == 200 and queue.json()["total"] == 1
    remedy = queue.json()["items"][0]
    assert remedy["coupon_id"] and remedy["order_id"] == checkout["id"]
    review = admin.post(f"/api/v1/admin/remedy-queue/{remedy['id']}/review",
                        json={"decision":"defer","reason":"Awaiting confirmed remedy policy"}, headers=ORIGIN)
    assert review.status_code == 200
    with database() as db:
        coupon = db.scalar(select(Coupon).where(Coupon.order_id == UUID(checkout["id"])))
        assert coupon.status == "expired"
        assert db.get(Order, UUID(checkout["id"])).paid_at is not None
        assert db.get(Campaign, cid).unused_reservations == 0
