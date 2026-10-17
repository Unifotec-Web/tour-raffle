"""PostgreSQL recovery and authorization checks for local draw execution."""
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text

from app.core.config import settings
from app.main import app
from app.models.models import AuditLog, Campaign, Coupon, DrawRun, DrawSnapshot, DrawWinner, Entry, User
from app.services.draw import digest, select_winners
from app.services.redemption import utcnow
from test_admin_campaigns import ORIGIN, client, database, users

pytestmark = pytest.mark.usefixtures("database")

@pytest.fixture(autouse=True)
def enable_draw():
    previous = settings.ENABLE_LOCAL_DRAW
    settings.ENABLE_LOCAL_DRAW = True
    yield
    settings.ENABLE_LOCAL_DRAW = previous


def fixture_campaign(Session, owner_count=3, entries_per_owner=1, winner_count=2, status='closed'):
    now = utcnow()
    with Session() as db:
        campaign = Campaign(name='Small draw', destination='Kenya', prize_value=100, coupon_price=10, currency='USD', max_capacity=max(10, owner_count * entries_per_owner), current_entries=owner_count * entries_per_owner, winner_count=winner_count, status=status, start_date=now-timedelta(days=2), end_date=now-timedelta(days=1), created_at=now, updated_at=now)
        db.add(campaign); db.flush()
        for n in range(owner_count):
            user = User(email=f'draw-{uuid4()}@example.com', hashed_password='fixture', full_name=f'P{n}', country='Kenya', role='user', is_active=True, consented_at=now)
            db.add(user); db.flush()
            for k in range(entries_per_owner):
                coupon = Coupon(code=f'C-{uuid4()}', campaign_id=campaign.id, user_id=user.id, status='redeemed', valid_until=now+timedelta(days=1))
                db.add(coupon); db.flush()
                db.add(Entry(entry_code=f'E-{uuid4()}', coupon_id=coupon.id, campaign_id=campaign.id, user_id=user.id, status='confirmed', entry_date=now))
        db.commit()
        return campaign.id


def test_prerequisites_permissions_and_production_guard(database):
    admin_data, member_data = users(database)
    admin, member = client(admin_data[2]), client(member_data[2])
    cid = fixture_campaign(database, owner_count=1, winner_count=2)
    url = f'/api/v1/admin/draws/{cid}'
    assert TestClient(app).post(url+'/prepare', headers=ORIGIN).status_code == 401
    assert member.post(url+'/prepare', headers=ORIGIN).status_code == 403
    assert admin.post(url+'/prepare').status_code == 403
    assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 409
    with database() as db:
        campaign = db.get(Campaign, cid)
        campaign.winner_count = 1
        db.commit()
    settings.ENABLE_LOCAL_DRAW = False
    try:
        assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 403
    finally:
        settings.ENABLE_LOCAL_DRAW = True
    settings.APP_ENV = 'production'
    try:
        assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 403
    finally:
        settings.APP_ENV = 'development'
    prepared = admin.post(url+'/prepare', headers=ORIGIN)
    assert prepared.status_code == 200, prepared.text
    assert prepared.json()['eligible_participants'] == 1
    assert admin.post(url+'/execute', headers=ORIGIN).status_code == 409
    assert admin.post(url+'/publish', headers=ORIGIN).status_code == 409
    with database() as db:
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 0
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    assert admin.post(url+'/execute', headers=ORIGIN).status_code == 200
    assert admin.get(url).status_code == 200
    assert member.get(url).status_code == 403
    assert admin.post(url+'/publish', headers=ORIGIN).status_code == 200
    assert len(TestClient(app).get('/api/v1/draws/published').json()) == 1


def test_retry_concurrency_immutability_and_recovery(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    cid = fixture_campaign(database, owner_count=3, entries_per_owner=2, winner_count=2)
    url = f'/api/v1/admin/draws/{cid}'
    prepared = admin.post(url+'/prepare', headers=ORIGIN).json()
    assert admin.post(url+'/prepare', headers=ORIGIN).json()['snapshot_hash'] == prepared['snapshot_hash']
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        snapshot = db.get(DrawSnapshot, run.id)
        expected = select_winners(snapshot.content, run.seed)
        assert digest(snapshot.content) == snapshot.hash
    # Failure after winner insertion is rolled back; the saved seed/snapshot remain.
    with patch('app.api.draws.log', side_effect=RuntimeError('interrupted')):
        with pytest.raises(RuntimeError):
            admin.post(url+'/execute', headers=ORIGIN)
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        assert run.status == 'approved'
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 0
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.failure')) == 1
    def execute(_):
        return client(admin_data[2]).post(url+'/execute', headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=4) as pool:
        responses = list(pool.map(execute, range(4)))
    assert all(r.status_code == 200 for r in responses), [r.text for r in responses]
    winners = responses[0].json()['winners']
    assert all(r.json()['winners'] == winners for r in responses)
    assert [w['entry_id'] for w in winners] == [w['entry_id'] for w in expected]
    assert len({w['user_id'] for w in winners}) == 2
    assert admin.post(url+'/execute', headers=ORIGIN).json()['winners'] == winners
    assert TestClient(app).get('/api/v1/draws/published').json() == []
    with database() as db:
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 2
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.execute')) == 1
        with pytest.raises(Exception):
            db.execute(text('UPDATE draw_snapshots SET hash = :h WHERE run_id = :id'), {'h':'0'*64, 'id':str(run.id)})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text('DELETE FROM draw_winners WHERE run_id = :id'), {'id':str(run.id)})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text("UPDATE draw_runs SET status = 'prepared' WHERE id = :id"), {'id':str(run.id)})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text('INSERT INTO draw_winners (id, run_id, rank, entry_id, user_id) SELECT gen_random_uuid(), :id, 99, entry_id, user_id FROM draw_winners WHERE run_id = :id LIMIT 1'), {'id':str(run.id)})
        db.rollback()


def test_reconciliation_and_open_campaign_rejected(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    open_id = fixture_campaign(database, owner_count=1, winner_count=1, status='open')
    assert admin.post(f'/api/v1/admin/draws/{open_id}/prepare', headers=ORIGIN).status_code == 409
    with database() as db:
        db.get(Campaign, open_id).status = 'closed'
        db.get(Campaign, open_id).current_entries = 0
        db.commit()
    assert admin.post(f'/api/v1/admin/draws/{open_id}/prepare', headers=ORIGIN).status_code == 409
