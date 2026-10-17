import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Text, Index, CheckConstraint, LargeBinary, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    role = Column(String(50), default="user") # user, admin, super_admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    consented_at = Column(DateTime, nullable=False)

class AuthSession(Base):
    __tablename__ = "auth_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AuthAttempt(Base):
    __tablename__ = "auth_attempts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (Index("ix_auth_attempts_email_created", "email", "created_at"), Index("ix_auth_attempts_ip_created", "ip_address", "created_at"))

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    destination = Column(String(255), nullable=False)
    prize_value = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    coupon_price = Column(Numeric(10, 2), default=10.00)
    max_capacity = Column(Integer, default=450000, nullable=False)
    current_entries = Column(Integer, default=0, nullable=False)
    winner_count = Column(Integer, default=1, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="draft", nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        CheckConstraint("max_capacity > 0", name="campaign_capacity_positive"),
        CheckConstraint("current_entries >= 0 AND current_entries <= max_capacity", name="campaign_entries_within_capacity"),
        CheckConstraint("winner_count > 0 AND winner_count <= max_capacity", name="campaign_winners_within_capacity"),
        CheckConstraint("start_date < end_date", name="campaign_dates_ordered"),
        CheckConstraint("status IN ('draft', 'scheduled', 'open', 'closed', 'completed', 'cancelled')", name="campaign_status_valid"),
        Index("uq_campaigns_one_featured", "is_featured", unique=True, postgresql_where=text("is_featured"), sqlite_where=text("is_featured")),
    )

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(64), unique=True, index=True, nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="active", nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    __table_args__ = (CheckConstraint("status IN ('active', 'redeemed', 'expired')", name="coupon_status_valid"),)

class Entry(Base):
    __tablename__ = "entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_code = Column(String(64), unique=True, index=True, nullable=False)
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=False, unique=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="confirmed") # confirmed, pending, invalid
    entry_date = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="pending") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

class DrawRun(Base):
    __tablename__ = "draw_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, unique=True)
    status = Column(String(20), nullable=False, default="prepared")
    seed = Column(LargeBinary, nullable=False)
    seed_hash = Column(String(64), nullable=False)
    algorithm_version = Column(String(40), nullable=False)
    prepared_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    executed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    published_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    prepared_at = Column(DateTime, nullable=False)
    approved_at = Column(DateTime)
    executed_at = Column(DateTime)
    published_at = Column(DateTime)
    __table_args__ = (CheckConstraint("status IN ('prepared', 'approved', 'completed', 'published')", name="draw_status_valid"),)

class DrawSnapshot(Base):
    __tablename__ = "draw_snapshots"
    run_id = Column(UUID(as_uuid=True), ForeignKey("draw_runs.id"), primary_key=True)
    content = Column(Text, nullable=False)
    hash = Column(String(64), nullable=False)
    entry_count = Column(Integer, nullable=False)
    participant_count = Column(Integer, nullable=False)
    winner_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)

class DrawWinner(Base):
    __tablename__ = "draw_winners"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("draw_runs.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    entry_id = Column(UUID(as_uuid=True), ForeignKey("entries.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    __table_args__ = (
        UniqueConstraint("run_id", "rank", name="uq_draw_rank"),
        UniqueConstraint("run_id", "entry_id", name="uq_draw_entry"),
        UniqueConstraint("run_id", "user_id", name="uq_draw_participant"),
    )
