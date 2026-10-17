"""Create a small campaign and owned coupons for local/test use only."""
import argparse
from datetime import timedelta

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import generate_secure_coupon_code
from app.models.models import Campaign, Coupon, User
from app.services.redemption import transition_campaign, utcnow


def main():
    if settings.APP_ENV not in {"development", "test"}:
        raise SystemExit("Fixture generation is restricted to development and test")
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner-email", required=True)
    parser.add_argument("--capacity", type=int, default=10)
    parser.add_argument("--winner-count", type=int, default=1)
    parser.add_argument("--coupons", type=int, default=1)
    args = parser.parse_args()
    if args.capacity < 1 or not 1 <= args.winner_count <= args.capacity or not 1 <= args.coupons <= args.capacity:
        parser.error("Capacity, winner count and coupon count must be positive and within capacity")
    now = utcnow()
    with SessionLocal() as db:
        owner = db.scalar(select(User).where(User.email == args.owner_email.lower()))
        if owner is None:
            parser.error("Sign up the owner first")
        featured_exists = db.scalar(select(Campaign.id).where(Campaign.is_featured.is_(True))) is not None
        campaign = Campaign(name="Local fixture campaign", description="Development fixture", destination="Kenya", prize_value=100, currency="USD", coupon_price=10, max_capacity=args.capacity, current_entries=0, winner_count=args.winner_count, status="draft", start_date=now-timedelta(hours=1), end_date=now+timedelta(days=30), updated_at=now)
        campaign.is_featured = not featured_exists
        db.add(campaign)
        db.flush()
        transition_campaign(campaign, "open", now)
        codes = []
        for _ in range(args.coupons):
            code = generate_secure_coupon_code()
            db.add(Coupon(code=code, campaign_id=campaign.id, user_id=owner.id, status="active", valid_until=campaign.end_date))
            codes.append(code)
        db.commit()
    print(f"Campaign: {campaign.id}")
    for code in codes:
        print(code)


if __name__ == "__main__":
    main()
