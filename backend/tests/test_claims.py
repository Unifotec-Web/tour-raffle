"""Published winner claims, review races, and audit consistency on PostgreSQL."""
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import UUID, uuid4
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, text

from app.core.config import settings
from app.core.security import new_session_token, token_digest
from app.main import app
from app.models.models import AuditLog, AuthSession, ClaimEvent, DrawRun, DrawSnapshot, DrawWinner, User, WinnerClaim
from app.services.redemption import utcnow
from test_admin_campaigns import ORIGIN, client, database, users
from test_draws import fixture_campaign


@pytest.fixture(autouse=True)
def local_draw_and_claim_config(monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "test")
    monkeypatch.setattr(settings, "ENABLE_LOCAL_DRAW", True)
    monkeypatch.setattr(settings, "CLAIM_REQUIRE_PHONE", False)
    monkeypatch.setattr(settings, "CLAIM_REQUIRE_PREFERENCE_NOTE", False)


def published_win(Session, publish=True):
    admin_data, other_data = users(Session)
    admin = client(admin_data[2]); other = client(other_data[2])
    cid = fixture_campaign(Session, owner_count=2, winner_count=1)
    url = f"/api/v1/admin/draws/{cid}"
    for action in ("prepare", "approve", "execute"):
        result = admin.post(url + "/" + action, headers=ORIGIN)
        assert result.status_code == 200, result.text
    with Session() as db:
        winner = db.scalar(select(DrawWinner))
        token = new_session_token()
        db.add(AuthSession(user_id=winner.user_id, token_hash=token_digest(token), expires_at=utcnow()+timedelta(hours=1)))
        db.commit()
        winner_id = winner.id; run_id = winner.run_id
    if publish:
        assert admin.post(url + "/publish", headers=ORIGIN).status_code == 200
    return admin, other, client(token), cid, winner_id, run_id


def submit(owner, winner_id):
    return owner.post(f"/api/v1/wins/{winner_id}/claims", json={}, headers=ORIGIN)


def review(admin, claim_id, expected, target, reason="Recorded administrative review", **extra):
    return admin.post(f"/api/v1/admin/claims/{claim_id}/review",
                      json={"expected_status":expected,"status":target,"reason":reason,**extra}, headers=ORIGIN)


def test_published_owner_only_claim_and_concurrent_submission(database):
    admin, other, owner, cid, winner_id, run_id = published_win(database, publish=False)
    assert owner.get("/api/v1/claims/mine").json() == []
    assert submit(owner, winner_id).status_code == 404
    assert admin.post(f"/api/v1/admin/draws/{cid}/publish", headers=ORIGIN).status_code == 200
    public = TestClient(app).get("/api/v1/draws/published").json()
    assert public and "winners" not in public[0] and "user_id" not in str(public)
    assert TestClient(app).get("/api/v1/claims/mine").status_code == 401
    assert other.get("/api/v1/claims/mine").json() == []
    assert other.post(f"/api/v1/wins/{winner_id}/claims", json={}, headers=ORIGIN).status_code == 404
    assert owner.post(f"/api/v1/wins/{winner_id}/claims", json={}).status_code == 403
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda _: submit(owner, winner_id), range(6)))
    assert sorted(r.status_code for r in results) == [200]*5+[201], [r.text for r in results]
    ids = {r.json()["id"] for r in results}
    assert len(ids) == 1
    claim_id = UUID(ids.pop())
    assert owner.get("/api/v1/claims/mine").json()[0]["claim_id"] == str(claim_id)
    assert other.get(f"/api/v1/claims/{claim_id}").status_code == 404
    assert other.get("/api/v1/admin/claims").status_code == 403
    assert admin.get("/api/v1/admin/claims?status=submitted&limit=1").json()["total"] == 1
    with database() as db:
        assert db.scalar(select(func.count()).select_from(WinnerClaim)) == 1
        assert db.scalar(select(func.count()).select_from(ClaimEvent)) == 1
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "claim.submit")) == 1
        duplicate = WinnerClaim(winner_id=winner_id, user_id=db.get(WinnerClaim, claim_id).user_id,
                                status="submitted", contact_name="Duplicate", contact_email="d@example.com",
                                submitted_at=utcnow(), updated_at=utcnow())
        db.add(duplicate)
        with pytest.raises(Exception): db.commit()
        db.rollback()
        assert db.get(DrawSnapshot, run_id).hash


def test_review_race_transitions_member_response_and_fulfillment(database):
    admin, other, owner, _, winner_id, _ = published_win(database)
    claim_id = submit(owner, winner_id).json()["id"]
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda target: review(admin, claim_id, "submitted", target), ["under_review", "needs_information"]))
    assert sorted(r.status_code for r in responses) == [200,409], [r.text for r in responses]
    status = admin.get(f"/api/v1/admin/claims/{claim_id}").json()["status"]
    if status == "submitted": pytest.fail("review was not committed")
    if status == "under_review":
        assert review(admin, claim_id, "under_review", "needs_information", "Please provide a contact update").status_code == 200
    assert owner.get(f"/api/v1/claims/{claim_id}").json()["status"] == "needs_information"
    assert other.post(f"/api/v1/claims/{claim_id}/response", json={"message":"My new contact details are available"}, headers=ORIGIN).status_code == 404
    response = owner.post(f"/api/v1/claims/{claim_id}/response", json={"message":"Please use the updated phone number", "phone":"+254700000000"}, headers=ORIGIN)
    assert response.status_code == 200 and response.json()["status"] == "submitted"
    assert owner.post(f"/api/v1/claims/{claim_id}/response", json={"message":"Repeat response"}, headers=ORIGIN).status_code == 409
    assert review(admin, claim_id, "submitted", "approved").status_code == 409
    assert review(admin, claim_id, "submitted", "under_review").status_code == 200
    assert review(admin, claim_id, "under_review", "approved").status_code == 200
    assert review(admin, claim_id, "approved", "fulfilled", fulfillment_reference="ref", fulfillment_evidence="evidence").status_code == 409
    assert review(admin, claim_id, "approved", "fulfillment_pending").status_code == 200
    assert review(admin, claim_id, "fulfillment_pending", "fulfilled").status_code == 422
    assert review(admin, claim_id, "fulfillment_pending", "fulfilled", fulfillment_reference="", fulfillment_evidence="Delivered").status_code == 422
    final = review(admin, claim_id, "fulfillment_pending", "fulfilled", fulfillment_reference="local-voucher-123", fulfillment_evidence="Local handoff record verified")
    assert final.status_code == 200 and final.json()["status"] == "fulfilled"
    assert final.json()["fulfillment_reference"] == "local-voucher-123"
    assert review(admin, claim_id, "fulfilled", "under_review").status_code == 409
    with database() as db:
        claim = db.get(WinnerClaim, UUID(claim_id))
        assert claim.fulfillment_evidence == "Local handoff record verified"
        events = db.scalars(select(ClaimEvent).where(ClaimEvent.claim_id == claim.id)).all()
        audits = db.scalars(select(AuditLog).where(AuditLog.details.contains(claim_id), AuditLog.action.like("claim.%"))).all()
        assert len(events) == len(audits)
        assert len(events) >= 7
        with pytest.raises(Exception):
            db.execute(text("UPDATE winner_claims SET fulfillment_reference = NULL WHERE id = :id"), {"id":claim_id})
        db.rollback()


def test_configurable_requirements_and_rejection(database, monkeypatch):
    admin, other, owner, _, winner_id, _ = published_win(database)
    monkeypatch.setattr(settings, "CLAIM_REQUIRE_PHONE", True)
    requirements = owner.get("/api/v1/claims/requirements").json()
    assert requirements["phone_required"] and requirements["claim_deadline"] is None
    assert submit(owner, winner_id).status_code == 422
    created = owner.post(f"/api/v1/wins/{winner_id}/claims", json={"phone":"+254700000001"}, headers=ORIGIN)
    assert created.status_code == 201
    cid = created.json()["id"]
    assert other.post(f"/api/v1/admin/claims/{cid}/review", json={"expected_status":"submitted","status":"rejected","reason":"Fixture rejection"}, headers=ORIGIN).status_code == 403
    assert review(admin, cid, "submitted", "rejected", "        ").status_code == 422
    assert review(admin, cid, "submitted", "rejected", "Claim cannot be approved in fixture").status_code == 200
    assert review(admin, cid, "rejected", "under_review").status_code == 409


def test_database_transition_guard_and_audit_failure_rollback(database):
    admin, _, owner, _, winner_id, _ = published_win(database)
    claim_id = submit(owner, winner_id).json()["id"]
    with database() as db:
        event_id = db.scalar(select(ClaimEvent.id).where(ClaimEvent.claim_id == UUID(claim_id)))
        with pytest.raises(Exception):
            db.execute(text("UPDATE claim_events SET reason = 'tampered' WHERE id = :id"), {"id":str(event_id)})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text("UPDATE winner_claims SET status = 'fulfilled', fulfillment_reference = 'ref', fulfillment_evidence = 'proof' WHERE id = :id"), {"id":claim_id})
        db.rollback()
        with pytest.raises(Exception):
            db.execute(text("UPDATE winner_claims SET user_id = :id WHERE id = :claim"), {"id":str(uuid4()), "claim":claim_id})
        db.rollback()
    with patch("app.api.claims.audit", side_effect=RuntimeError("audit interrupted")):
        with pytest.raises(RuntimeError):
            review(admin, claim_id, "submitted", "under_review")
    with database() as db:
        claim = db.get(WinnerClaim, UUID(claim_id))
        assert claim.status == "submitted"
        assert db.scalar(select(func.count()).select_from(ClaimEvent).where(ClaimEvent.claim_id == claim.id)) == 1
        assert db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "claim.review")) == 0
