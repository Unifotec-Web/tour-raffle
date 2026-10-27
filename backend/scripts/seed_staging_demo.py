"""One-time staging-only synthetic accounts; no database reset or email delivery."""
import os
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import AuditLog, User

if settings.APP_ENV != "staging" or settings.FRONTEND_URL != "https://raffle-staging.unifotecweb.com":
    raise SystemExit("Staging fixture requires the staging environment and exact HTTPS URL")
if os.environ.get("STAGING_FIXTURE_CONFIRM") != "create-synthetic-accounts":
    raise SystemExit("Set STAGING_FIXTURE_CONFIRM=create-synthetic-accounts explicitly")

accounts = []
for kind, role in (("ADMIN", "admin"), ("MEMBER", "user")):
    email = os.environ.get(f"STAGING_{kind}_EMAIL", "").strip().lower()
    password = os.environ.get(f"STAGING_{kind}_PASSWORD", "")
    if not email.endswith("@example.com") or len(password) < 12 or len(password.encode()) > 72:
        raise SystemExit(f"STAGING_{kind}_EMAIL must use @example.com and password must be 12 to 72 bytes")
    accounts.append((email, password, role))
if accounts[0][0] == accounts[1][0]:
    raise SystemExit("Use different synthetic account emails")

with SessionLocal() as db:
    if any(db.scalar(select(User.id).where(User.email == email)) for email, _, _ in accounts):
        raise SystemExit("A fixture account already exists; no account was changed")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for email, password, role in accounts:
        db.add(User(email=email, hashed_password=get_password_hash(password),
                    full_name="Staging Admin" if role == "admin" else "Staging Member",
                    country="Kenya", role=role, is_active=True, is_verified=True,
                    consented_at=now, created_at=now))
    db.add(AuditLog(admin_email=accounts[0][0], action="staging.fixture.create",
                    details='{"accounts": 2, "synthetic": true}', ip_address="staging-cli", created_at=now))
    db.commit()
print("Created two synthetic staging accounts; credentials were not printed")
