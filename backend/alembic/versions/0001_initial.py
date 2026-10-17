"""Initial schema for existing scaffold and authentication.

Revision ID: 0001_initial
Revises:
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("role", sa.String(50)),
        sa.Column("is_active", sa.Boolean()),
        sa.Column("is_verified", sa.Boolean()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("consented_at", sa.DateTime(), nullable=False))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("auth_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_index("ix_auth_sessions_user_id", "auth_sessions", ["user_id"])
    op.create_table("auth_attempts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_index("ix_auth_attempts_email_created", "auth_attempts", ["email", "created_at"])
    op.create_index("ix_auth_attempts_ip_created", "auth_attempts", ["ip_address", "created_at"])
    op.create_table("campaigns",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False), sa.Column("description", sa.Text()),
        sa.Column("destination", sa.String(255), nullable=False),
        sa.Column("prize_value", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(10)), sa.Column("coupon_price", sa.Numeric(10, 2)),
        sa.Column("max_capacity", sa.Integer()), sa.Column("current_entries", sa.Integer()),
        sa.Column("status", sa.String(50)), sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False), sa.Column("created_at", sa.DateTime()))
    op.create_table("orders",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(50)), sa.Column("created_at", sa.DateTime()))
    op.create_table("coupons",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("status", sa.String(50)), sa.Column("purchase_date", sa.DateTime()),
        sa.Column("valid_until", sa.DateTime(), nullable=False))
    op.create_index("ix_coupons_code", "coupons", ["code"], unique=True)
    op.create_table("entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("entry_code", sa.String(64), nullable=False),
        sa.Column("coupon_id", UUID(as_uuid=True), sa.ForeignKey("coupons.id"), nullable=False),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(50)), sa.Column("entry_date", sa.DateTime()))
    op.create_index("ix_entries_entry_code", "entries", ["entry_code"], unique=True)
    op.create_table("audit_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("admin_email", sa.String(255), nullable=False), sa.Column("action", sa.String(255), nullable=False),
        sa.Column("details", sa.Text()), sa.Column("ip_address", sa.String(50)),
        sa.Column("created_at", sa.DateTime()))
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])

def downgrade():
    for table in ("audit_logs", "entries", "coupons", "orders", "campaigns", "auth_attempts", "auth_sessions", "users"):
        op.drop_table(table)
