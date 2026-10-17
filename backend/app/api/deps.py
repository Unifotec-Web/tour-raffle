from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import token_digest
from app.models.models import User, AuthSession

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    token = request.cookies.get("tour_raffle_session")
    if not token:
        raise credentials_exception
    session = db.query(AuthSession).filter(AuthSession.token_hash == token_digest(token), AuthSession.revoked_at.is_(None)).first()
    if session is None or session.expires_at <= datetime.now(timezone.utc).replace(tzinfo=None):
        raise credentials_exception
    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
