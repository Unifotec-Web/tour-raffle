from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.email_lifecycle import router as email_lifecycle_router
from app.api.campaigns import router as campaigns_router
from app.api.admin_campaigns import router as admin_campaigns_router
from app.api.draws import admin_router as admin_draws_router, public_router as draws_router
from app.api.orders import router as orders_router
from app.api.claims import router as claims_router
from app.api.public_data import router as public_data_router
from app.api.deps import get_current_user, get_current_admin
from app.models.models import User
from app.schemas.schemas import UserResponse
from fastapi import Depends

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(email_lifecycle_router, prefix=settings.API_V1_PREFIX)
app.include_router(campaigns_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_campaigns_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_draws_router, prefix=settings.API_V1_PREFIX)
app.include_router(draws_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(claims_router, prefix=settings.API_V1_PREFIX)
app.include_router(public_data_router, prefix=settings.API_V1_PREFIX)

@app.get("/api/v1/users/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/api/v1/admin/me", response_model=UserResponse)
def admin_me(user: User = Depends(get_current_admin)):
    return user

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}

@app.get("/")
def root():
    return {"message": "Welcome to Tour Raffle API v1"}
