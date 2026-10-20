"""Write disposable local demo credentials outside the repository."""
import argparse
import os
import secrets
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--output", default="/tmp/tour-raffle-demo.env")
args = parser.parse_args()
path = Path(args.output)
if path.exists():
    parser.error(f"{path} already exists; remove it explicitly before creating new credentials")
values = {
    "APP_ENV": "test",
    "FRONTEND_URL": "http://127.0.0.1:3000",
    "DATABASE_URL": "postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify",
    "EMAIL_DELIVERY_MODE": "local",
    "LOCAL_EMAIL_SINK_DIR": "/tmp/tour-raffle-demo-mail",
    "ENABLE_FAKE_PAYMENTS": "true",
    "ENABLE_LOCAL_DRAW": "true",
    "ENABLE_STRIPE_SANDBOX": "false",
    "ENABLE_PAYSTACK_SANDBOX": "false",
    "DEMO_RESET_DB": "1",
    "DEMO_PASSWORD": secrets.token_urlsafe(24),
    "FAKE_PAYMENT_SECRET": secrets.token_urlsafe(32),
    "EMAIL_TOKEN_SECRET": secrets.token_urlsafe(32),
}
path.parent.mkdir(parents=True, exist_ok=True)
fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, "w") as file:
    for key, value in values.items():
        file.write(f"export {key}={value}\n")
print(f"Created {path} with mode 0600. Source it in local API and browser terminals; keep it outside version control.")
