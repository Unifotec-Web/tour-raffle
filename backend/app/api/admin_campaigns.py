"""Admin-only campaign management with row-locked edits and audit records."""
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.models import AuditLog, Campaign, DrawRun, Entry, User
from app.schemas.schemas import CampaignAdminCreate, CampaignAdminResponse, CampaignAdminUpdate, CampaignStatusChange
from app.services.redemption import TRANSITIONS, transition_campaign, utcnow

router = APIRouter(prefix="/admin/campaigns", tags=["admin campaigns"])
LOCKED_AFTER_ENTRY = {"destination", "prize_value", "currency", "coupon_price", "winner_count", "start_date", "end_date"}


def response(campaign: Campaign, db: Session) -> CampaignAdminResponse:
    allowed = sorted(TRANSITIONS.get(campaign.status, set()) - {"completed"})
    has_entries = db.scalar(select(Entry.id).where(Entry.campaign_id == campaign.id).limit(1)) is not None
    if has_entries and "cancelled" in allowed:
        allowed.remove("cancelled")
    now = utcnow()
    if "scheduled" in allowed and campaign.start_date <= now:
        allowed.remove("scheduled")
    if "open" in allowed and not (campaign.start_date <= now < campaign.end_date and campaign.current_entries < campaign.max_capacity):
        allowed.remove("open")
    return CampaignAdminResponse.model_validate({**campaign.__dict__, "allowed_transitions": allowed})


def audit(db: Session, user: User, request: Request, action: str, campaign: Campaign, changes: dict) -> None:
    db.add(AuditLog(
        admin_email=user.email, action=action,
        details=json.dumps({"campaign_id": str(campaign.id), "changes": changes}, default=str, sort_keys=True),
        ip_address=request.client.host if request.client else "unknown", created_at=utcnow(),
    ))


def get_locked_campaign(db: Session, campaign_id: UUID) -> Campaign:
    campaign = db.scalar(select(Campaign).where(Campaign.id == campaign_id).with_for_update())
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("", response_model=list[CampaignAdminResponse])
def list_campaigns(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return [response(campaign, db) for campaign in db.scalars(select(Campaign).order_by(Campaign.created_at.desc(), Campaign.id.desc()))]


@router.get("/{campaign_id}", response_model=CampaignAdminResponse)
def get_campaign(campaign_id: UUID, _: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return response(campaign, db)


@router.post("", response_model=CampaignAdminResponse, status_code=201)
def create_campaign(payload: CampaignAdminCreate, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    values = payload.model_dump()
    campaign = Campaign(**values, status="draft", current_entries=0, created_at=utcnow(), updated_at=utcnow())
    try:
        if campaign.is_featured and db.scalar(select(Campaign.id).where(Campaign.is_featured.is_(True))) is not None:
            raise HTTPException(status_code=409, detail="Another campaign is already featured")
        db.add(campaign)
        db.flush()
        audit(db, user, request, "campaign.create", campaign, {"after": values, "status": "draft"})
        db.commit()
        return response(campaign, db)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="Campaign conflicts with an existing record") from error
    except Exception:
        db.rollback()
        raise


@router.patch("/{campaign_id}", response_model=CampaignAdminResponse)
def edit_campaign(campaign_id: UUID, payload: CampaignAdminUpdate, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No changes supplied")
    if any(value is None for key, value in changes.items() if key != "description"):
        raise HTTPException(status_code=422, detail="Required campaign fields cannot be null")
    try:
        campaign = get_locked_campaign(db, campaign_id)
        entry_count = db.scalar(select(func.count()).select_from(Entry).where(Entry.campaign_id == campaign_id))
        confirmed = db.scalar(select(func.count()).select_from(Entry).where(Entry.campaign_id == campaign_id, Entry.status == "confirmed"))
        before = {key: getattr(campaign, key) for key in changes}
        actual = {key: {"before": before[key], "after": value} for key, value in changes.items() if before[key] != value}
        if not actual:
            raise HTTPException(status_code=422, detail="No changes supplied")
        if db.scalar(select(DrawRun.id).where(DrawRun.campaign_id == campaign_id)) is not None and actual.keys() & (LOCKED_AFTER_ENTRY | {"max_capacity"}):
            raise HTTPException(status_code=409, detail="Draw rules are frozen after snapshot preparation")
        if entry_count and LOCKED_AFTER_ENTRY.intersection(actual):
            raise HTTPException(status_code=409, detail="Prize, destination, price, winners and dates are locked after entries exist")
        capacity = changes.get("max_capacity", campaign.max_capacity)
        winners = changes.get("winner_count", campaign.winner_count)
        start = changes.get("start_date", campaign.start_date)
        end = changes.get("end_date", campaign.end_date)
        if winners > capacity:
            raise HTTPException(status_code=422, detail="Winner count cannot exceed capacity")
        if start >= end:
            raise HTTPException(status_code=422, detail="End date must be after start date")
        if capacity < max(confirmed, campaign.current_entries):
            raise HTTPException(status_code=409, detail="Capacity cannot be below confirmed entries")
        if changes.get("is_featured") and not campaign.is_featured and db.scalar(select(Campaign.id).where(Campaign.is_featured.is_(True))) is not None:
            raise HTTPException(status_code=409, detail="Another campaign is already featured")
        for key, value in changes.items():
            setattr(campaign, key, value)
        campaign.updated_at = utcnow()
        audit(db, user, request, "campaign.edit", campaign, actual)
        if campaign.status == "open" and campaign.current_entries == campaign.max_capacity:
            transition_campaign(campaign, "closed")
            audit(db, user, request, "campaign.status", campaign, {"from": "open", "to": "closed", "reason": "capacity reached by edit"})
        db.commit()
        return response(campaign, db)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="Campaign conflicts with an existing record") from error
    except Exception:
        db.rollback()
        raise


@router.post("/{campaign_id}/status", response_model=CampaignAdminResponse)
def change_status(campaign_id: UUID, payload: CampaignStatusChange, request: Request, user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        campaign = get_locked_campaign(db, campaign_id)
        if payload.status == "completed":
            raise HTTPException(status_code=409, detail="Completion requires the draw workflow")
        if payload.status == "cancelled" and db.scalar(select(Entry.id).where(Entry.campaign_id == campaign_id).limit(1)) is not None:
            raise HTTPException(status_code=409, detail="Cannot cancel a campaign with entries")
        if payload.status == "scheduled" and campaign.start_date <= utcnow():
            raise HTTPException(status_code=409, detail="Scheduled campaigns must start in the future")
        old_status = campaign.status
        try:
            transition_campaign(campaign, payload.status)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        audit(db, user, request, "campaign.status", campaign, {"from": old_status, "to": campaign.status})
        db.commit()
        return response(campaign, db)
    except Exception:
        db.rollback()
        raise
