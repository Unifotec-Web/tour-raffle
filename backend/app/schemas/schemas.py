from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=72)
    full_name: str = Field(min_length=2, max_length=255)
    country: str = Field(min_length=2, max_length=100)
    accept_terms: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

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
