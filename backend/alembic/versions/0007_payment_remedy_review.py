"""Record non-financial remedy review decisions and their immutable history."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007_payment_remedy_review"
down_revision = "0006_orders_reservations"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("remedy_records", sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")))
    op.add_column("remedy_records", sa.Column("reviewed_at", sa.DateTime()))
    op.add_column("remedy_records", sa.Column("decision", sa.String(30)))
    op.add_column("remedy_records", sa.Column("review_reason", sa.Text()))
    op.create_table("remedy_review_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("remedy_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("remedy_records.id"), nullable=False),
        sa.Column("reviewer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("reviewer_email", sa.String(255), nullable=False),
        sa.Column("decision", sa.String(30), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_index("ix_remedy_review_events_remedy_id", "remedy_review_events", ["remedy_id"])


def downgrade():
    op.drop_index("ix_remedy_review_events_remedy_id", table_name="remedy_review_events")
    op.drop_table("remedy_review_events")
    for name in ("review_reason", "decision", "reviewed_at", "reviewed_by"):
        op.drop_column("remedy_records", name)
