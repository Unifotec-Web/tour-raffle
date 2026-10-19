"""PostgreSQL recovery and authorization checks for local draw execution."""
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
import hashlib
import json
from threading import Barrier
from uuid import uuid4
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text

from app.core.config import settings
from app.main import app
from app.models.models import AuditLog, Campaign, Coupon, DrawRun, DrawSnapshot, DrawWinner, Entry, User
from app.services.draw import ALGORITHM_VERSION, canonical, digest, select_winners
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
    assert prepared.json()['seed_hash'] is None
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
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        assert run.seed is None and run.seed_hash is None
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 0
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        snapshot = db.get(DrawSnapshot, run.id)
        expected = select_winners(snapshot.content, run.seed)
        assert digest(snapshot.content) == snapshot.hash
        assert len(run.seed) == 32 and hashlib.sha256(run.seed).hexdigest() == run.seed_hash
        assert snapshot.content == canonical(json.loads(snapshot.content))
        assert [e['entry_id'] for e in json.loads(snapshot.content)['entries']] == sorted(e['entry_id'] for e in json.loads(snapshot.content)['entries'])
        with pytest.raises(Exception):
            db.execute(text("UPDATE draw_runs SET seed = :seed WHERE id = :id"), {'seed':b'0'*32, 'id':str(run.id)})
        db.rollback()
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


def test_version_fail_closed_and_unique_run(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    cid = fixture_campaign(database, owner_count=2, winner_count=1)
    url = f'/api/v1/admin/draws/{cid}'
    prepared = admin.post(url+'/prepare', headers=ORIGIN)
    assert prepared.status_code == 200
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        snapshot = db.get(DrawSnapshot, run.id)
        assert snapshot.hash == digest(snapshot.content)
        with pytest.raises(Exception):
            db.execute(text('UPDATE draw_snapshots SET content = :value WHERE run_id = :id'), {'value':'{}', 'id':str(run.id)})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text('UPDATE draw_runs SET seed = :seed, seed_hash = :hash WHERE id = :id'), {'seed':b'1'*32, 'hash':hashlib.sha256(b'1'*32).hexdigest(), 'id':str(run.id)})
        db.rollback()
        db.add(DrawRun(campaign_id=cid, status='prepared', algorithm_version=ALGORITHM_VERSION, prepared_by=admin_data[0], prepared_at=utcnow()))
        with pytest.raises(Exception):
            db.commit()
        db.rollback()
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    with patch('app.services.draw.ALGORITHM_VERSION', 'future-version'):
        blocked = admin.post(url+'/execute', headers=ORIGIN)
    assert blocked.status_code == 409
    with database() as db:
        assert db.scalar(select(DrawRun.status).where(DrawRun.campaign_id == cid)) == 'approved'
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 0
    assert admin.post(url+'/execute', headers=ORIGIN).status_code == 200


def test_concurrent_prepare_and_approval_use_one_snapshot_and_seed(database):
    admin_data, _ = users(database)
    cid = fixture_campaign(database, owner_count=3, winner_count=2)
    url = f'/api/v1/admin/draws/{cid}'
    def action(stage):
        return client(admin_data[2]).post(url+'/'+stage, headers=ORIGIN)
    for stage in ('prepare', 'approve'):
        with ThreadPoolExecutor(max_workers=5) as pool:
            responses = list(pool.map(action, [stage]*5))
        assert all(r.status_code == 200 for r in responses), [r.text for r in responses]
        assert len({r.json()['id'] for r in responses}) == 1
        assert len({r.json()['snapshot_hash'] for r in responses}) == 1
        assert len({r.json()['seed_hash'] for r in responses}) == 1
    with database() as db:
        assert db.scalar(select(func.count()).select_from(DrawRun)) == 1
        run = db.scalar(select(DrawRun))
        assert run.status == 'approved' and len(run.seed) == 32
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.prepare')) == 1
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.approve')) == 1


def test_multiple_entries_are_weighted_but_participant_wins_once(database):
    admin_data, _ = users(database)
    cid = fixture_campaign(database, owner_count=2, winner_count=2)
    with database() as db:
        first = db.scalar(select(Entry).where(Entry.campaign_id == cid).order_by(Entry.id))
        coupon = Coupon(code=f'C-{uuid4()}', campaign_id=cid, user_id=first.user_id, status='redeemed', valid_until=utcnow()+timedelta(days=1))
        db.add(coupon)
        db.flush()
        db.add(Entry(entry_code=f'E-{uuid4()}', coupon_id=coupon.id, campaign_id=cid, user_id=first.user_id, status='confirmed', entry_date=utcnow()))
        db.get(Campaign, cid).current_entries = 3
        db.commit()
        weighted_user = str(first.user_id)
    admin = client(admin_data[2])
    assert admin.post(f'/api/v1/admin/draws/{cid}/prepare', headers=ORIGIN).status_code == 200
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        snapshot = db.get(DrawSnapshot, run.id)
        assert snapshot.entry_count == 3 and snapshot.participant_count == 2
        weighted_first = 0
        for i in range(1024):
            seed = hashlib.sha256(f'fixed-vector-{i}'.encode()).digest()
            winners = select_winners(snapshot.content, seed, run.algorithm_version)
            assert len({winner['user_id'] for winner in winners}) == 2
            weighted_first += winners[0]['user_id'] == weighted_user
        assert 600 < weighted_first < 730  # Fixed seeds exercise the 2/3 first-pick weighting.


def test_hash_check_rejects_privileged_snapshot_tampering(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    for stage in ('approve', 'execute'):
        cid = fixture_campaign(database, owner_count=2, winner_count=1)
        url = f'/api/v1/admin/draws/{cid}'
        assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 200
        if stage == 'execute':
            assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
        with database() as db:
            run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
            # Simulate a privileged operator bypassing the immutability trigger.
            db.execute(text('ALTER TABLE draw_snapshots DISABLE TRIGGER protect_draw_snapshots'))
            db.execute(text('UPDATE draw_snapshots SET content = :value WHERE run_id = :id'), {'value':'{}', 'id':str(run.id)})
            db.execute(text('ALTER TABLE draw_snapshots ENABLE TRIGGER protect_draw_snapshots'))
            db.commit()
        response = admin.post(url+'/'+stage, headers=ORIGIN)
        assert response.status_code == 409
        with database() as db:
            run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
            assert run.status == ('prepared' if stage == 'approve' else 'approved')
            assert db.scalar(select(func.count()).select_from(DrawWinner).where(DrawWinner.run_id == run.id)) == 0


def test_legacy_prepared_seed_is_not_silently_replaced(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    cid = fixture_campaign(database, owner_count=2, winner_count=1)
    old_seed = b'legacy-prepared-seed'.ljust(32, b'0')
    content = canonical({'rules': {'algorithm_version': ALGORITHM_VERSION, 'winner_count': 1}, 'entries': []})
    with database() as db:
        run = DrawRun(campaign_id=cid, status='prepared', seed=old_seed,
            seed_hash=hashlib.sha256(old_seed).hexdigest(), algorithm_version=ALGORITHM_VERSION,
            prepared_by=admin_data[0], prepared_at=utcnow())
        db.add(run)
        db.flush()
        db.add(DrawSnapshot(run_id=run.id, content=content, hash=digest(content),
            entry_count=0, participant_count=0, winner_count=1, created_at=utcnow()))
        db.commit()
    response = admin.post(f'/api/v1/admin/draws/{cid}/approve', headers=ORIGIN)
    assert response.status_code == 409
    assert 'manual review' in response.json()['detail']
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        assert run.status == 'prepared' and run.seed == old_seed
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.approve')) == 0


def test_postcommit_response_failure_and_concurrent_publication(database):
    admin_data, member_data = users(database)
    admin = client(admin_data[2])
    unrelated_member = client(member_data[2])
    cid = fixture_campaign(database, owner_count=3, winner_count=2)
    url = f'/api/v1/admin/draws/{cid}'
    assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 200
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    with patch('app.api.draws.detail', side_effect=RuntimeError('response lost')):
        with pytest.raises(RuntimeError):
            admin.post(url+'/execute', headers=ORIGIN)
    with database() as db:
        assert db.scalar(select(DrawRun.status).where(DrawRun.campaign_id == cid)) == 'completed'
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 2
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.failure')) == 0
    existing = admin.post(url+'/execute', headers=ORIGIN).json()['winners']
    assert unrelated_member.get('/api/v1/draws/mine').json() == []
    def publish(_):
        return client(admin_data[2]).post(url+'/publish', headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=4) as pool:
        responses = list(pool.map(publish, range(4)))
    assert all(r.status_code == 200 for r in responses), [r.text for r in responses]
    assert all(r.json()['winners'] == existing and r.json()['status'] == 'published' for r in responses)
    with database() as db:
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.publish')) == 1
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 2
    public = TestClient(app).get('/api/v1/draws/published').json()
    assert len(public) == 1
    assert TestClient(app).get('/api/v1/draws/mine').status_code == 401
    assert unrelated_member.get('/api/v1/draws/mine').json() == []
    encoded = json.dumps(public)
    for key in ('"seed"', 'entry_code', 'coupon_id', 'user_id', 'entry_id', 'winners'):
        assert key not in encoded


def test_execute_publish_race_never_exposes_partial_result(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    cid = fixture_campaign(database, owner_count=3, winner_count=2)
    url = f'/api/v1/admin/draws/{cid}'
    assert admin.post(url+'/prepare', headers=ORIGIN).status_code == 200
    assert admin.post(url+'/approve', headers=ORIGIN).status_code == 200
    gate = Barrier(2)
    def action(stage):
        gate.wait()
        return client(admin_data[2]).post(url+'/'+stage, headers=ORIGIN)
    with ThreadPoolExecutor(max_workers=2) as pool:
        execute_result, publish_result = list(pool.map(action, ('execute', 'publish')))
    assert execute_result.status_code == 200
    assert publish_result.status_code in (200, 409)
    with database() as db:
        run = db.scalar(select(DrawRun).where(DrawRun.campaign_id == cid))
        assert run.status == ('published' if publish_result.status_code == 200 else 'completed')
        assert db.scalar(select(func.count()).select_from(DrawWinner)) == 2
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.execute')) == 1
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == 'draw.publish')) == (1 if publish_result.status_code == 200 else 0)
    public = TestClient(app).get('/api/v1/draws/published').json()
    assert len(public) == (1 if publish_result.status_code == 200 else 0)


def test_reconciliation_and_open_campaign_rejected(database):
    admin_data, _ = users(database)
    admin = client(admin_data[2])
    open_id = fixture_campaign(database, owner_count=1, winner_count=1, status='open')
    with database() as db:
        db.get(Campaign, open_id).end_date = utcnow() + timedelta(days=1)
        db.commit()
    assert admin.post(f'/api/v1/admin/draws/{open_id}/prepare', headers=ORIGIN).status_code == 409
    with database() as db:
        db.get(Campaign, open_id).status = 'closed'
        db.get(Campaign, open_id).current_entries = 0
        db.commit()
    assert admin.post(f'/api/v1/admin/draws/{open_id}/prepare', headers=ORIGIN).status_code == 409
