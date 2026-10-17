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
        assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == "0003_featured_campaign"
        connection.execute(text("TRUNCATE users, auth_attempts RESTART IDENTITY CASCADE"))
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
    valid = Settings(APP_ENV="production", FRONTEND_URL="https://tour-raffle.example", SESSION_COOKIE_SECURE=True)
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
