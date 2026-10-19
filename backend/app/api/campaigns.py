from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Campaign, Coupon, Entry, RemedyRecord, User
from app.schemas.schemas import CampaignProgress, CouponResponse, CouponValidateRequest, CouponValidateResponse, EntryResponse, RedemptionResponse
from app.services.redemption import RedemptionError, redeem, utcnow

router = APIRouter(tags=["campaigns and entries"])


def progress(campaign: Campaign) -> CampaignProgress:
    return CampaignProgress(
        id=campaign.id, name=campaign.name, status=campaign.status,
        max_capacity=campaign.max_capacity, current_entries=campaign.current_entries,
        remaining=campaign.max_capacity - campaign.current_entries,
        available_checkout_slots=max(0, min(campaign.max_capacity - campaign.current_entries - campaign.unused_reservations - campaign.active_holds, campaign.max_capacity - campaign.issued_count - campaign.active_holds)),
        unused_reservations=campaign.unused_reservations, active_holds=campaign.active_holds, issued_count=campaign.issued_count,
        percentage=round(campaign.current_entries * 100 / campaign.max_capacity, 1),
        updated_at=campaign.updated_at,
    )


def entry_response(entry: Entry, campaign: Campaign, coupon: Coupon) -> EntryResponse:
    return EntryResponse(
        id=entry.id, entry_code=entry.entry_code, campaign_id=campaign.id,
        campaign_name=campaign.name, destination=campaign.destination,
        coupon_id=entry.coupon_id, coupon_code=coupon.code, status=entry.status, entry_date=entry.entry_date,
    )


@router.get("/campaigns/featured/progress", response_model=CampaignProgress)
def featured_progress(db: Session = Depends(get_db)):
    campaign = db.execute(select(Campaign).where(Campaign.is_featured.is_(True), Campaign.status.in_(["scheduled", "open", "closed"]))).scalar_one_or_none()
    if campaign is None:
        raise HTTPException(status_code=404, detail="No featured campaign")
    return progress(campaign)


@router.get("/users/me/coupons", response_model=list[CouponResponse])
def my_coupons(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Coupon, Campaign).join(Campaign, Coupon.campaign_id == Campaign.id).where(Coupon.user_id == user.id).order_by(Coupon.purchase_date.desc(), Coupon.id.desc())).all()
    return [CouponResponse(id=c.id, code=c.code, campaign_id=campaign.id, campaign_name=campaign.name, destination=campaign.destination, status=c.status, purchase_date=c.purchase_date, valid_until=c.valid_until, remedy_status=db.scalar(select(RemedyRecord.status).where(RemedyRecord.coupon_id == c.id, RemedyRecord.reason == "expired_unused"))) for c, campaign in rows]


@router.get("/users/me/entries", response_model=list[EntryResponse])
def my_entries(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Entry, Campaign, Coupon).join(Campaign, Entry.campaign_id == Campaign.id).join(Coupon, Entry.coupon_id == Coupon.id).where(Entry.user_id == user.id).order_by(Entry.entry_date.desc(), Entry.id.desc())).all()
    return [entry_response(entry, campaign, coupon) for entry, campaign, coupon in rows]


@router.post("/coupons/validate", response_model=CouponValidateResponse)
def validate_coupon(payload: CouponValidateRequest, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    row = db.execute(select(Coupon, Campaign).join(Campaign, Coupon.campaign_id == Campaign.id).where(Coupon.code == payload.code.strip().upper(), Coupon.user_id == user.id)).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon, campaign = row
    if db.execute(select(Entry.id).where(Entry.coupon_id == coupon.id)).first():
        return CouponValidateResponse(valid=False, message="Coupon already redeemed", campaign_id=campaign.id)
    now = utcnow()
    if coupon.status not in ("active", "unused") or coupon.valid_until <= now:
        return CouponValidateResponse(valid=False, message="Coupon has expired or is unavailable", campaign_id=campaign.id)
    if campaign.current_entries >= campaign.max_capacity:
        return CouponValidateResponse(valid=False, message="Campaign is full", campaign_id=campaign.id)
    if campaign.status != "open" or not (campaign.start_date <= now < campaign.end_date):
        return CouponValidateResponse(valid=False, message="Registration is closed", campaign_id=campaign.id)
    return CouponValidateResponse(valid=True, message="Coupon is ready to redeem", campaign_id=campaign.id)


@router.post("/coupons/redeem", response_model=RedemptionResponse)
def redeem_coupon(payload: CouponValidateRequest, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    try:
        entry, created = redeem(db, payload.code.strip().upper(), user.id)
    except RedemptionError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message) from error
    campaign = db.get(Campaign, entry.campaign_id)
    coupon = db.get(Coupon, entry.coupon_id)
    return RedemptionResponse(entry=entry_response(entry, campaign, coupon), created=created)
