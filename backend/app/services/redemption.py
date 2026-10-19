"""Campaign lifecycle and atomic, idempotent coupon redemption."""
from datetime import datetime, timezone
import json
import secrets
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import AuditLog, Campaign, Coupon, Entry


class RedemptionError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message


TRANSITIONS = {
    "draft": {"scheduled", "open", "cancelled"},
    "scheduled": {"open", "cancelled"},
    "open": {"closed", "cancelled"},
    "closed": {"completed"},
    "completed": set(),
    "cancelled": set(),
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def transition_campaign(campaign: Campaign, target: str, now: datetime | None = None) -> None:
    now = now or utcnow()
    if target not in TRANSITIONS.get(campaign.status, set()):
        raise ValueError(f"Cannot transition campaign from {campaign.status} to {target}")
    if target == "open" and not (campaign.start_date <= now < campaign.end_date and campaign.current_entries < campaign.max_capacity):
        raise ValueError("Campaign is outside its registration window or full")
    campaign.status = target
    campaign.updated_at = now


def generate_entry_code() -> str:
    return f"ENT-{secrets.token_hex(12).upper()}"


def redeem(db: Session, code: str, owner_id: UUID) -> tuple[Entry, bool]:
    """All checks and writes share one transaction; campaign lock serializes capacity."""
    try:
        coupon_ref = db.execute(select(Coupon.id, Coupon.campaign_id).where(Coupon.code == code)).first()
        if coupon_ref is None:
            raise RedemptionError(404, "Coupon not found")
        campaign = db.execute(select(Campaign).where(Campaign.id == coupon_ref.campaign_id).with_for_update()).scalar_one()
        coupon = db.execute(select(Coupon).where(Coupon.id == coupon_ref.id).with_for_update()).scalar_one()
        if coupon.user_id != owner_id:
            raise RedemptionError(404, "Coupon not found")
        existing = db.execute(select(Entry).where(Entry.coupon_id == coupon.id)).scalar_one_or_none()
        if existing is not None:
            if existing.user_id != owner_id:
                raise RedemptionError(404, "Coupon not found")
            db.commit()
            return existing, False
        now = utcnow()
        if campaign.status == "open" and now >= campaign.end_date:
            from app.services.orders import close_registration
            close_registration(db, campaign, "deadline", now)
            db.commit()
            raise RedemptionError(409, "Registration is closed")
        if coupon.status not in ("active", "unused"):
            raise RedemptionError(409, "Coupon is not available")
        if coupon.valid_until <= now:
            raise RedemptionError(409, "Coupon has expired")
        if campaign.current_entries >= campaign.max_capacity:
            raise RedemptionError(409, "Campaign is full")
        if coupon.status == "active" and campaign.current_entries + campaign.unused_reservations + campaign.active_holds >= campaign.max_capacity:
            raise RedemptionError(409, "Campaign capacity is reserved")
        if campaign.status != "open" or not (campaign.start_date <= now < campaign.end_date):
            raise RedemptionError(409, "Registration is closed")
        entry = Entry(
            entry_code=generate_entry_code(), coupon_id=coupon.id,
            campaign_id=campaign.id, user_id=owner_id, status="confirmed", entry_date=now,
        )
        purchased = coupon.status == "unused"
        coupon.status = "registered" if purchased else "redeemed"
        if purchased:
            campaign.unused_reservations -= 1
        campaign.current_entries += 1
        campaign.updated_at = now
        db.add(entry)
        db.flush()  # Closure queries must see this coupon's registered state with autoflush disabled.
        if campaign.current_entries == campaign.max_capacity:
            from app.services.orders import close_registration
            close_registration(db, campaign, "registered entry limit", now)
        db.commit()
        return entry, True
    except Exception:
        db.rollback()
        raise
