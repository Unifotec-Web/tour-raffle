"""Publishable data and private lookup tests on disposable PostgreSQL."""
import os
import hashlib
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.api.public_data import LOOKUP_LIMIT
from app.core.database import get_db
from app.core.security import new_session_token, token_digest
from app.main import app
from app.models.models import AuthSession, Campaign, Coupon, DrawRun, DrawWinner, Entry, Order, User
from app.services.redemption import utcnow

URL = os.environ.get("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="Requires disposable PostgreSQL verification database")
ORIGIN = {"Origin": "http://localhost:3000"}


@pytest.fixture
def db_session():
    target = make_url(URL)
    if (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
        raise RuntimeError("Tests require disposable localhost Compose database")
    engine = create_engine(URL)
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE users, campaigns RESTART IDENTITY CASCADE"))
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    def override():
        with Session() as db:
            yield db
    app.dependency_overrides[get_db] = override
    yield Session
    app.dependency_overrides.clear()
    engine.dispose()


def fixture(Session):
    now = utcnow()
    with Session() as db:
        owner = User(email=f"owner-{uuid4()}@example.com", hashed_password="fixture", full_name="Owner Example", country="Kenya", role="user", is_active=True, is_verified=False, consented_at=now)
        other = User(email=f"other-{uuid4()}@example.com", hashed_password="fixture", full_name="Other", country="Kenya", role="user", is_active=True, is_verified=False, consented_at=now)
        db.add_all([owner, other]); db.flush()
        visible = Campaign(name="Public campaign", description="Published description", destination="Kenya", prize_value=Decimal("250.00"), currency="USD", max_capacity=3, winner_count=1, current_entries=1, status="open", is_featured=True, start_date=now-timedelta(days=1), end_date=now+timedelta(days=1), updated_at=now)
        draft = Campaign(name="Secret campaign", destination="Secret", prize_value=Decimal("500.00"), max_capacity=3, winner_count=1, status="draft", is_featured=False, start_date=now-timedelta(days=1), end_date=now+timedelta(days=1), updated_at=now)
        db.add_all([visible,draft]); db.flush()
        coupon = Coupon(code="TRF-OWNER-COUPON", campaign_id=visible.id, user_id=owner.id, status="registered", valid_until=now+timedelta(days=1))
        db.add(coupon); db.flush()
        entry = Entry(entry_code="ENT-OWNER-ENTRY", coupon_id=coupon.id, campaign_id=visible.id, user_id=owner.id, status="confirmed", entry_date=now)
        db.add(entry)
        order = Order(user_id=owner.id, campaign_id=visible.id, quantity=1, unit_amount=Decimal("10.00"), total_amount=Decimal("10.00"), currency="USD", paid_amount=Decimal("10.00"), paid_currency="USD", idempotency_key=str(uuid4()), provider="fake", status="issued", paid_at=now)
        order2 = Order(user_id=owner.id, campaign_id=visible.id, quantity=1, unit_amount=Decimal("10.00"), total_amount=Decimal("10.00"), currency="USD", paid_amount=Decimal("12.00"), paid_currency="CAD", idempotency_key=str(uuid4()), provider="fake", status="reconciliation_required", paid_at=now)
        db.add_all([order,order2])
        tokens=[]
        for person in (owner,other):
            token=new_session_token(); db.add(AuthSession(user_id=person.id, token_hash=token_digest(token), expires_at=now+timedelta(hours=1)));tokens.append(token)
        seed=b"s"*32
        run=DrawRun(campaign_id=visible.id,status="approved",seed=seed,seed_hash=hashlib.sha256(seed).hexdigest(),algorithm_version="test",prepared_by=owner.id,prepared_at=now,approved_by=owner.id,approved_at=now)
        db.add(run);db.flush();db.add(DrawWinner(run_id=run.id,rank=1,entry_id=entry.id,user_id=owner.id));db.flush()
        run.status="completed";run.executed_at=now;run.executed_by=owner.id
        db.commit()
        return visible.id,draft.id,tokens,run.id


def client(token=None):
    api=TestClient(app)
    if token: api.cookies.set("tour_raffle_session",token)
    return api


def test_public_visibility_and_minimal_fields(db_session):
    visible,draft,_,_=fixture(db_session)
    public=client()
    rows=public.get("/api/v1/campaigns/public").json()
    assert len(rows)==1 and rows[0]["id"]==str(visible)
    assert rows[0]["current_entries"]==1 and rows[0]["available_checkout_slots"]==2
    assert not ({"user_id","coupon_code","entry_code","seed","email"}&set(rows[0]))
    assert public.get(f"/api/v1/campaigns/public/{draft}").status_code==404
    assert public.get(f"/api/v1/campaigns/public/{uuid4()}").status_code==404
    assert public.get("/api/v1/campaigns/public/not-an-id").status_code==422


def test_owner_lookup_privacy_and_rate_limit(db_session):
    _,_,tokens,run_id=fixture(db_session)
    owner,other=client(tokens[0]),client(tokens[1])
    assert client().post("/api/v1/users/me/entries/check",json={"code":"TRF-OWNER-COUPON"},headers=ORIGIN).status_code==401
    assert owner.post("/api/v1/users/me/entries/check",json={"code":"TRF-OWNER-COUPON"}).status_code==403
    assert owner.post("/api/v1/users/me/entries/check",json={"code":"TRF-OWNER-COUPON"},headers=ORIGIN).json()["status"]=="registered"
    assert owner.post("/api/v1/users/me/entries/check",json={"code":"ENT-OWNER-ENTRY"},headers=ORIGIN).json()["status"]=="confirmed"
    foreign=other.post("/api/v1/users/me/entries/check",json={"code":"TRF-OWNER-COUPON"},headers=ORIGIN).json()
    unknown=other.post("/api/v1/users/me/entries/check",json={"code":"TRF-UNKNOWN-CODE"},headers=ORIGIN).json()
    assert foreign==unknown=={"found":False}
    assert owner.post("/api/v1/users/me/wins/check",json={"code":"ENT-OWNER-ENTRY"},headers=ORIGIN).json()=={"found":False}
    with db_session() as db:
        run=db.get(DrawRun,run_id);run.status="published";run.published_at=utcnow();db.commit()
    assert owner.post("/api/v1/users/me/wins/check",json={"code":"ENT-OWNER-ENTRY"},headers=ORIGIN).json()["rank"]==1
    assert other.post("/api/v1/users/me/wins/check",json={"code":"ENT-OWNER-ENTRY"},headers=ORIGIN).json()=={"found":False}
    for _ in range(LOOKUP_LIMIT-2):
        assert other.post("/api/v1/users/me/entries/check",json={"code":"TRF-UNKNOWN-CODE"},headers=ORIGIN).status_code==200
    assert other.post("/api/v1/users/me/entries/check",json={"code":"TRF-UNKNOWN-CODE"},headers=ORIGIN).status_code==429


def test_dashboard_owner_totals_and_activity(db_session):
    _,_,tokens,_=fixture(db_session)
    owner=client(tokens[0]).get("/api/v1/users/me/overview")
    assert owner.status_code==200
    data=owner.json()
    assert data["full_name"]=="Owner Example" and data["coupon_count"]==1 and data["confirmed_entry_count"]==1
    assert data["paid_totals"]=={"CAD":"12.00","USD":"10.00"}
    assert len(data["recent_activity"])==3
    other=client(tokens[1]).get("/api/v1/users/me/overview").json()
    assert other["coupon_count"]==0 and other["confirmed_entry_count"]==0 and other["paid_totals"]=={} and other["recent_activity"]==[]


def test_concurrent_lookups_share_one_database_limit(db_session):
    _,_,tokens,_=fixture(db_session)
    def attempt(_):
        return client(tokens[1]).post("/api/v1/users/me/wins/check",json={"code":"ENT-UNKNOWN-CODE"},headers=ORIGIN).status_code
    with ThreadPoolExecutor(max_workers=8) as pool:
        statuses=list(pool.map(attempt,range(LOOKUP_LIMIT+5)))
    assert statuses.count(200)==LOOKUP_LIMIT
    assert statuses.count(429)==5
