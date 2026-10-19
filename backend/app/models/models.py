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
    unused_reservations = Column(Integer, default=0, nullable=False)
    active_holds = Column(Integer, default=0, nullable=False)
    issued_count = Column(Integer, default=0, nullable=False)
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
        CheckConstraint("unused_reservations >= 0 AND active_holds >= 0 AND current_entries + unused_reservations + active_holds <= max_capacity", name="campaign_reserved_within_capacity"),
        CheckConstraint("issued_count >= 0 AND issued_count <= max_capacity", name="campaign_issuance_within_capacity"),
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
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    order_position = Column(Integer)
    __table_args__ = (CheckConstraint("status IN ('active', 'redeemed', 'unused', 'registered', 'expired', 'refunded')", name="coupon_status_valid"), UniqueConstraint("order_id", "order_position", name="uq_coupon_order_position"))

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
    unit_amount = Column(Numeric(10, 2), nullable=False, default=10)
    currency = Column(String(3), nullable=False, default="USD")
    paid_amount = Column(Numeric(10, 2))
    paid_currency = Column(String(3))
    fx_snapshot = Column(Text)
    idempotency_key = Column(String(128), nullable=False)
    provider = Column(String(20), nullable=False)
    provider_reference = Column(String(255), unique=True)
    provider_transaction_id = Column(String(255), unique=True)
    checkout_url = Column(Text)
    status = Column(String(50), default="held", nullable=False)
    paid_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key", name="uq_order_user_idempotency"), CheckConstraint("quantity > 0 AND quantity <= 100", name="order_quantity_valid"), CheckConstraint("status IN ('held', 'checkout_pending', 'paid_pending_issuance', 'issued', 'failed', 'cancelled', 'reconciliation_required')", name="order_status_valid"))

class CheckoutHold(Base):
    __tablename__ = "checkout_holds"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, unique=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="active")
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    __table_args__ = (CheckConstraint("status IN ('active', 'converted', 'expired', 'cancelled')", name="hold_status_valid"),)

class ProviderEvent(Base):
    __tablename__ = "provider_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(20), nullable=False)
    event_id = Column(String(255), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    transaction_id = Column(String(255))
    payload_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("provider", "event_id", name="uq_provider_event"), UniqueConstraint("provider", "transaction_id", name="uq_provider_transaction"))

class RemedyRecord(Base):
    __tablename__ = "remedy_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id"))
    reason = Column(String(80), nullable=False)
    status = Column(String(30), nullable=False, default="pending_review")
    details = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    decision = Column(String(30))
    review_reason = Column(Text)
    __table_args__ = (UniqueConstraint("order_id", "coupon_id", "reason", name="uq_remedy_subject_reason"),)

class RemedyReviewEvent(Base):
    __tablename__ = "remedy_review_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    remedy_id = Column(UUID(as_uuid=True), ForeignKey("remedy_records.id"), nullable=False, index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reviewer_email = Column(String(255), nullable=False)
    decision = Column(String(30), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

class NotificationRecord(Base):
    __tablename__ = "notification_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=False)
    kind = Column(String(40), nullable=False)
    channel = Column(String(20), nullable=False, default="local_sink")
    status = Column(String(20), nullable=False, default="recorded")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("coupon_id", "kind", name="uq_coupon_notification"),)

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
    seed = Column(LargeBinary)
    seed_hash = Column(String(64))
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

class WinnerClaim(Base):
    __tablename__ = "winner_claims"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    winner_id = Column(UUID(as_uuid=True), ForeignKey("draw_winners.id"), nullable=False, unique=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="submitted")
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(40))
    preference_note = Column(Text)
    fulfillment_reference = Column(String(255))
    fulfillment_evidence = Column(Text)
    submitted_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    __table_args__ = (
        CheckConstraint("status IN ('submitted', 'under_review', 'needs_information', 'approved', 'rejected', 'fulfillment_pending', 'fulfilled')", name="winner_claim_status_valid"),
        CheckConstraint("status <> 'fulfilled' OR (length(trim(coalesce(fulfillment_reference, ''))) > 0 AND length(trim(coalesce(fulfillment_evidence, ''))) > 0)", name="winner_claim_fulfillment_evidence_required"),
    )

class ClaimEvent(Base):
    __tablename__ = "claim_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey("winner_claims.id"), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    actor_email = Column(String(255), nullable=False)
    from_status = Column(String(30))
    to_status = Column(String(30), nullable=False)
    reason = Column(Text, nullable=False)
    fulfillment_reference = Column(String(255))
    created_at = Column(DateTime, nullable=False)
