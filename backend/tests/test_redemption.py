"""PostgreSQL-only integration tests for coupon redemption."""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db
from app.core.security import generate_secure_coupon_code, new_session_token, token_digest
from app.main import app
from app.models.models import AuthSession, Campaign, Coupon, Entry, User
from app.services import redemption

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
        connection.execute(text("TRUNCATE users, campaigns RESTART IDENTITY CASCADE"))
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    def override():
        with Session() as db:
            yield db
    app.dependency_overrides[get_db] = override
    yield Session
    app.dependency_overrides.clear()
    engine.dispose()


def seed(Session, capacity=2, coupon_count=1, status="open", expired=False):
    now = redemption.utcnow()
    with Session() as db:
        user = User(email=f"owner-{uuid4()}@example.com", hashed_password="fixture", full_name="Owner", country="Kenya", role="user", is_active=True, is_verified=False, consented_at=now)
        stranger = User(email=f"stranger-{uuid4()}@example.com", hashed_password="fixture", full_name="Stranger", country="Kenya", role="user", is_active=True, is_verified=False, consented_at=now)
        db.add_all([user, stranger])
        db.flush()
        campaign = Campaign(name="Fixture campaign", destination="Kenya", prize_value=100, max_capacity=capacity, current_entries=0, winner_count=1, is_featured=True, status=status, start_date=now-timedelta(days=1), end_date=now+timedelta(days=1), updated_at=now)
        db.add(campaign)
        db.flush()
        codes = []
        for _ in range(coupon_count):
            code = generate_secure_coupon_code()
            db.add(Coupon(code=code, campaign_id=campaign.id, user_id=user.id, status="active", valid_until=now+timedelta(days=-1 if expired else 1)))
            codes.append(code)
        tokens = []
        for person in (user, stranger):
            token = new_session_token()
            db.add(AuthSession(user_id=person.id, token_hash=token_digest(token), expires_at=now+timedelta(hours=1)))
            tokens.append(token)
        db.commit()
        return campaign.id, user.id, codes, tokens


def client(token):
    api = TestClient(app)
    api.cookies.set("tour_raffle_session", token)
    return api


def test_api_ownership_validation_retry_and_progress(database):
    campaign_id, _, codes, tokens = seed(database, capacity=1)
    owner, stranger = client(tokens[0]), client(tokens[1])
    code = codes[0]
    assert TestClient(app).post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN).status_code == 401
    assert stranger.post("/api/v1/coupons/validate", json={"code": code}, headers=ORIGIN).status_code == 404
    assert stranger.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN).status_code == 404
    assert owner.post("/api/v1/coupons/redeem", json={"code": code}).status_code == 403
    assert owner.post("/api/v1/coupons/validate", json={"code": code}, headers=ORIGIN).json()["valid"]
    first = owner.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN)
    assert first.status_code == 200, first.text
    assert first.json()["created"] is True
    again = owner.post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN)
    assert again.status_code == 200 and again.json()["created"] is False
    assert again.json()["entry"]["id"] == first.json()["entry"]["id"]
    assert len(owner.get("/api/v1/users/me/entries").json()) == 1
    assert len(owner.get("/api/v1/users/me/coupons").json()) == 1
    assert stranger.get("/api/v1/users/me/entries").json() == []
    progress = owner.get("/api/v1/campaigns/featured/progress").json()
    assert progress["id"] == str(campaign_id) and progress["current_entries"] == 1 and progress["remaining"] == 0 and progress["status"] == "closed"


def test_expired_closed_full_and_transitions(database):
    _, _, codes, tokens = seed(database, expired=True)
    owner = client(tokens[0])
    assert owner.post("/api/v1/coupons/validate", json={"code": codes[0]}, headers=ORIGIN).json()["valid"] is False
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN).status_code == 409
    with database() as db:
        coupon = db.execute(select(Coupon).where(Coupon.code == codes[0])).scalar_one()
        coupon.valid_until = redemption.utcnow()+timedelta(days=1)
        campaign = db.get(Campaign, coupon.campaign_id)
        campaign.status = "closed"
        db.commit()
    assert owner.post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN).status_code == 409
    assert campaign.current_entries == 0
    assert redemption.TRANSITIONS["closed"] == {"completed"}
    with pytest.raises(ValueError):
        redemption.transition_campaign(campaign, "open")


def test_simultaneous_same_coupon_has_one_entry(database):
    campaign_id, _, codes, tokens = seed(database, capacity=2)
    def request(_):
        return client(tokens[0]).post("/api/v1/coupons/redeem", json={"code": codes[0]}, headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=8) as workers:
        results = list(workers.map(request, range(8)))
    assert all(result.status_code == 200 for result in results), [result.text for result in results]
    assert sum(result.json()["created"] for result in results) == 1
    with database() as db:
        assert db.scalar(select(func.count()).select_from(Entry)) == 1
        assert db.get(Campaign, campaign_id).current_entries == 1


def test_concurrent_final_slots_never_exceed_capacity(database):
    campaign_id, _, codes, tokens = seed(database, capacity=2, coupon_count=8)
    def request(code):
        return client(tokens[0]).post("/api/v1/coupons/redeem", json={"code": code}, headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=8) as workers:
        results = list(workers.map(request, codes))
    assert sum(result.status_code == 200 for result in results) == 2
    assert all(result.status_code in (200, 409) for result in results)
    with database() as db:
        campaign = db.get(Campaign, campaign_id)
        assert campaign.current_entries == 2 and campaign.status == "closed"
        assert db.scalar(select(func.count()).select_from(Entry)) == 2
        assert db.scalar(select(func.count()).select_from(Coupon).where(Coupon.status == "redeemed")) == 2


def test_failed_flush_rolls_back_coupon_and_capacity(database, monkeypatch):
    campaign_id, user_id, codes, _ = seed(database, capacity=2, coupon_count=2)
    with database() as db:
        redemption.redeem(db, codes[0], user_id)
    with database() as db:
        first_code = db.scalar(select(Entry.entry_code))
    monkeypatch.setattr(redemption, "generate_entry_code", lambda: first_code)
    with database() as db, pytest.raises(Exception):
        redemption.redeem(db, codes[1], user_id)
    with database() as db:
        assert db.get(Campaign, campaign_id).current_entries == 1
        assert db.scalar(select(Coupon.status).where(Coupon.code == codes[1])) == "active"
        assert db.scalar(select(func.count()).select_from(Entry)) == 1


def test_database_rejects_duplicate_coupon_entry_and_over_capacity(database):
    campaign_id, user_id, codes, _ = seed(database, capacity=1)
    with database() as db:
        redemption.redeem(db, codes[0], user_id)
    with database() as db:
        coupon = db.scalar(select(Coupon).where(Coupon.code == codes[0]))
        db.add(Entry(entry_code=redemption.generate_entry_code(), coupon_id=coupon.id, campaign_id=campaign_id, user_id=user_id))
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
        campaign = db.get(Campaign, campaign_id)
        campaign.current_entries = 2
        with pytest.raises(IntegrityError):
            db.commit()


def test_database_rejects_two_featured_campaigns(database):
    seed(database)
    now = redemption.utcnow()
    with database() as db:
        db.add(Campaign(name="Another featured campaign", destination="Kenya", prize_value=100,
                        max_capacity=2, current_entries=0, winner_count=1, is_featured=True,
                        status="open", start_date=now-timedelta(days=1), end_date=now+timedelta(days=1), updated_at=now))
        with pytest.raises(IntegrityError):
            db.commit()
