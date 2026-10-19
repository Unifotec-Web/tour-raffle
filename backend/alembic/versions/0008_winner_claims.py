"""Winner claims, fulfillment evidence, and claim event history."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0008_winner_claims"
down_revision = "0007_payment_remedy_review"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("winner_claims",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("winner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("draw_winners.id"), nullable=False, unique=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("contact_name", sa.String(255), nullable=False),
        sa.Column("contact_email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(40)),
        sa.Column("preference_note", sa.Text()),
        sa.Column("fulfillment_reference", sa.String(255)),
        sa.Column("fulfillment_evidence", sa.Text()),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("status IN ('submitted', 'under_review', 'needs_information', 'approved', 'rejected', 'fulfillment_pending', 'fulfilled')", name="winner_claim_status_valid"),
        sa.CheckConstraint("status <> 'fulfilled' OR (length(trim(coalesce(fulfillment_reference, ''))) > 0 AND length(trim(coalesce(fulfillment_evidence, ''))) > 0)", name="winner_claim_fulfillment_evidence_required"))
    op.create_index("ix_winner_claims_user_id", "winner_claims", ["user_id"])
    op.create_table("claim_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("claim_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("winner_claims.id"), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("actor_email", sa.String(255), nullable=False),
        sa.Column("from_status", sa.String(30)),
        sa.Column("to_status", sa.String(30), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("fulfillment_reference", sa.String(255)),
        sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_index("ix_claim_events_claim_id", "claim_events", ["claim_id"])
    op.execute("""CREATE FUNCTION protect_winner_claim() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.winner_id IS DISTINCT FROM OLD.winner_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Claim winner and owner are immutable';
      END IF;
      IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
        (OLD.status = 'submitted' AND NEW.status IN ('under_review', 'needs_information', 'rejected')) OR
        (OLD.status = 'under_review' AND NEW.status IN ('needs_information', 'approved', 'rejected')) OR
        (OLD.status = 'needs_information' AND NEW.status IN ('submitted', 'under_review', 'rejected')) OR
        (OLD.status = 'approved' AND NEW.status = 'fulfillment_pending') OR
        (OLD.status = 'fulfillment_pending' AND NEW.status = 'fulfilled')) THEN
        RAISE EXCEPTION 'Invalid claim status transition';
      END IF;
      IF OLD.status = 'fulfilled' AND (NEW.fulfillment_reference IS DISTINCT FROM OLD.fulfillment_reference
          OR NEW.fulfillment_evidence IS DISTINCT FROM OLD.fulfillment_evidence) THEN
        RAISE EXCEPTION 'Fulfillment evidence is immutable';
      END IF;
      RETURN NEW;
    END $$""")
    op.execute("CREATE TRIGGER protect_winner_claim BEFORE UPDATE ON winner_claims FOR EACH ROW EXECUTE FUNCTION protect_winner_claim()")
    op.execute("""CREATE FUNCTION protect_claim_event() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      RAISE EXCEPTION 'Claim review history is append-only';
    END $$""")
    op.execute("CREATE TRIGGER protect_claim_event BEFORE UPDATE OR DELETE ON claim_events FOR EACH ROW EXECUTE FUNCTION protect_claim_event()")


def downgrade():
    op.execute("DROP TRIGGER IF EXISTS protect_claim_event ON claim_events")
    op.execute("DROP FUNCTION IF EXISTS protect_claim_event()")
    op.execute("DROP TRIGGER IF EXISTS protect_winner_claim ON winner_claims")
    op.execute("DROP FUNCTION IF EXISTS protect_winner_claim()")
    op.drop_index("ix_claim_events_claim_id", table_name="claim_events")
    op.drop_table("claim_events")
    op.drop_index("ix_winner_claims_user_id", table_name="winner_claims")
    op.drop_table("winner_claims")
