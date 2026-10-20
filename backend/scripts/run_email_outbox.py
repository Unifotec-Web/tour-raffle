from app.core.database import SessionLocal
from app.services.email_lifecycle import deliver_pending

if __name__ == "__main__":
    with SessionLocal() as db:
        print(f"Delivered {deliver_pending(db)} email messages")
