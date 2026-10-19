"""Force only a disposable test hold to expire for browser race verification."""
import argparse
from datetime import timedelta
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.engine import make_url
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import CheckoutHold
from app.services.redemption import utcnow

parser = argparse.ArgumentParser()
parser.add_argument('--order-id', required=True)
args = parser.parse_args()
target = make_url(settings.DATABASE_URL)
if settings.APP_ENV != 'test' or (target.database, target.host, target.port, target.username) != ('tour_raffle_verify', '127.0.0.1', 55432, 'tour_raffle_verify'):
    raise SystemExit('Test hold expiry requires the disposable localhost database')
with SessionLocal() as db:
    hold = db.scalar(select(CheckoutHold).where(CheckoutHold.order_id == UUID(args.order_id)))
    if hold is None:
        raise SystemExit('Hold not found')
    hold.expires_at = utcnow() - timedelta(seconds=1)
    db.commit()
