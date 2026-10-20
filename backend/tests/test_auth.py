import os
import pytest
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.main import app
from app.models.models import User, AuthAttempt, AuthSession
from datetime import datetime, timedelta, timezone
from app.core.config import Settings, settings

test_url = os.environ.get("TEST_DATABASE_URL")
if test_url:
    target = make_url(test_url)
    if (target.database, target.host, target.port, target.username) != ("tour_raffle_verify", "127.0.0.1", 55432, "tour_raffle_verify"):
        raise RuntimeError("PostgreSQL tests require the disposable localhost Compose database")
    engine = create_engine(test_url)
    if not inspect(engine).has_table("alembic_version"):
        raise RuntimeError("Run Alembic migrations before PostgreSQL tests")
    with engine.begin() as connection:
        assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == "0010_email_lifecycle"
        connection.execute(text("TRUNCATE users, auth_attempts, email_rate_buckets RESTART IDENTITY CASCADE"))
else:
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def override_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_db
origin = {"Origin": "http://localhost:3000"}

def test_registration_login_logout_and_server_permissions():
    client = TestClient(app)
    payload = {"email": "Traveler@example.com", "password": "LongPassword123!", "full_name": "Test Traveler", "country": "Ghana", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload).status_code == 403
    created = client.post("/api/v1/auth/register", json=payload, headers=origin)
    assert created.status_code == 201, created.text
    assert created.json()["email"] == "traveler@example.com"
    assert "hashed_password" not in created.json()
    assert client.post("/api/v1/auth/register", json=payload, headers=origin).status_code == 409
    assert client.get("/api/v1/users/me").status_code == 401
    assert client.get("/api/v1/admin/me").status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": payload["email"], "password": "wrong"}, headers=origin).status_code == 401
    logged_in = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]}, headers=origin)
    assert logged_in.status_code == 200, logged_in.text
    assert "httponly" in logged_in.headers["set-cookie"].lower()
    cookie = logged_in.headers["set-cookie"].lower()
    assert "samesite=lax" in cookie and "max-age=28800" in cookie and "path=/" in cookie
    assert "secure" not in cookie
    assert client.get("/api/v1/users/me").status_code == 200
    token = client.cookies.get("tour_raffle_session")
    new_client = TestClient(app)
    new_client.cookies.set("tour_raffle_session", token)
    assert new_client.get("/api/v1/users/me").status_code == 200
    assert client.get("/api/v1/admin/me").status_code == 403
    with Session() as db:
        user = db.query(User).filter(User.email == "traveler@example.com").one()
        user.role = "admin"
        db.commit()
    assert client.get("/api/v1/admin/me").status_code == 200
    assert client.post("/api/v1/auth/logout", headers=origin).status_code == 204
    assert client.get("/api/v1/users/me").status_code == 401
    assert new_client.get("/api/v1/users/me").status_code == 401
    assert client.post("/api/v1/auth/admin/login", json={"email": payload["email"], "password": payload["password"]}, headers=origin).status_code == 200

def test_expired_session_and_rate_limit():
    client = TestClient(app)
    payload = {"email": "another@example.com", "password": "LongPassword123!", "full_name": "Another Traveler", "country": "Canada", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload, headers=origin).status_code == 201
    assert client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]}, headers=origin).status_code == 200
    with Session() as db:
        session = db.query(AuthSession).order_by(AuthSession.created_at.desc()).first()
        session.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=1)
        db.commit()
    assert client.get("/api/v1/users/me").status_code == 401
    with Session() as db:
        for _ in range(10):
            db.add(AuthAttempt(email="blocked@example.com", ip_address="other", created_at=datetime.now(timezone.utc).replace(tzinfo=None)))
        db.commit()
    assert client.post("/api/v1/auth/login", json={"email": "blocked@example.com", "password": "guess"}, headers=origin).status_code == 429

def test_production_cookie_and_configuration(monkeypatch):
    with pytest.raises(ValueError):
        Settings(APP_ENV="production", FRONTEND_URL="https://tour-raffle.example", SESSION_COOKIE_SECURE=False)
    with pytest.raises(ValueError):
        Settings(APP_ENV="production", FRONTEND_URL="http://tour-raffle.example", SESSION_COOKIE_SECURE=True)
    valid = Settings(APP_ENV="production", FRONTEND_URL="https://tour-raffle.example", SESSION_COOKIE_SECURE=True, EMAIL_TOKEN_SECRET="a" * 48, EMAIL_DELIVERY_MODE="provider")
    assert valid.SESSION_COOKIE_SECURE
    monkeypatch.setattr(settings, "FRONTEND_URL", valid.FRONTEND_URL)
    monkeypatch.setattr(settings, "SESSION_COOKIE_SECURE", True)
    client = TestClient(app, base_url="https://tour-raffle.example")
    headers = {"Origin": valid.FRONTEND_URL}
    payload = {"email": "secure@example.com", "password": "LongPassword123!", "full_name": "Secure Traveler", "country": "Ghana", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload, headers=headers).status_code == 201
    result = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]}, headers=headers)
    assert result.status_code == 200
    assert "secure" in result.headers["set-cookie"].lower()
    assert "httponly" in result.headers["set-cookie"].lower()
    assert client.get("/api/v1/users/me").status_code == 200

def test_email_verification_recovery_and_outbox(tmp_path, monkeypatch):
    from app.models.models import EmailCredential, EmailOutbox
    from app.services.email_lifecycle import deliver_pending
    monkeypatch.setattr(settings, "LOCAL_EMAIL_SINK_DIR", str(tmp_path))
    client = TestClient(app)
    email = "lifecycle@example.com"
    payload = {"email": email, "password": "LongPassword123!", "full_name": "Lifecycle User", "country": "Ghana", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload, headers=origin).status_code == 201
    with Session() as db:
        credential = db.query(EmailCredential).filter_by(purpose="verify").order_by(EmailCredential.created_at.desc()).first()
        assert len(credential.token_hash) == 64 and "http" not in credential.token_hash
        assert deliver_pending(db) >= 1
    mail = next(path.read_text() for path in tmp_path.glob("*.eml") if email in path.read_text())
    verify_token = mail.split("#token=")[1].strip()
    assert client.post("/api/v1/auth/verification/confirm", json={"token": verify_token}, headers=origin).status_code == 200
    assert client.post("/api/v1/auth/verification/confirm", json={"token": verify_token}, headers=origin).status_code == 400
    with Session() as db:
        assert db.query(User).filter_by(email=email).one().is_verified
    assert client.post("/api/v1/auth/login", json={"email": email, "password": payload["password"]}, headers=origin).status_code == 200
    assert client.get("/api/v1/users/me").status_code == 200
    known = client.post("/api/v1/auth/password/request", json={"email": email}, headers=origin)
    unknown = client.post("/api/v1/auth/password/request", json={"email": "nobody-lifecycle@example.com"}, headers=origin)
    assert known.status_code == unknown.status_code == 202 and known.json() == unknown.json()
    with Session() as db:
        assert deliver_pending(db) >= 1
    reset_mail = next(path.read_text() for path in tmp_path.glob("*.eml") if "/reset-password#token=" in path.read_text())
    reset_token = reset_mail.split("#token=")[1].strip()
    assert client.post("/api/v1/auth/password/reset", json={"token": reset_token, "password": "NewLongPassword123!"}, headers=origin).status_code == 200
    assert client.get("/api/v1/users/me").status_code == 401
    assert client.post("/api/v1/auth/password/reset", json={"token": reset_token, "password": "AnotherLongPassword123!"}, headers=origin).status_code == 400
    assert client.post("/api/v1/auth/login", json={"email": email, "password": "NewLongPassword123!"}, headers=origin).status_code == 200
    assert client.post("/api/v1/auth/admin/login", json={"email": email, "password": "NewLongPassword123!"}, headers=origin).status_code == 401
    with Session() as db:
        user = db.query(User).filter_by(email=email).one()
        user.role = "admin"
        db.commit()
    assert client.post("/api/v1/auth/admin/login", json={"email": email, "password": "NewLongPassword123!"}, headers=origin).status_code == 200


def test_email_expiry_resend_limits_and_concurrent_consumption(tmp_path, monkeypatch):
    from concurrent.futures import ThreadPoolExecutor
    from app.models.models import EmailCredential, EmailRateBucket
    from app.services.email_lifecycle import credential_token
    monkeypatch.setattr(settings, "LOCAL_EMAIL_SINK_DIR", str(tmp_path))
    with Session() as db:
        db.query(EmailRateBucket).delete()
        db.commit()
    client = TestClient(app)
    email = "resend@example.com"
    payload = {"email": email, "password": "LongPassword123!", "full_name": "Resend User", "country": "Ghana", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload, headers=origin).status_code == 201
    with Session() as db:
        user = db.query(User).filter_by(email=email).one()
        first = db.query(EmailCredential).filter_by(purpose="verify", user_id=user.id).order_by(EmailCredential.created_at.desc()).first()
        first_token = credential_token(first.id)
    assert client.post("/api/v1/auth/verification/request", json={"email": email}, headers=origin).status_code == 202
    assert client.post("/api/v1/auth/verification/confirm", json={"token": first_token}, headers=origin).status_code == 400
    with Session() as db:
        latest = db.query(EmailCredential).filter_by(purpose="verify", user_id=user.id).order_by(EmailCredential.created_at.desc()).first()
        token = credential_token(latest.id)
        latest.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=1)
        db.commit()
    assert client.post("/api/v1/auth/verification/confirm", json={"token": token}, headers=origin).status_code == 400
    assert client.post("/api/v1/auth/verification/request", json={"email": email}, headers=origin).status_code == 202
    with Session() as db:
        latest = db.query(EmailCredential).filter_by(purpose="verify", user_id=user.id).order_by(EmailCredential.created_at.desc()).first()
        token = credential_token(latest.id)
    def confirm(_):
        with TestClient(app) as other:
            return other.post("/api/v1/auth/verification/confirm", json={"token": token}, headers=origin).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(confirm, range(2))) == [200, 400]
    assert client.post("/api/v1/auth/password/request", json={"email": email}, headers=origin).status_code == 202
    assert client.post("/api/v1/auth/password/request", json={"email": email}, headers=origin).status_code == 202
    assert client.post("/api/v1/auth/password/request", json={"email": email}, headers=origin).status_code == 202
    assert client.post("/api/v1/auth/password/request", json={"email": email}, headers=origin).status_code == 202
    with Session() as db:
        user = db.query(User).filter_by(email=email).one()
        assert db.query(EmailCredential).filter_by(purpose="reset", user_id=user.id).count() == 3

def test_email_outbox_retry_after_delivery_failure(tmp_path, monkeypatch):
    from app.models.models import EmailOutbox, EmailRateBucket
    from app.services.email_lifecycle import deliver_pending, now
    with Session() as db:
        db.query(EmailRateBucket).delete()
        db.commit()
    client = TestClient(app)
    email = "outbox-recovery@example.com"
    payload = {"email": email, "password": "LongPassword123!", "full_name": "Outbox Recovery", "country": "Ghana", "accept_terms": True}
    assert client.post("/api/v1/auth/register", json=payload, headers=origin).status_code == 201
    monkeypatch.setattr(settings, "EMAIL_DELIVERY_MODE", "unconfigured")
    with Session() as db:
        assert deliver_pending(db) == 0
        row = db.query(EmailOutbox).filter_by(recipient=email).one()
        assert row.status == "pending" and row.attempts == 1 and row.next_attempt_at > now()
        row.next_attempt_at = now()
        db.commit()
    monkeypatch.setattr(settings, "EMAIL_DELIVERY_MODE", "local")
    monkeypatch.setattr(settings, "LOCAL_EMAIL_SINK_DIR", str(tmp_path))
    with Session() as db:
        assert deliver_pending(db) == 1
        assert db.query(EmailOutbox).filter_by(recipient=email).one().status == "delivered"
    assert len(list(tmp_path.glob("*.eml"))) == 1


def test_email_attempt_rate_limit():
    from app.models.models import EmailRateBucket
    with Session() as db:
        db.query(EmailRateBucket).delete()
        db.commit()
    client = TestClient(app)
    secret = "sensitive-token-from-caller"
    invalid = client.post("/api/v1/auth/password/reset", json={"token": secret}, headers=origin)
    assert invalid.status_code == 422 and secret not in invalid.text
    for _ in range(10):
        assert client.post("/api/v1/auth/verification/confirm", json={"token": "invalid-token-value"}, headers=origin).status_code == 400
    assert client.post("/api/v1/auth/verification/confirm", json={"token": "invalid-token-value"}, headers=origin).status_code == 429
