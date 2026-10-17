from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal
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

class CampaignAdminCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=10000)
    destination: str = Field(min_length=2, max_length=255)
    prize_value: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    coupon_price: Decimal = Field(default=Decimal("10.00"), ge=0, max_digits=10, decimal_places=2)
    max_capacity: int = Field(gt=0, le=2147483647)
    winner_count: int = Field(gt=0, le=2147483647)
    start_date: datetime
    end_date: datetime
    is_featured: bool = False

    @field_validator("name", "destination")
    @classmethod
    def nonblank_text(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Value must contain at least two non-space characters")
        return value

    @field_validator("start_date", "end_date")
    @classmethod
    def normalize_utc(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("Date and time must include a timezone")
        return value.astimezone(timezone.utc).replace(tzinfo=None)

    @model_validator(mode="after")
    def check_rules(self):
        if self.start_date >= self.end_date:
            raise ValueError("End date must be after start date")
        if self.winner_count > self.max_capacity:
            raise ValueError("Winner count cannot exceed capacity")
        return self


class CampaignAdminUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=10000)
    destination: Optional[str] = Field(default=None, min_length=2, max_length=255)
    prize_value: Optional[Decimal] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, pattern=r"^[A-Z]{3}$")
    coupon_price: Optional[Decimal] = Field(default=None, ge=0)
    max_capacity: Optional[int] = Field(default=None, gt=0, le=2147483647)
    winner_count: Optional[int] = Field(default=None, gt=0, le=2147483647)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_featured: Optional[bool] = None

    @field_validator("name", "destination")
    @classmethod
    def nonblank_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Value must contain at least two non-space characters")
        return value

    @field_validator("prize_value", "coupon_price")
    @classmethod
    def check_money_precision(cls, value: Optional[Decimal]) -> Optional[Decimal]:
        if value is not None and (not value.is_finite() or value >= Decimal("100000000") or value.as_tuple().exponent < -2):
            raise ValueError("Amount must fit two decimal places and be below 100 million")
        return value

    @field_validator("start_date", "end_date")
    @classmethod
    def normalize_utc(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value is None:
            return value
        if value.tzinfo is None:
            raise ValueError("Date and time must include a timezone")
        return value.astimezone(timezone.utc).replace(tzinfo=None)


class CampaignAdminResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    destination: str
    prize_value: Decimal
    currency: str
    coupon_price: Decimal
    max_capacity: int
    winner_count: int
    current_entries: int
    status: str
    start_date: datetime
    end_date: datetime
    is_featured: bool
    created_at: datetime
    updated_at: datetime
    allowed_transitions: list[str]

    class Config:
        from_attributes = True


class CampaignStatusChange(BaseModel):
    status: str = Field(pattern=r"^(scheduled|open|closed|cancelled|completed)$")

class CouponValidateRequest(BaseModel):
    code: str

class CouponValidateResponse(BaseModel):
    valid: bool
    message: str
    campaign_id: Optional[UUID] = None

class CampaignProgress(BaseModel):
    id: UUID
    name: str
    status: str
    max_capacity: int
    current_entries: int
    remaining: int
    percentage: float
    updated_at: datetime

class CouponResponse(BaseModel):
    id: UUID
    code: str
    campaign_id: UUID
    campaign_name: str
    destination: str
    status: str
    purchase_date: datetime
    valid_until: datetime

class EntryResponse(BaseModel):
    id: UUID
    entry_code: str
    campaign_id: UUID
    campaign_name: str
    destination: str
    coupon_id: UUID
    coupon_code: str
    status: str
    entry_date: datetime

class RedemptionResponse(BaseModel):
    entry: EntryResponse
    created: bool
