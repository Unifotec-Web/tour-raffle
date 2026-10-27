from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, new_session_token, token_digest, verify_password
from app.models.models import AuthAttempt, AuthSession, User
from app.services.email_lifecycle import issue
from app.schemas.schemas import UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
COOKIE = "tour_raffle_session"


def check_origin(request: Request) -> None:
    # Browser cookie mutations must originate from the configured frontend.
    origin = request.headers.get("origin")
    if origin not in settings.allowed_frontend_origins:
        raise HTTPException(status_code=403, detail="Invalid request origin")


def check_rate_limit(db: Session, email: str, ip: str) -> None:
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=15)
    attempts = db.query(AuthAttempt).filter(
        AuthAttempt.created_at >= cutoff,
        or_(AuthAttempt.email == email, AuthAttempt.ip_address == ip),
    ).count()
    if attempts >= 10:
        raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")


def record_attempt(db: Session, email: str, ip: str) -> None:
    db.add(AuthAttempt(email=email, ip_address=ip))
    db.commit()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    check_origin(request)
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(db, email, ip)
    if not payload.accept_terms:
        raise HTTPException(status_code=422, detail="Terms must be accepted")
    if len(payload.password.encode()) > 72:
        raise HTTPException(status_code=422, detail="Password is too long")
    if db.query(User).filter(User.email == email).first():
        record_attempt(db, email, ip)
        raise HTTPException(status_code=409, detail="Unable to create account with these details")
    user = User(
        email=email, hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name.strip(), country=payload.country,
        role="user", is_active=True, is_verified=False,
        consented_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(user)
    db.add(AuthAttempt(email=email, ip_address=ip))
    try:
        db.flush()
        issue(db, user, "verify")
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unable to create account with these details")
    db.refresh(user)
    return user


@router.post("/login", response_model=UserResponse)
def login(payload: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    check_origin(request)
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(db, email, ip)
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active or not verify_password(payload.password, user.hashed_password):
        record_attempt(db, email, ip)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = new_session_token()
    db.add(AuthSession(user_id=user.id, token_hash=token_digest(token), expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=settings.SESSION_HOURS)))
    db.commit()
    response.set_cookie(COOKIE, token, max_age=settings.SESSION_HOURS * 3600, httponly=True, secure=settings.SESSION_COOKIE_SECURE, samesite="lax", path="/")
    return user


@router.post("/admin/login", response_model=UserResponse)
def admin_login(payload: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    check_origin(request)
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    check_rate_limit(db, email, ip)
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active or not verify_password(payload.password, user.hashed_password) or user.role not in ("admin", "super_admin"):
        record_attempt(db, email, ip)
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = new_session_token()
    db.add(AuthSession(user_id=user.id, token_hash=token_digest(token), expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=settings.SESSION_HOURS)))
    db.commit()
    response.set_cookie(COOKIE, token, max_age=settings.SESSION_HOURS * 3600, httponly=True, secure=settings.SESSION_COOKIE_SECURE, samesite="lax", path="/")
    return user


@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    check_origin(request)
    token = request.cookies.get(COOKIE)
    if token:
        session = db.query(AuthSession).filter(AuthSession.token_hash == token_digest(token)).first()
        if session and session.revoked_at is None:
            session.revoked_at = datetime.now(timezone.utc).replace(tzinfo=None)
            db.commit()
    response.delete_cookie(COOKIE, path="/", secure=settings.SESSION_COOKIE_SECURE, samesite="lax")


@router.get("/session", response_model=UserResponse)
def session(user: User = Depends(get_current_user)):
    return user
