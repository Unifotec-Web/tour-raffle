"""Disposable browser verification fixtures; never available in production."""
import argparse
import json
from datetime import timedelta

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import generate_secure_coupon_code
from app.models.models import Campaign, Coupon, Entry, User
from app.services.redemption import generate_entry_code, utcnow


def main():
    if settings.APP_ENV not in {"development", "test"}:
        raise SystemExit("Browser fixtures are restricted to development and test")
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner-email", required=True)
    parser.add_argument("--other-email", required=True)
    args = parser.parse_args()
    now = utcnow()
    with SessionLocal() as db:
        owner = db.scalar(select(User).where(User.email == args.owner_email.lower()))
        other = db.scalar(select(User).where(User.email == args.other_email.lower()))
        if owner is None or other is None:
            parser.error("Sign up both users first")
        for previous in db.scalars(select(Campaign).where(Campaign.is_featured.is_(True))):
            previous.is_featured = False
        db.flush()

        def campaign(name, capacity, status, entries=0):
            row = Campaign(name=name, destination="Kenya", prize_value=100, currency="USD", coupon_price=10,
                           max_capacity=capacity, current_entries=entries, winner_count=1, status=status,
                           start_date=now-timedelta(days=1), end_date=now+timedelta(days=2), updated_at=now)
            db.add(row)
            db.flush()
            return row

        def coupon(camp, user, status="active", expired=False):
            row = Coupon(code=generate_secure_coupon_code(), campaign_id=camp.id, user_id=user.id,
                         status=status, valid_until=now+timedelta(days=-1 if expired else 1))
            db.add(row)
            db.flush()
            return row

        featured = campaign("Browser fixture campaign", 3, "open", 1)
        featured.is_featured = True
        valid = coupon(featured, owner)
        used = coupon(featured, owner, "redeemed")
        db.add(Entry(entry_code=generate_entry_code(), coupon_id=used.id, campaign_id=featured.id,
                     user_id=owner.id, status="confirmed", entry_date=now))
        expired = coupon(featured, owner, expired=True)
        closed_campaign = campaign("Closed browser fixture", 2, "closed")
        closed = coupon(closed_campaign, owner)
        full_campaign = campaign("Full browser fixture", 1, "closed", 1)
        full = coupon(full_campaign, owner)
        other_used = coupon(full_campaign, other, "redeemed")
        db.add(Entry(entry_code=generate_entry_code(), coupon_id=other_used.id,
                     campaign_id=full_campaign.id, user_id=other.id, status="confirmed", entry_date=now))
        db.commit()
        print(json.dumps({"valid": valid.code, "used": used.code, "expired": expired.code,
                          "closed": closed.code, "full": full.code, "other": other_used.code,
                          "featured_id": str(featured.id)}))


if __name__ == "__main__":
    main()
