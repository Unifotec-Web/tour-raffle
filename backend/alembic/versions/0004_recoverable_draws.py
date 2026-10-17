"""Frozen draw inputs, recoverable run state and immutable winners.

Revision ID: 0004_recoverable_draws
Revises: 0003_featured_campaign
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0004_recoverable_draws"
down_revision = "0003_featured_campaign"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("draw_runs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False, unique=True),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("seed", sa.LargeBinary(), nullable=False),
        sa.Column("seed_hash", sa.String(64), nullable=False),
        sa.Column("algorithm_version", sa.String(40), nullable=False),
        sa.Column("prepared_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("approved_by", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("executed_by", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("published_by", UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("prepared_at", sa.DateTime(), nullable=False),
        sa.Column("approved_at", sa.DateTime()),
        sa.Column("executed_at", sa.DateTime()),
        sa.Column("published_at", sa.DateTime()),
        sa.CheckConstraint("status IN ('prepared', 'approved', 'completed', 'published')", name="draw_status_valid"))
    op.create_table("draw_snapshots",
        sa.Column("run_id", UUID(as_uuid=True), sa.ForeignKey("draw_runs.id"), primary_key=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("hash", sa.String(64), nullable=False),
        sa.Column("entry_count", sa.Integer(), nullable=False),
        sa.Column("participant_count", sa.Integer(), nullable=False),
        sa.Column("winner_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_table("draw_winners",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("run_id", UUID(as_uuid=True), sa.ForeignKey("draw_runs.id"), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("entry_id", UUID(as_uuid=True), sa.ForeignKey("entries.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.UniqueConstraint("run_id", "rank", name="uq_draw_rank"),
        sa.UniqueConstraint("run_id", "entry_id", name="uq_draw_entry"),
        sa.UniqueConstraint("run_id", "user_id", name="uq_draw_participant"))
    op.execute("""CREATE FUNCTION reject_draw_immutable_change() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Draw snapshot and winners are immutable'; END $$""")
    for table in ("draw_snapshots", "draw_winners"):
        op.execute(f"CREATE TRIGGER protect_{table} BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW EXECUTE FUNCTION reject_draw_immutable_change()")
    op.execute("""CREATE FUNCTION protect_draw_run_inputs() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.campaign_id IS DISTINCT FROM OLD.campaign_id OR NEW.seed IS DISTINCT FROM OLD.seed
        OR NEW.seed_hash IS DISTINCT FROM OLD.seed_hash OR NEW.algorithm_version IS DISTINCT FROM OLD.algorithm_version
        OR NEW.prepared_by IS DISTINCT FROM OLD.prepared_by OR NEW.prepared_at IS DISTINCT FROM OLD.prepared_at THEN
        RAISE EXCEPTION 'Draw run inputs are immutable';
      END IF;
      RETURN NEW;
    END $$""")
    op.execute("CREATE TRIGGER protect_draw_inputs BEFORE UPDATE ON draw_runs FOR EACH ROW EXECUTE FUNCTION protect_draw_run_inputs()")
    op.execute("""CREATE FUNCTION protect_draw_run_state() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF OLD.status <> NEW.status AND NOT (
        (OLD.status = 'prepared' AND NEW.status = 'approved') OR
        (OLD.status = 'approved' AND NEW.status = 'completed') OR
        (OLD.status = 'completed' AND NEW.status = 'published')) THEN
        RAISE EXCEPTION 'Invalid draw status transition';
      END IF;
      IF OLD.approved_at IS NOT NULL AND NEW.approved_at IS DISTINCT FROM OLD.approved_at OR
         OLD.approved_by IS NOT NULL AND NEW.approved_by IS DISTINCT FROM OLD.approved_by OR
         OLD.executed_at IS NOT NULL AND NEW.executed_at IS DISTINCT FROM OLD.executed_at OR
         OLD.executed_by IS NOT NULL AND NEW.executed_by IS DISTINCT FROM OLD.executed_by OR
         OLD.published_by IS NOT NULL AND NEW.published_by IS DISTINCT FROM OLD.published_by OR
         OLD.published_at IS NOT NULL AND NEW.published_at IS DISTINCT FROM OLD.published_at THEN
        RAISE EXCEPTION 'Draw timestamps are immutable';
      END IF;
      RETURN NEW;
    END $$""")
    op.execute("CREATE TRIGGER protect_draw_state BEFORE UPDATE ON draw_runs FOR EACH ROW EXECUTE FUNCTION protect_draw_run_state()")
    op.execute("""CREATE FUNCTION protect_draw_winner_insert() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF (SELECT status FROM draw_runs WHERE id = NEW.run_id) <> 'approved' THEN
        RAISE EXCEPTION 'Winners may only be inserted during approved execution';
      END IF;
      RETURN NEW;
    END $$""")
    op.execute("CREATE TRIGGER protect_draw_winner_creation BEFORE INSERT ON draw_winners FOR EACH ROW EXECUTE FUNCTION protect_draw_winner_insert()")


def downgrade():
    op.execute("DROP FUNCTION protect_draw_winner_insert() CASCADE")
    op.execute("DROP FUNCTION protect_draw_run_state() CASCADE")
    op.execute("DROP FUNCTION protect_draw_run_inputs() CASCADE")
    op.execute("DROP FUNCTION reject_draw_immutable_change() CASCADE")
    op.drop_table("draw_winners")
    op.drop_table("draw_snapshots")
    op.drop_table("draw_runs")
