# Tour Raffle API

The backend provides PostgreSQL migrations, authentication, campaign management, coupon registration, local/test draws, and milestone 5 orders with expiring holds. Local fixture payments are available only when explicitly enabled. Stripe and Paystack sandbox adapters remain disabled without test credentials. Production payments and draws are disabled. See `MILESTONE_5.md` at the repository root for verification, configuration, and remaining gaps.

## Local run

Start PostgreSQL and create the `tour_raffle` database. From `backend/`:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Run the Next.js app from the repository root with `npm ci && npm run dev`. The default Next.js API rewrite and middleware expect FastAPI at `http://localhost:8000`. Set `API_INTERNAL_URL` for a different internal API address, and set `FRONTEND_URL` in `backend/.env` to the exact browser origin. Production requires an HTTPS frontend URL and `SESSION_COOKIE_SECURE=true`. Keep the `/api/v1` rewrite same origin so the session cookie reaches Next.js middleware. Run migrations as a separate deployment step before starting the API.

## Checks

The full backend suite requires disposable PostgreSQL. Start `docker compose -f backend/compose.verify.yml up -d` from the repository root, apply `alembic upgrade head`, run `alembic check`, then run pytest with `TEST_DATABASE_URL` set to the guarded Compose database. See `MILESTONE_5.md` for exact commands and browser checks. `python -m scripts.run_order_maintenance` is the idempotent local scheduler task for hold expiry, campaign closure, and reminders.

The cookie holds an opaque random token. Only its SHA-256 digest is stored in PostgreSQL. It is HTTP-only, SameSite=Lax, and expires after eight hours by default. The API checks request Origin for cookie-changing requests and caps failed authentication attempts per email or IP. Passwords use bcrypt. Public registration can only create the `user` role. Admin access requires the server-side `/api/v1/admin/me` check. Registration queues email verification; password reset revokes all sessions. Run `python -m scripts.run_email_outbox` with the API environment to deliver pending messages to the local `.eml` sink. Production needs a real email provider and a configured `EMAIL_TOKEN_SECRET`; local delivery does not prove provider deliverability. Verification does not currently gate purchases or claims. Commerce is local/test only, and a browser redirect never confirms payment.
