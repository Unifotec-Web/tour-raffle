"""Email credentials, outbox, and rate buckets."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0010_email_lifecycle"
down_revision = "0009_lookup_buckets"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("email_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("purpose", sa.String(10), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("purpose IN ('verify', 'reset')", name="email_credential_purpose_valid"))
    op.create_index("ix_email_credentials_user_id", "email_credentials", ["user_id"])
    op.create_table("email_outbox",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("credential_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("email_credentials.id"), nullable=False, unique=True),
        sa.Column("purpose", sa.String(10), nullable=False),
        sa.Column("recipient", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("delivered_at", sa.DateTime()),
        sa.CheckConstraint("status IN ('pending', 'delivered', 'failed', 'cancelled')", name="email_outbox_status_valid"))
    op.create_table("email_rate_buckets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("scope", sa.String(40), nullable=False),
        sa.Column("principal_hash", sa.String(64), nullable=False),
        sa.Column("window_start", sa.DateTime(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.UniqueConstraint("scope", "principal_hash", "window_start", name="uq_email_rate_bucket"),
        sa.CheckConstraint("attempts > 0", name="email_rate_attempts_positive"))

def downgrade():
    op.drop_table("email_rate_buckets")
    op.drop_table("email_outbox")
    op.drop_index("ix_email_credentials_user_id", table_name="email_credentials")
    op.drop_table("email_credentials")
