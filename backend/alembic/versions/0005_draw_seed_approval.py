"""Commit draw entropy only with approval; freeze it thereafter.

Revision ID: 0005_draw_seed_approval
Revises: 0004_recoverable_draws
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_draw_seed_approval"
down_revision = "0004_recoverable_draws"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("draw_runs", "seed", existing_type=sa.LargeBinary(), nullable=True)
    op.alter_column("draw_runs", "seed_hash", existing_type=sa.String(64), nullable=True)
    op.execute("""CREATE OR REPLACE FUNCTION protect_draw_run_inputs() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.campaign_id IS DISTINCT FROM OLD.campaign_id
        OR NEW.algorithm_version IS DISTINCT FROM OLD.algorithm_version
        OR NEW.prepared_by IS DISTINCT FROM OLD.prepared_by
        OR NEW.prepared_at IS DISTINCT FROM OLD.prepared_at THEN
        RAISE EXCEPTION 'Draw run inputs are immutable';
      END IF;
      IF OLD.seed IS NOT NULL OR OLD.seed_hash IS NOT NULL THEN
        IF NEW.seed IS DISTINCT FROM OLD.seed OR NEW.seed_hash IS DISTINCT FROM OLD.seed_hash THEN
          RAISE EXCEPTION 'Approved draw seed is immutable';
        END IF;
      ELSIF NEW.seed IS DISTINCT FROM OLD.seed OR NEW.seed_hash IS DISTINCT FROM OLD.seed_hash THEN
        IF OLD.status <> 'prepared' OR NEW.status <> 'approved' OR NEW.seed IS NULL
          OR octet_length(NEW.seed) <> 32 OR NEW.seed_hash IS NULL
          OR NEW.seed_hash <> encode(sha256(NEW.seed), 'hex') THEN
          RAISE EXCEPTION 'Seed may be set only during approval';
        END IF;
      END IF;
      RETURN NEW;
    END $$""")
    op.execute("""CREATE OR REPLACE FUNCTION protect_draw_run_state() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF OLD.status <> NEW.status AND NOT (
        (OLD.status = 'prepared' AND NEW.status = 'approved') OR
        (OLD.status = 'approved' AND NEW.status = 'completed') OR
        (OLD.status = 'completed' AND NEW.status = 'published')) THEN
        RAISE EXCEPTION 'Invalid draw status transition';
      END IF;
      IF NEW.status <> 'prepared' AND (NEW.seed IS NULL OR NEW.seed_hash IS NULL) THEN
        RAISE EXCEPTION 'Approved draw requires a seed';
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


def downgrade():
    # Downgrade cannot safely manufacture seed commitments for prepared rows.
    op.execute("""DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM draw_runs WHERE seed IS NULL OR seed_hash IS NULL) THEN
        RAISE EXCEPTION 'Resolve unapproved prepared draws before downgrade';
      END IF;
    END $$""")
    op.execute("""CREATE OR REPLACE FUNCTION protect_draw_run_inputs() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.campaign_id IS DISTINCT FROM OLD.campaign_id OR NEW.seed IS DISTINCT FROM OLD.seed
        OR NEW.seed_hash IS DISTINCT FROM OLD.seed_hash OR NEW.algorithm_version IS DISTINCT FROM OLD.algorithm_version
        OR NEW.prepared_by IS DISTINCT FROM OLD.prepared_by OR NEW.prepared_at IS DISTINCT FROM OLD.prepared_at THEN
        RAISE EXCEPTION 'Draw run inputs are immutable';
      END IF;
      RETURN NEW;
    END $$""")
    op.alter_column("draw_runs", "seed_hash", existing_type=sa.String(64), nullable=False)
    op.alter_column("draw_runs", "seed", existing_type=sa.LargeBinary(), nullable=False)
