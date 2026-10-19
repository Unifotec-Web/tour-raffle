"""Orders, expiring capacity holds, verified payment events, and remedies.

Revision ID: 0006_orders_reservations
Revises: 0005_draw_seed_approval
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006_orders_reservations"
down_revision = "0005_draw_seed_approval"
branch_labels = None
depends_on = None


def upgrade():
    for name in ("unused_reservations", "active_holds", "issued_count"):
        op.add_column("campaigns", sa.Column(name, sa.Integer(), nullable=False, server_default="0"))
    op.execute("UPDATE campaigns SET issued_count = (SELECT count(*) FROM coupons WHERE coupons.campaign_id = campaigns.id)")
    op.create_check_constraint("campaign_reserved_within_capacity", "campaigns", "unused_reservations >= 0 AND active_holds >= 0 AND current_entries + unused_reservations + active_holds <= max_capacity")
    op.create_check_constraint("campaign_issuance_within_capacity", "campaigns", "issued_count >= 0 AND issued_count <= max_capacity")
    op.drop_constraint("coupon_status_valid", "coupons", type_="check")
    op.create_check_constraint("coupon_status_valid", "coupons", "status IN ('active', 'redeemed', 'unused', 'registered', 'expired', 'refunded')")
    op.add_column("coupons", sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id")))
    op.add_column("coupons", sa.Column("order_position", sa.Integer()))
    op.create_unique_constraint("uq_coupon_order_position", "coupons", ["order_id", "order_position"])
    op.add_column("orders", sa.Column("unit_amount", sa.Numeric(10, 2), nullable=False, server_default="10.00"))
    op.add_column("orders", sa.Column("currency", sa.String(3), nullable=False, server_default="USD"))
    op.add_column("orders", sa.Column("paid_amount", sa.Numeric(10, 2)))
    op.add_column("orders", sa.Column("paid_currency", sa.String(3)))
    op.add_column("orders", sa.Column("fx_snapshot", sa.Text()))
    op.add_column("orders", sa.Column("idempotency_key", sa.String(128)))
    op.add_column("orders", sa.Column("provider", sa.String(20)))
    op.add_column("orders", sa.Column("provider_reference", sa.String(255)))
    op.add_column("orders", sa.Column("provider_transaction_id", sa.String(255)))
    op.add_column("orders", sa.Column("checkout_url", sa.Text()))
    op.add_column("orders", sa.Column("paid_at", sa.DateTime()))
    op.execute("UPDATE orders SET idempotency_key = 'legacy-' || id::text, provider = 'legacy', status = CASE WHEN status = 'completed' THEN 'issued' WHEN status = 'failed' THEN 'failed' ELSE 'cancelled' END")
    op.alter_column("orders", "idempotency_key", nullable=False)
    op.alter_column("orders", "provider", nullable=False)
    op.alter_column("orders", "status", nullable=False)
    op.create_unique_constraint("uq_order_user_idempotency", "orders", ["user_id", "idempotency_key"])
    op.create_unique_constraint("uq_orders_provider_reference", "orders", ["provider_reference"])
    op.create_unique_constraint("uq_orders_provider_transaction_id", "orders", ["provider_transaction_id"])
    op.create_check_constraint("order_quantity_valid", "orders", "quantity > 0 AND quantity <= 100")
    op.create_check_constraint("order_status_valid", "orders", "status IN ('held', 'checkout_pending', 'paid_pending_issuance', 'issued', 'failed', 'cancelled', 'reconciliation_required')")
    op.create_table("checkout_holds", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=False, unique=True), sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("expires_at", sa.DateTime(), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.CheckConstraint("status IN ('active', 'converted', 'expired', 'cancelled')", name="hold_status_valid"))
    op.create_index("ix_checkout_holds_campaign_id", "checkout_holds", ["campaign_id"])
    op.create_table("provider_events", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("provider", sa.String(20), nullable=False), sa.Column("event_id", sa.String(255), nullable=False), sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=False), sa.Column("event_type", sa.String(100), nullable=False), sa.Column("transaction_id", sa.String(255)), sa.Column("payload_hash", sa.String(64), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.UniqueConstraint("provider", "event_id", name="uq_provider_event"), sa.UniqueConstraint("provider", "transaction_id", name="uq_provider_transaction"))
    op.create_table("remedy_records", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id")), sa.Column("coupon_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("coupons.id")), sa.Column("reason", sa.String(80), nullable=False), sa.Column("status", sa.String(30), nullable=False), sa.Column("details", sa.Text()), sa.Column("created_at", sa.DateTime(), nullable=False), sa.UniqueConstraint("order_id", "coupon_id", "reason", name="uq_remedy_subject_reason"))
    op.create_table("notification_records", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("coupon_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("coupons.id"), nullable=False), sa.Column("kind", sa.String(40), nullable=False), sa.Column("channel", sa.String(20), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False), sa.UniqueConstraint("coupon_id", "kind", name="uq_coupon_notification"))


def downgrade():
    for table in ("notification_records", "remedy_records", "provider_events"):
        op.drop_table(table)
    op.drop_index("ix_checkout_holds_campaign_id", table_name="checkout_holds")
    op.drop_table("checkout_holds")
    for name in ("order_status_valid", "order_quantity_valid", "uq_orders_provider_transaction_id", "uq_orders_provider_reference", "uq_order_user_idempotency"):
        op.drop_constraint(name, "orders", type_="check" if name.startswith("order_") else "unique")
    for name in ("paid_at", "checkout_url", "provider_transaction_id", "provider_reference", "provider", "idempotency_key", "fx_snapshot", "paid_currency", "paid_amount", "currency", "unit_amount"):
        op.drop_column("orders", name)
    op.drop_constraint("uq_coupon_order_position", "coupons", type_="unique")
    op.drop_column("coupons", "order_position")
    op.drop_column("coupons", "order_id")
    op.drop_constraint("coupon_status_valid", "coupons", type_="check")
    op.create_check_constraint("coupon_status_valid", "coupons", "status IN ('active', 'redeemed', 'expired')")
    op.drop_constraint("campaign_issuance_within_capacity", "campaigns", type_="check")
    op.drop_constraint("campaign_reserved_within_capacity", "campaigns", type_="check")
    for name in ("issued_count", "active_holds", "unused_reservations"):
        op.drop_column("campaigns", name)
