"""PostgreSQL campaign administration and close/redemption race checks."""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db
from app.core.security import generate_secure_coupon_code, new_session_token, token_digest
from app.main import app
from app.models.models import AuditLog, AuthSession, Campaign, Coupon, Entry, User
from app.services.redemption import generate_entry_code, utcnow

URL = os.environ.get("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="Requires disposable PostgreSQL verification database")
ORIGIN = {"Origin": "http://localhost:3000"}


@pytest.fixture
def database():
    target = make_url(URL)
    if (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
        raise RuntimeError("Tests require disposable localhost Compose database")
    engine = create_engine(URL, pool_size=10, max_overflow=10)
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE users, campaigns, auth_attempts, audit_logs RESTART IDENTITY CASCADE"))
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    def override():
        with Session() as db:
            yield db
    previous = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = override
    yield Session
    if previous is None:
        app.dependency_overrides.pop(get_db, None)
    else:
        app.dependency_overrides[get_db] = previous
    engine.dispose()


def users(Session):
    now = utcnow()
    tokens = []
    with Session() as db:
        for role in ("admin", "user"):
            user = User(email=f"{role}-{uuid4()}@example.com", hashed_password="fixture", full_name=role, country="Kenya", role=role, is_active=True, is_verified=False, consented_at=now)
            db.add(user)
            db.flush()
            token = new_session_token()
            db.add(AuthSession(user_id=user.id, token_hash=token_digest(token), expires_at=now+timedelta(hours=1)))
            tokens.append((user.id, user.email, token))
        db.commit()
    return tokens


def client(token):
    api = TestClient(app)
    api.cookies.set("tour_raffle_session", token)
    return api


def payload(**changes):
    now = utcnow()
    values = {
        "name": "Kenya tour", "description": "Fixture campaign", "destination": "Kenya",
        "prize_value": "1000.00", "currency": "USD", "coupon_price": "10.00",
        "max_capacity": 3, "winner_count": 1,
        "start_date": (now-timedelta(days=1)).isoformat()+"Z",
        "end_date": (now+timedelta(days=1)).isoformat()+"Z", "is_featured": True,
    }
    values.update(changes)
    return values


def create(api, **changes):
    result = api.post("/api/v1/admin/campaigns", json=payload(**changes), headers=ORIGIN)
    assert result.status_code == 201, result.text
    return result.json()


def test_admin_permissions_creation_validation_and_audit(database):
    admin_data, member_data = users(database)
    admin, member = client(admin_data[2]), client(member_data[2])
    assert TestClient(app).get("/api/v1/admin/campaigns").status_code == 401
    assert member.get("/api/v1/admin/campaigns").status_code == 403
    assert member.post("/api/v1/admin/campaigns", json=payload(), headers=ORIGIN).status_code == 403
    assert admin.post("/api/v1/admin/campaigns", json=payload()).status_code == 403
    assert admin.get("/api/v1/admin/campaigns").json() == []
    assert admin.post("/api/v1/admin/campaigns", json=payload(max_capacity=0), headers=ORIGIN).status_code == 422
    assert admin.post("/api/v1/admin/campaigns", json=payload(max_capacity=2147483648), headers=ORIGIN).status_code == 422
    assert admin.post("/api/v1/admin/campaigns", json=payload(name="  "), headers=ORIGIN).status_code == 422
    assert admin.post("/api/v1/admin/campaigns", json=payload(winner_count=4), headers=ORIGIN).status_code == 422
    bad_dates = payload()
    bad_dates["end_date"] = bad_dates["start_date"]
    assert admin.post("/api/v1/admin/campaigns", json=bad_dates, headers=ORIGIN).status_code == 422
    campaign = create(admin)
    campaign_id = campaign["id"]
    assert campaign["status"] == "draft" and campaign["current_entries"] == 0
    assert admin.get("/api/v1/campaigns/featured/progress").status_code == 404
    assert len(admin.get("/api/v1/admin/campaigns").json()) == 1
    assert admin.get(f"/api/v1/admin/campaigns/{campaign_id}").status_code == 200
    assert member.get(f"/api/v1/admin/campaigns/{campaign_id}").status_code == 403
    assert member.patch(f"/api/v1/admin/campaigns/{campaign_id}", json={"name": "Other"}, headers=ORIGIN).status_code == 403
    assert member.post(f"/api/v1/admin/campaigns/{campaign_id}/status", json={"status": "open"}, headers=ORIGIN).status_code == 403
    assert admin.post("/api/v1/admin/campaigns", json=payload(name="Second"), headers=ORIGIN).status_code == 409
    with database() as db:
        logs = db.scalars(select(AuditLog).order_by(AuditLog.created_at)).all()
        assert len(logs) == 1 and logs[0].action == "campaign.create" and logs[0].admin_email == admin_data[1]
        assert campaign_id in logs[0].details


def test_edit_rules_status_transitions_and_audit(database):
    admin_data, member_data = users(database)
    admin, member = client(admin_data[2]), client(member_data[2])
    campaign = create(admin)
    campaign_id = campaign["id"]
    url = f"/api/v1/admin/campaigns/{campaign_id}"
    assert admin.patch(url, json={"max_capacity": 0}, headers=ORIGIN).status_code == 422
    assert admin.patch(url, json={"winner_count": 4}, headers=ORIGIN).status_code == 422
    assert admin.patch(url, json={"name": "Updated tour", "description": "Updated copy"}, headers=ORIGIN).status_code == 200
    assert admin.post(f"{url}/status", json={"status": "closed"}, headers=ORIGIN).status_code == 409
    opened = admin.post(f"{url}/status", json={"status": "open"}, headers=ORIGIN)
    assert opened.status_code == 200 and opened.json()["status"] == "open"
    assert admin.get("/api/v1/campaigns/featured/progress").status_code == 200
    code = generate_secure_coupon_code()
    with database() as db:
        db.add(Coupon(code=code, campaign_id=campaign_id, user_id=member_data[0], status="active", valid_until=utcnow()+timedelta(hours=1)))
        db.commit()
    redeemed = member.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN)
    assert redeemed.status_code == 200, redeemed.text
    assert admin.post(f"{url}/status", json={"status": "cancelled"}, headers=ORIGIN).status_code == 409
    for field, value in (("destination", "Uganda"), ("prize_value", "1200.00"), ("coupon_price", "20.00"), ("winner_count", 2), ("start_date", (utcnow()-timedelta(days=2)).isoformat()+"Z")):
        assert admin.patch(url, json={field: value}, headers=ORIGIN).status_code == 409
    assert admin.patch(url, json={"max_capacity": 0}, headers=ORIGIN).status_code == 422
    assert admin.patch(url, json={"max_capacity": 1}, headers=ORIGIN).status_code == 200
    state = admin.get(url).json()
    assert state["status"] == "closed" and state["current_entries"] == state["max_capacity"] == 1
    assert admin.post(f"{url}/status", json={"status": "open"}, headers=ORIGIN).status_code == 409
    assert admin.post(f"{url}/status", json={"status": "completed"}, headers=ORIGIN).status_code == 409
    with database() as db:
        actions = [log.action for log in db.scalars(select(AuditLog).where(AuditLog.admin_email == admin_data[1])).all()]
        assert actions.count("campaign.create") == 1
        assert actions.count("campaign.edit") == 2
        assert actions.count("campaign.status") == 2
        assert db.scalar(select(func.count()).select_from(Entry).where(Entry.campaign_id == campaign_id)) == 1


def test_capacity_cannot_drop_below_two_entries(database):
    admin_data, member_data = users(database)
    admin, member = client(admin_data[2]), client(member_data[2])
    campaign_id = create(admin)["id"]
    admin.post(f"/api/v1/admin/campaigns/{campaign_id}/status", json={"status": "open"}, headers=ORIGIN)
    with database() as db:
        codes = [generate_secure_coupon_code() for _ in range(2)]
        db.add_all([Coupon(code=code, campaign_id=campaign_id, user_id=member_data[0], status="active", valid_until=utcnow()+timedelta(hours=1)) for code in codes])
        db.commit()
    for code in codes:
        assert member.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN).status_code == 200
    reduced = admin.patch(f"/api/v1/admin/campaigns/{campaign_id}", json={"max_capacity": 1}, headers=ORIGIN)
    assert reduced.status_code == 409 and "confirmed entries" in reduced.json()["detail"]
    assert admin.get(f"/api/v1/admin/campaigns/{campaign_id}").json()["max_capacity"] == 3


def test_scheduled_dates_and_transition_rules(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    now = utcnow()
    campaign = create(admin,
        start_date=(now+timedelta(days=1)).isoformat()+"Z",
        end_date=(now+timedelta(days=3)).isoformat()+"Z")
    url = f"/api/v1/admin/campaigns/{campaign['id']}"
    assert admin.post(f"{url}/status", json={"status": "open"}, headers=ORIGIN).status_code == 409
    scheduled = admin.post(f"{url}/status", json={"status": "scheduled"}, headers=ORIGIN)
    assert scheduled.status_code == 200 and scheduled.json()["status"] == "scheduled"
    assert admin.post(f"{url}/status", json={"status": "open"}, headers=ORIGIN).status_code == 409
    assert admin.patch(url, json={"end_date": (now-timedelta(days=1)).isoformat()+"Z"}, headers=ORIGIN).status_code == 422
    cancelled = admin.post(f"{url}/status", json={"status": "cancelled"}, headers=ORIGIN)
    assert cancelled.status_code == 200 and cancelled.json()["status"] == "cancelled"
    assert admin.post(f"{url}/status", json={"status": "scheduled"}, headers=ORIGIN).status_code == 409


def test_pending_entry_also_locks_critical_rules(database):
    admin_data, member_data = users(database)
    admin = client(admin_data[2])
    campaign_id = create(admin)["id"]
    with database() as db:
        coupon = Coupon(code=generate_secure_coupon_code(), campaign_id=campaign_id, user_id=member_data[0], status="active", valid_until=utcnow()+timedelta(days=1))
        db.add(coupon)
        db.flush()
        db.add(Entry(entry_code=generate_entry_code(), coupon_id=coupon.id, campaign_id=campaign_id, user_id=member_data[0], status="pending"))
        db.commit()
    url = f"/api/v1/admin/campaigns/{campaign_id}"
    assert "cancelled" not in admin.get(url).json()["allowed_transitions"]
    assert admin.patch(url, json={"destination": "Uganda"}, headers=ORIGIN).status_code == 409
    assert admin.post(f"{url}/status", json={"status": "cancelled"}, headers=ORIGIN).status_code == 409


def test_concurrent_closure_and_redemption(database):
    admin_data, member_data = users(database)
    admin, member = client(admin_data[2]), client(member_data[2])
    campaign_id = create(admin, max_capacity=2)["id"]
    assert admin.post(f"/api/v1/admin/campaigns/{campaign_id}/status", json={"status": "open"}, headers=ORIGIN).status_code == 200
    code = generate_secure_coupon_code()
    with database() as db:
        db.add(Coupon(code=code, campaign_id=campaign_id, user_id=member_data[0], status="active", valid_until=utcnow()+timedelta(hours=1)))
        db.commit()
    barrier = Barrier(2)
    def close():
        barrier.wait()
        return client(admin_data[2]).post(f"/api/v1/admin/campaigns/{campaign_id}/status", json={"status": "closed"}, headers=ORIGIN)
    def redeem():
        barrier.wait()
        return client(member_data[2]).post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=2) as workers:
        closure = workers.submit(close)
        redemption = workers.submit(redeem)
        close_result, redeem_result = closure.result(), redemption.result()
    assert close_result.status_code == 200, close_result.text
    assert redeem_result.status_code in (200, 409), redeem_result.text
    with database() as db:
        campaign = db.get(Campaign, campaign_id)
        entries = db.scalar(select(func.count()).select_from(Entry).where(Entry.campaign_id == campaign_id))
        assert campaign.status == "closed" and entries == campaign.current_entries
        assert entries == (1 if redeem_result.status_code == 200 else 0)
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "campaign.status", AuditLog.admin_email == admin_data[1])) == 2
