"""Idempotent local scheduler task; run periodically with the configured database."""
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.models import Campaign
from app.services.orders import enforce_deadline, lock_campaign, schedule_reminders


def run():
    with SessionLocal() as db:
        ids = list(db.scalars(select(Campaign.id).where(Campaign.status == "open")))
    for campaign_id in ids:
        with SessionLocal() as db:
            campaign = lock_campaign(db, campaign_id)
            enforce_deadline(db, campaign)
            db.commit()
        with SessionLocal() as db:
            schedule_reminders(db, campaign_id)


if __name__ == "__main__":
    run()
