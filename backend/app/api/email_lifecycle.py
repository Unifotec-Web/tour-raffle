from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.api.auth import check_origin
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import AuthSession, User
from app.services.email_lifecycle import consume, issue, now, rate

router = APIRouter(prefix="/auth", tags=["auth"])

class EmailRequest(BaseModel):
    email: EmailStr


def request_link(payload: EmailRequest, request: Request, db: Session, purpose: str):
    check_origin(request)
    ip = request.client.host if request.client else "unknown"
    allowed_ip = rate(db, f"{purpose}_request_ip", ip, 10)
    allowed_email = rate(db, f"{purpose}_request_email", payload.email.lower(), 3)
    if not allowed_ip:
        raise HTTPException(429, "Too many requests. Try again later.")
    if allowed_email:
        user = db.query(User).filter(User.email == payload.email.lower(), User.is_active.is_(True)).with_for_update().first()
        if user and (purpose != "verify" or not user.is_verified):
            issue(db, user, purpose)
            db.commit()
    return {"message": "If the account is eligible, an email will be sent."}

@router.post("/verification/request", status_code=202)
def request_verification(payload: EmailRequest, request: Request, db: Session = Depends(get_db)):
    return request_link(payload, request, db, "verify")

@router.post("/password/request", status_code=202)
def request_reset(payload: EmailRequest, request: Request, db: Session = Depends(get_db)):
    return request_link(payload, request, db, "reset")

@router.post("/verification/confirm")
def confirm_verification(payload: dict, request: Request, db: Session = Depends(get_db)):
    check_origin(request)
    token = payload.get("token")
    if not isinstance(token, str) or len(token) > 200:
        raise HTTPException(400, "Link is invalid or expired")
    ip = request.client.host if request.client else "unknown"
    if not rate(db, "verify_attempt", ip, 10):
        raise HTTPException(429, "Too many attempts. Try again later.")
    user = consume(db, token, "verify")
    if not user:
        raise HTTPException(400, "Link is invalid or expired")
    user.is_verified = True
    db.commit()
    return {"message": "Email verified"}

@router.post("/password/reset")
def reset_password(payload: dict, request: Request, db: Session = Depends(get_db)):
    check_origin(request)
    token = payload.get("token")
    password = payload.get("password")
    if not isinstance(token, str) or len(token) > 200:
        raise HTTPException(400, "Link is invalid or expired")
    ip = request.client.host if request.client else "unknown"
    if not rate(db, "reset_attempt", ip, 10):
        raise HTTPException(429, "Too many attempts. Try again later.")
    if not isinstance(password, str) or len(password) < 12 or len(password.encode()) > 72:
        raise HTTPException(422, "Password must be 12 to 72 bytes")
    user = consume(db, token, "reset")
    if not user:
        raise HTTPException(400, "Link is invalid or expired")
    user.hashed_password = get_password_hash(password)
    db.query(AuthSession).filter(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)).update({"revoked_at": now()})
    db.commit()
    return {"message": "Password reset; sign in again"}
