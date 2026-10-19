"""Issue browser-test coupons to one member for an existing campaign."""
import argparse
from datetime import timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import generate_secure_coupon_code
from app.models.models import Campaign, Coupon, User
from app.services.redemption import utcnow

target = make_url(settings.DATABASE_URL)
if settings.APP_ENV != "test" or (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
    raise SystemExit("Campaign coupon fixture requires APP_ENV=test and the disposable localhost database")

parser = argparse.ArgumentParser()
parser.add_argument("--owner-email", required=True)
parser.add_argument("--campaign-id", type=UUID, required=True)
parser.add_argument("--count", type=int, default=1)
args = parser.parse_args()
if not 1 <= args.count <= 10:
    parser.error("Count must be between 1 and 10")
with SessionLocal() as db:
    owner = db.scalar(select(User).where(User.email == args.owner_email.lower()))
    campaign = db.scalar(select(Campaign).where(Campaign.id == args.campaign_id).with_for_update())
    if owner is None or campaign is None:
        parser.error("Owner and campaign must exist")
    now = utcnow()
    if campaign.status != "open" or not (campaign.start_date <= now < campaign.end_date):
        parser.error("Fixture coupons require open registration")
    if campaign.issued_count + campaign.active_holds + args.count > campaign.max_capacity:
        parser.error("Cumulative coupon issuance limit reached")
    campaign.issued_count += args.count
    codes = []
    for _ in range(args.count):
        code = generate_secure_coupon_code()
        db.add(Coupon(code=code, campaign_id=campaign.id, user_id=owner.id, status="active", valid_until=campaign.end_date))
        codes.append(code)
    db.commit()
print("\n".join(codes))
