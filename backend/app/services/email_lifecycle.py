import hashlib
import hmac
import os
import tempfile
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import token_digest
from app.models.models import EmailCredential, EmailOutbox, EmailRateBucket, User


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def credential_token(identifier: uuid.UUID) -> str:
    signature = hmac.new(settings.EMAIL_TOKEN_SECRET.encode(), str(identifier).encode(), hashlib.sha256).hexdigest()
    return f"{identifier}.{signature}"


def issue(db: Session, user: User, purpose: str) -> EmailCredential:
    current = now()
    db.query(EmailOutbox).filter(EmailOutbox.user_id == user.id, EmailOutbox.purpose == purpose, EmailOutbox.status == "pending").update({"status": "cancelled"})
    db.query(EmailCredential).filter(EmailCredential.user_id == user.id, EmailCredential.purpose == purpose, EmailCredential.consumed_at.is_(None)).update({"consumed_at": current})
    identifier = uuid.uuid4()
    credential = EmailCredential(id=identifier, user_id=user.id, purpose=purpose, token_hash=token_digest(credential_token(identifier)), expires_at=current + timedelta(minutes=30 if purpose == "reset" else 1440), created_at=current)
    db.add(credential)
    db.add(EmailOutbox(id=uuid.uuid4(), user_id=user.id, credential_id=identifier, purpose=purpose, recipient=user.email, status="pending", attempts=0, next_attempt_at=current, created_at=current))
    return credential


def consume(db: Session, raw: str, purpose: str) -> User | None:
    try:
        identifier = uuid.UUID(raw.split(".", 1)[0])
    except (ValueError, IndexError):
        return None
    candidate = db.query(EmailCredential).filter(EmailCredential.id == identifier).first()
    if not candidate:
        return None
    user = db.query(User).filter(User.id == candidate.user_id).with_for_update().one()
    credential = db.query(EmailCredential).filter(EmailCredential.id == identifier).with_for_update().first()
    if not credential or credential.purpose != purpose or credential.consumed_at or credential.expires_at <= now() or not hmac.compare_digest(credential.token_hash, token_digest(raw)):
        return None
    credential.consumed_at = now()
    return user


def rate(db: Session, scope: str, principal: str, maximum: int) -> bool:
    window = now().replace(minute=(now().minute // 15) * 15, second=0, microsecond=0)
    key = hashlib.sha256(principal.encode()).hexdigest()
    if db.bind.dialect.name == "postgresql":
        stmt = insert(EmailRateBucket).values(id=uuid.uuid4(), scope=scope, principal_hash=key, window_start=window, attempts=1)
        stmt = stmt.on_conflict_do_update(index_elements=["scope", "principal_hash", "window_start"], set_={"attempts": EmailRateBucket.attempts + 1}).returning(EmailRateBucket.attempts)
        count = db.execute(stmt).scalar_one()
    else:
        bucket = db.query(EmailRateBucket).filter_by(scope=scope, principal_hash=key, window_start=window).first()
        if bucket:
            bucket.attempts += 1
            count = bucket.attempts
        else:
            db.add(EmailRateBucket(scope=scope, principal_hash=key, window_start=window, attempts=1))
            count = 1
    db.commit()
    return count <= maximum


def deliver_pending(db: Session, limit: int = 20) -> int:
    rows = db.query(EmailOutbox).filter(EmailOutbox.status == "pending", EmailOutbox.next_attempt_at <= now()).order_by(EmailOutbox.created_at).with_for_update(skip_locked=True).limit(limit).all()
    delivered = 0
    for row in rows:
        credential = db.query(EmailCredential).filter_by(id=row.credential_id).one()
        if credential.consumed_at or credential.expires_at <= now():
            row.status = "cancelled"
            continue
        try:
            if settings.EMAIL_DELIVERY_MODE != "local":
                raise RuntimeError("Email provider is not configured")
            token = credential_token(credential.id)
            path = "/verify-email" if row.purpose == "verify" else "/reset-password"
            link = f"{settings.FRONTEND_URL}{path}#token={quote(token)}"
            target_dir = Path(settings.LOCAL_EMAIL_SINK_DIR)
            target_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
            target = target_dir / f"{row.id}.eml"
            fd, temp_name = tempfile.mkstemp(dir=target_dir)
            try:
                with os.fdopen(fd, "w") as output:
                    output.write(f"To: {row.recipient}\nSubject: Tour Raffle {'verify your email' if row.purpose == 'verify' else 'reset your password'}\n\n{link}\n")
                os.chmod(temp_name, 0o600)
                os.replace(temp_name, target)
            finally:
                if os.path.exists(temp_name):
                    os.unlink(temp_name)
            row.status = "delivered"
            row.delivered_at = now()
            delivered += 1
        except Exception:
            row.attempts += 1
            row.next_attempt_at = now() + timedelta(minutes=min(60, 2 ** min(row.attempts, 6)))
            row.status = "failed" if row.attempts >= 8 else "pending"
    db.commit()
    return delivered
