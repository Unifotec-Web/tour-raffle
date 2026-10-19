"""Published winner claims and transactional review history."""
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_admin, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.models import AuditLog, Campaign, ClaimEvent, DrawRun, DrawWinner, Entry, User, WinnerClaim
from app.services.redemption import utcnow

router = APIRouter(tags=["winner claims"])
ALLOWED = {
    "submitted": {"under_review", "needs_information", "rejected"},
    "under_review": {"needs_information", "approved", "rejected"},
    "needs_information": {"under_review", "rejected"},
    "approved": {"fulfillment_pending"},
    "fulfillment_pending": {"fulfilled"},
    "rejected": set(), "fulfilled": set(),
}


class SubmitClaim(BaseModel):
    phone: str | None = Field(None, max_length=40)
    preference_note: str | None = Field(None, max_length=2000)


class MemberResponse(BaseModel):
    message: str = Field(min_length=8, max_length=2000)
    phone: str | None = Field(None, max_length=40)
    preference_note: str | None = Field(None, max_length=2000)

    @field_validator("message")
    @classmethod
    def nonblank_message(cls, value: str):
        if len(value.strip()) < 8:
            raise ValueError("Response must contain at least eight non-space characters")
        return value.strip()


class ReviewClaim(BaseModel):
    expected_status: str = Field(pattern="^(submitted|under_review|needs_information|approved|rejected|fulfillment_pending|fulfilled)$")
    status: str = Field(pattern="^(under_review|needs_information|approved|rejected|fulfillment_pending|fulfilled)$")
    reason: str = Field(min_length=8, max_length=2000)
    fulfillment_reference: str | None = Field(None, max_length=255)
    fulfillment_evidence: str | None = Field(None, max_length=2000)

    @field_validator("reason")
    @classmethod
    def nonblank_reason(cls, value: str):
        if len(value.strip()) < 8:
            raise ValueError("Review reason must contain at least eight non-space characters")
        return value.strip()


@router.get("/claims/requirements")
def claim_requirements():
    return {"phone_required": settings.CLAIM_REQUIRE_PHONE,
            "preference_note_required": settings.CLAIM_REQUIRE_PREFERENCE_NOTE,
            "document_upload_available": False, "claim_deadline": None}


def event_history(db: Session, claim_id: UUID, private: bool):
    rows = db.scalars(select(ClaimEvent).where(ClaimEvent.claim_id == claim_id).order_by(ClaimEvent.created_at, ClaimEvent.id)).all()
    return [{"from_status": row.from_status, "to_status": row.to_status,
             "reason": row.reason if private or row.to_status == "needs_information" or (row.from_status == "needs_information" and row.to_status == "submitted") else None,
             "actor_email": row.actor_email if private else None,
             "fulfillment_reference": row.fulfillment_reference if private else None,
             "created_at": row.created_at.isoformat()} for row in rows]


def claim_response(db: Session, claim: WinnerClaim, private: bool = False):
    winner = db.get(DrawWinner, claim.winner_id)
    run = db.get(DrawRun, winner.run_id)
    campaign = db.get(Campaign, run.campaign_id)
    data = {"id": str(claim.id), "winner_id": str(claim.winner_id), "campaign_id": str(campaign.id),
            "campaign_name": campaign.name, "rank": winner.rank, "status": claim.status,
            "submitted_at": claim.submitted_at.isoformat(), "updated_at": claim.updated_at.isoformat(),
            "history": event_history(db, claim.id, private)}
    if private:
        data.update({"owner_email": db.get(User, claim.user_id).email, "contact_name": claim.contact_name,
                     "contact_email": claim.contact_email, "phone": claim.phone,
                     "preference_note": claim.preference_note,
                     "fulfillment_reference": claim.fulfillment_reference,
                     "fulfillment_evidence": claim.fulfillment_evidence})
    return data


def audit(db: Session, actor: User, request: Request, action: str, claim: WinnerClaim, extra: dict):
    db.add(AuditLog(admin_email=actor.email, action=action,
                    details=json.dumps({"claim_id": str(claim.id), "winner_id": str(claim.winner_id), **extra}, sort_keys=True),
                    ip_address=request.client.host if request.client else "local", created_at=utcnow()))


@router.get("/claims/mine")
def my_wins(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(DrawWinner, DrawRun, Campaign, Entry, WinnerClaim)
                      .join(DrawRun, DrawRun.id == DrawWinner.run_id)
                      .join(Campaign, Campaign.id == DrawRun.campaign_id)
                      .join(Entry, Entry.id == DrawWinner.entry_id)
                      .outerjoin(WinnerClaim, WinnerClaim.winner_id == DrawWinner.id)
                      .where(DrawWinner.user_id == user.id, DrawRun.status == "published")
                      .order_by(DrawRun.published_at.desc(), DrawWinner.rank)).all()
    return [{"winner_id": str(w.id), "campaign_id": str(c.id), "campaign_name": c.name,
             "rank": w.rank, "entry_code": e.entry_code, "published_at": run.published_at.isoformat(),
             "claim_id": str(claim.id) if claim else None,
             "claim_status": claim.status if claim else "not_submitted"} for w, run, c, e, claim in rows]


@router.post("/wins/{winner_id}/claims", status_code=201)
def submit_claim(winner_id: UUID, payload: SubmitClaim, request: Request, response: Response,
                 user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    if settings.CLAIM_REQUIRE_PHONE and not (payload.phone or "").strip():
        raise HTTPException(422, "Phone is required by current claim configuration")
    if settings.CLAIM_REQUIRE_PREFERENCE_NOTE and not (payload.preference_note or "").strip():
        raise HTTPException(422, "Preference note is required by current claim configuration")
    try:
        winner = db.scalar(select(DrawWinner).where(DrawWinner.id == winner_id).with_for_update().execution_options(populate_existing=True))
        if winner is None or winner.user_id != user.id or db.get(DrawRun, winner.run_id).status != "published":
            raise HTTPException(404, "Published win not found")
        existing = db.scalar(select(WinnerClaim).where(WinnerClaim.winner_id == winner_id))
        if existing:
            response.status_code = 200
            db.commit()
            return claim_response(db, existing)
        now = utcnow()
        claim = WinnerClaim(winner_id=winner_id, user_id=user.id, status="submitted",
                            contact_name=user.full_name, contact_email=user.email,
                            phone=(payload.phone or "").strip() or None,
                            preference_note=(payload.preference_note or "").strip() or None,
                            submitted_at=now, updated_at=now)
        db.add(claim); db.flush()
        db.add(ClaimEvent(claim_id=claim.id, actor_id=user.id, actor_email=user.email,
                          from_status=None, to_status="submitted", reason="Winner submitted claim", created_at=now))
        audit(db, user, request, "claim.submit", claim, {"status": "submitted"})
        db.commit()
        return claim_response(db, claim)
    except Exception:
        db.rollback()
        raise


@router.get("/claims/{claim_id}")
def member_claim(claim_id: UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    claim = db.get(WinnerClaim, claim_id)
    if claim is None or claim.user_id != user.id:
        raise HTTPException(404, "Claim not found")
    return claim_response(db, claim)


@router.post("/claims/{claim_id}/response")
def member_response(claim_id: UUID, payload: MemberResponse, request: Request,
                    user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        claim = db.scalar(select(WinnerClaim).where(WinnerClaim.id == claim_id).with_for_update().execution_options(populate_existing=True))
        if claim is None or claim.user_id != user.id:
            raise HTTPException(404, "Claim not found")
        if claim.status != "needs_information":
            raise HTTPException(409, "Claim is not waiting for information")
        now = utcnow()
        claim.status = "submitted"; claim.updated_at = now
        if payload.phone is not None: claim.phone = payload.phone.strip() or None
        if payload.preference_note is not None: claim.preference_note = payload.preference_note.strip() or None
        db.add(ClaimEvent(claim_id=claim.id, actor_id=user.id, actor_email=user.email,
                          from_status="needs_information", to_status="submitted",
                          reason=payload.message.strip(), created_at=now))
        audit(db, user, request, "claim.member_response", claim, {"from": "needs_information", "to": "submitted"})
        db.commit()
        return claim_response(db, claim)
    except Exception:
        db.rollback()
        raise


@router.get("/admin/claims")
def admin_claims(status: str | None = Query(None, pattern="^(submitted|under_review|needs_information|approved|rejected|fulfillment_pending|fulfilled)$"),
                 campaign_id: UUID | None = None, limit: int = Query(25, ge=1, le=100),
                 offset: int = Query(0, ge=0), _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    query = select(WinnerClaim)
    if status: query = query.where(WinnerClaim.status == status)
    if campaign_id: query = query.join(DrawWinner, DrawWinner.id == WinnerClaim.winner_id).join(DrawRun, DrawRun.id == DrawWinner.run_id).where(DrawRun.campaign_id == campaign_id)
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    claims = db.scalars(query.order_by(WinnerClaim.submitted_at.desc(), WinnerClaim.id.desc()).limit(limit).offset(offset)).all()
    return {"items": [claim_response(db, claim, True) for claim in claims], "total": total, "limit": limit, "offset": offset}


@router.get("/admin/claims/{claim_id}")
def admin_claim(claim_id: UUID, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    claim = db.get(WinnerClaim, claim_id)
    if claim is None: raise HTTPException(404, "Claim not found")
    return claim_response(db, claim, True)


@router.post("/admin/claims/{claim_id}/review")
def review_claim(claim_id: UUID, payload: ReviewClaim, request: Request,
                 admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        claim = db.scalar(select(WinnerClaim).where(WinnerClaim.id == claim_id).with_for_update().execution_options(populate_existing=True))
        if claim is None: raise HTTPException(404, "Claim not found")
        if claim.status != payload.expected_status:
            raise HTTPException(409, "Claim status changed; refresh before reviewing")
        if payload.status not in ALLOWED[claim.status]:
            raise HTTPException(409, "Claim status transition is not allowed")
        if payload.status == "fulfilled":
            if not (payload.fulfillment_reference or "").strip() or not (payload.fulfillment_evidence or "").strip():
                raise HTTPException(422, "Fulfillment requires a recorded reference and evidence")
            claim.fulfillment_reference = payload.fulfillment_reference.strip()
            claim.fulfillment_evidence = payload.fulfillment_evidence.strip()
        elif payload.fulfillment_reference or payload.fulfillment_evidence:
            raise HTTPException(422, "Fulfillment evidence is accepted only when marking fulfilled")
        previous = claim.status; now = utcnow()
        claim.status = payload.status; claim.updated_at = now
        db.add(ClaimEvent(claim_id=claim.id, actor_id=admin.id, actor_email=admin.email,
                          from_status=previous, to_status=payload.status,
                          reason=payload.reason.strip(), fulfillment_reference=claim.fulfillment_reference if payload.status == "fulfilled" else None,
                          created_at=now))
        audit(db, admin, request, "claim.review", claim,
              {"from": previous, "to": payload.status, "reason": payload.reason.strip(),
               "fulfillment_reference": claim.fulfillment_reference if payload.status == "fulfilled" else None})
        db.commit()
        return claim_response(db, claim, True)
    except Exception:
        db.rollback()
        raise
