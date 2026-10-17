"""Campaign rules and single-use coupon entries.

Revision ID: 0002_campaign_redemption
Revises: 0001_initial
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_campaign_redemption"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("campaigns", sa.Column("winner_count", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("campaigns", sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    op.execute("UPDATE campaigns SET status = 'open' WHERE status = 'active'")
    op.execute("UPDATE campaigns SET status = 'draft' WHERE status IS NULL")
    op.execute("UPDATE campaigns SET max_capacity = 450000 WHERE max_capacity IS NULL")
    op.execute("UPDATE campaigns SET current_entries = 0 WHERE current_entries IS NULL")
    op.alter_column("campaigns", "status", nullable=False)
    op.alter_column("campaigns", "max_capacity", nullable=False)
    op.alter_column("campaigns", "current_entries", nullable=False)
    op.create_check_constraint("campaign_capacity_positive", "campaigns", "max_capacity > 0")
    op.create_check_constraint("campaign_entries_within_capacity", "campaigns", "current_entries >= 0 AND current_entries <= max_capacity")
    op.create_check_constraint("campaign_winners_within_capacity", "campaigns", "winner_count > 0 AND winner_count <= max_capacity")
    op.create_check_constraint("campaign_dates_ordered", "campaigns", "start_date < end_date")
    op.create_check_constraint("campaign_status_valid", "campaigns", "status IN ('draft', 'scheduled', 'open', 'closed', 'completed', 'cancelled')")
    op.execute("UPDATE coupons SET status = 'active' WHERE status IS NULL OR status = 'reserved'")
    op.alter_column("coupons", "status", nullable=False)
    op.create_check_constraint("coupon_status_valid", "coupons", "status IN ('active', 'redeemed', 'expired')")
    op.create_unique_constraint("uq_entries_coupon_id", "entries", ["coupon_id"])


def downgrade():
    op.drop_constraint("uq_entries_coupon_id", "entries", type_="unique")
    op.drop_constraint("coupon_status_valid", "coupons", type_="check")
    op.alter_column("coupons", "status", nullable=True)
    for name in ("campaign_status_valid", "campaign_dates_ordered", "campaign_winners_within_capacity", "campaign_entries_within_capacity", "campaign_capacity_positive"):
        op.drop_constraint(name, "campaigns", type_="check")
    op.alter_column("campaigns", "current_entries", nullable=True)
    op.alter_column("campaigns", "max_capacity", nullable=True)
    op.alter_column("campaigns", "status", nullable=True)
    op.execute("UPDATE campaigns SET status = 'active' WHERE status = 'open'")
    op.drop_column("campaigns", "updated_at")
    op.drop_column("campaigns", "winner_count")
