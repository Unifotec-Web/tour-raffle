from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    country: Optional[str] = "United States"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    country: str
    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    destination: str
    prize_value: float
    currency: Optional[str] = "USD"
    coupon_price: Optional[float] = 10.00
    max_capacity: Optional[int] = 450000
    start_date: datetime
    end_date: datetime

class CampaignResponse(CampaignCreate):
    id: UUID
    current_entries: int
    status: str

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str

class CouponValidateResponse(BaseModel):
    valid: bool
    message: str
    campaign_id: Optional[UUID] = None
