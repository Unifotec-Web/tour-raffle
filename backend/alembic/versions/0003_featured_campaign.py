"""Select one campaign as the authoritative featured progress source.

Revision ID: 0003_featured_campaign
Revises: 0002_campaign_redemption
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_featured_campaign"
down_revision = "0002_campaign_redemption"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("campaigns", sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index("uq_campaigns_one_featured", "campaigns", ["is_featured"], unique=True, postgresql_where=sa.text("is_featured"))


def downgrade():
    op.drop_index("uq_campaigns_one_featured", table_name="campaigns")
    op.drop_column("campaigns", "is_featured")
