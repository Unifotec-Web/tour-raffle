"""Publishable campaign facts and owner-only dashboard/lookups."""
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.api.auth import check_origin
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Campaign, Coupon, DrawRun, DrawWinner, Entry, LookupBucket, Order, User
from app.services.redemption import utcnow

router = APIRouter(tags=["public campaign and member data"])
VISIBLE = ("scheduled", "open", "closed", "completed")
LOOKUP_LIMIT = 20


def campaign_data(row: Campaign):
    return {
        "id": str(row.id), "name": row.name, "description": row.description or "",
        "destination": row.destination, "prize_value": str(row.prize_value),
        "prize_currency": row.currency, "coupon_price_usd": "10.00",
        "max_capacity": row.max_capacity, "current_entries": row.current_entries,
        "remaining_registration_slots": max(0, row.max_capacity - row.current_entries),
        "available_checkout_slots": max(0, min(row.max_capacity - row.current_entries - row.unused_reservations - row.active_holds, row.max_capacity - row.issued_count - row.active_holds)),
        "winner_count": row.winner_count, "status": row.status,
        "start_date": row.start_date.isoformat(), "end_date": row.end_date.isoformat(),
        "is_featured": row.is_featured,
    }


@router.get("/campaigns/public")
def public_campaigns(db: Session = Depends(get_db)):
    rows = db.scalars(select(Campaign).where(Campaign.status.in_(VISIBLE)).order_by(Campaign.is_featured.desc(), Campaign.start_date.desc(), Campaign.id.desc())).all()
    return [campaign_data(row) for row in rows]


@router.get("/campaigns/public/{campaign_id}")
def public_campaign(campaign_id: uuid.UUID, db: Session = Depends(get_db)):
    row = db.get(Campaign, campaign_id)
    if row is None or row.status not in VISIBLE:
        raise HTTPException(404, "Campaign is unavailable")
    return campaign_data(row)


@router.get("/users/me/overview")
def member_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    coupons = db.scalar(select(func.count()).select_from(Coupon).where(Coupon.user_id == user.id)) or 0
    entries = db.scalar(select(func.count()).select_from(Entry).where(Entry.user_id == user.id, Entry.status == "confirmed")) or 0
    orders = db.scalars(select(Order).where(Order.user_id == user.id, Order.paid_at.is_not(None)).order_by(Order.paid_at.desc())).all()
    totals = {}
    for order in orders:
        currency = order.paid_currency or order.currency
        totals[currency] = totals.get(currency, Decimal("0")) + (order.paid_amount if order.paid_amount is not None else order.total_amount)
    activity = []
    for order in orders[:10]:
        activity.append({"kind": "payment", "label": f"Payment recorded for {order.quantity} coupon{'s' if order.quantity != 1 else ''}", "at": order.paid_at.isoformat(), "order_id": str(order.id)})
    for entry, campaign in db.execute(select(Entry, Campaign).join(Campaign, Campaign.id == Entry.campaign_id).where(Entry.user_id == user.id).order_by(Entry.entry_date.desc()).limit(10)):
        activity.append({"kind": "entry", "label": f"Entry {entry.status} for {campaign.name}", "at": entry.entry_date.isoformat(), "entry_id": str(entry.id)})
    activity.sort(key=lambda item: item["at"], reverse=True)
    return {"full_name": user.full_name, "coupon_count": coupons, "confirmed_entry_count": entries,
            "paid_totals": {currency: str(amount) for currency, amount in sorted(totals.items())},
            "recent_activity": activity[:5]}


class LookupRequest(BaseModel):
    code: str = Field(min_length=6, max_length=64)


def limit_lookup(db: Session, user: User, scope: str):
    now = utcnow()
    minute = (now.minute // 15) * 15
    window = datetime(now.year, now.month, now.day, now.hour, minute)
    statement = insert(LookupBucket).values(id=uuid.uuid4(), user_id=user.id, scope=scope, window_start=window, attempts=1)
    statement = statement.on_conflict_do_update(index_elements=[LookupBucket.user_id, LookupBucket.scope, LookupBucket.window_start], set_={"attempts": LookupBucket.attempts + 1}).returning(LookupBucket.attempts)
    attempts = db.scalar(statement)
    db.commit()  # Failed/unknown lookups still count.
    if attempts > LOOKUP_LIMIT:
        raise HTTPException(429, "Too many lookups. Try again later.")


@router.post("/users/me/entries/check")
def check_entry(payload: LookupRequest, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    limit_lookup(db, user, "entry")
    code = payload.code.strip().upper()
    entry = db.scalar(select(Entry).where(Entry.entry_code == code, Entry.user_id == user.id))
    if entry is not None:
        campaign = db.get(Campaign, entry.campaign_id)
        return {"found": True, "kind": "entry", "status": entry.status, "campaign_name": campaign.name}
    coupon = db.scalar(select(Coupon).where(Coupon.code == code, Coupon.user_id == user.id))
    if coupon is None:
        return {"found": False}
    entry = db.scalar(select(Entry).where(Entry.coupon_id == coupon.id, Entry.user_id == user.id))
    campaign = db.get(Campaign, coupon.campaign_id)
    return {"found": True, "kind": "coupon", "status": "registered" if entry else coupon.status, "campaign_name": campaign.name}


@router.post("/users/me/wins/check")
def check_win(payload: LookupRequest, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_origin(request)
    limit_lookup(db, user, "win")
    code = payload.code.strip().upper()
    row = db.execute(select(DrawWinner, Campaign).join(DrawRun, DrawRun.id == DrawWinner.run_id).join(Entry, Entry.id == DrawWinner.entry_id).join(Campaign, Campaign.id == Entry.campaign_id).where(DrawWinner.user_id == user.id, DrawRun.status == "published", Entry.entry_code == code)).first()
    if row is None:
        return {"found": False}
    winner, campaign = row
    return {"found": True, "campaign_name": campaign.name, "rank": winner.rank}
