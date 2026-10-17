"""Clear only the fixed disposable verification database before browser tests."""
from sqlalchemy import text
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.database import engine

target = make_url(settings.DATABASE_URL)
if settings.APP_ENV != "test" or (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
    raise SystemExit("Browser reset requires APP_ENV=test and the disposable localhost database")

with engine.begin() as connection:
    connection.execute(text("TRUNCATE users, campaigns, auth_attempts, audit_logs RESTART IDENTITY CASCADE"))
