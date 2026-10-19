"""Persist owner lookup rate limits across API workers."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0009_lookup_buckets"
down_revision = "0008_winner_claims"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("lookup_buckets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("scope", sa.String(30), nullable=False),
        sa.Column("window_start", sa.DateTime(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.UniqueConstraint("user_id", "scope", "window_start", name="uq_lookup_bucket"),
        sa.CheckConstraint("attempts > 0", name="lookup_attempts_positive"))

def downgrade():
    op.drop_table("lookup_buckets")
