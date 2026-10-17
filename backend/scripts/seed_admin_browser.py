"""Promote one browser fixture account in the fixed disposable database only."""
import argparse

from sqlalchemy import select
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import User

target = make_url(settings.DATABASE_URL)
if settings.APP_ENV != "test" or (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
    raise SystemExit("Admin browser fixture requires APP_ENV=test and the disposable localhost database")

parser = argparse.ArgumentParser()
parser.add_argument("--email", required=True)
args = parser.parse_args()
with SessionLocal() as db:
    user = db.scalar(select(User).where(User.email == args.email.lower()))
    if user is None:
        parser.error("Sign up the account first")
    user.role = "admin"
    db.commit()
