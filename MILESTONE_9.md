# Milestone 9 — email verification and account recovery

20 October 2026. Branch `codex/milestone-9-email-recovery` from `7b3b063`. This is local/test delivery; no live email provider, live payments, or production draws were enabled.

## Implemented

- Registration queues a verification email. `/api/v1/auth/verification/request` resends to an eligible account, and `/verification/confirm` marks its email verified. `/password/request` always gives the same eligible-account response for known and unknown addresses; `/password/reset` changes the password and revokes all existing sessions in the credential-consumption transaction. The existing sign-up, verification, completion, forgot/reset password, admin login, and account settings screens now show server state or server errors without changing their layout system.
- Credentials have a purpose, 30-minute reset or 24-hour verification expiry, a SHA-256 digest, and a consumed timestamp. A server HMAC secret reconstructs each credential only for delivery. PostgreSQL row locks serialize concurrent consumption and resend; resend invalidates previous unused links. No credential appears in an API response or ordinary application log. Email links use a URL fragment on the configured `FRONTEND_URL`, so the token is not sent in the initial page request.
- `email_outbox` records the pending message in the same transaction as credential issue. `python -m scripts.run_email_outbox` uses `FOR UPDATE SKIP LOCKED`, bounded retry delays, and a local `.eml` sink with restricted file permissions. Retrying a write uses the same filename and link. Worker failure leaves the row pending until retry; after eight delivery failures it is marked failed for operator review. The local sink **does contain the usable link** and must be restricted/removed after testing. No delivery provider is implemented.
- PostgreSQL rate buckets count verification/reset requests by IP and email, and consumption attempts by IP, in 15-minute windows. Per-email request throttling keeps the generic response. Admin login checks credentials and role before issuing a session cookie; unverified status remains independent of role/permissions. Account settings displays the authenticated email and actual verification flag, without a fabricated phone number.

## Verification

Disposable PostgreSQL 16 ran in a local Podman container because Docker was unavailable in this WSL environment. Migrations applied from an empty database through `0010_email_lifecycle`; `alembic check` reported **No new upgrade operations detected**. Final full backend suite: **58 passed** (561 existing deprecation warnings); targeted auth suite with outbox recovery: **6 passed** before the final added rate-limit case. Tests cover expiry, single use, concurrent verification, resend invalidation, non-enumerating recovery responses, request and attempt throttling, session revocation, admin/member boundaries, and retry after delivery failure.

`npm run build` and `npx tsc --noEmit` passed. The Playwright local-sink journey passed registration → delivered verification link → account verified → member admin-login rejection → reset email → password reset → old session rejection → new login. Seven affected auth/admin/account screens were compared to the `7b3b063` committed frontend at **1440px and 390px**: matching heading font, size, color and horizontal placement, with no horizontal overflow. Screenshots and metrics are under `/tmp/tour-raffle-m9-design`. The nine original reference PNGs remain unavailable; the committed frontend was the baseline.

Reproduce from repository root with the guarded disposable database at `127.0.0.1:55432` (user/database `tour_raffle_verify`, password `local-verify-only`):

```bash
# Docker Compose where available: docker compose -f backend/compose.verify.yml up -d
# This WSL run used: podman run -d --rm --name tour-raffle-m9-pg -e POSTGRES_USER=tour_raffle_verify -e POSTGRES_PASSWORD=local-verify-only -e POSTGRES_DB=tour_raffle_verify -p 127.0.0.1:55432:5432 docker.io/library/postgres:16-alpine
cd backend
export DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify
.venv/bin/alembic upgrade head
.venv/bin/alembic check
TEST_DATABASE_URL="$DATABASE_URL" .venv/bin/python -m pytest -q
APP_ENV=test FRONTEND_URL=http://127.0.0.1:3000 LOCAL_EMAIL_SINK_DIR=/tmp/tour-raffle-m9-mail .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
# In another terminal from repository root (the build proxy uses API port 8000):
npm run build && npx tsc --noEmit
npm run start -- -p 3000
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome node scripts/verify-milestone9-browser.cjs
```

Run the outbox worker separately with the same backend environment: `cd backend && .venv/bin/python -m scripts.run_email_outbox`. The browser script invokes it itself. For visual comparison, build the `7b3b063` frontend in an isolated `/tmp` checkout on port 3001, then run `node scripts/compare-m9-design.cjs` with both frontends running.

## Decisions and gaps

Email verification is **not** a purchase or claim prerequisite in this milestone. Requiring it for purchases or claims needs an explicit policy decision and corresponding server-side rule/tests. Social login, SMS, profile editing, change-password settings, and document delivery are deferred. The local sink proves local end-to-end behavior only; real provider acceptance, inbox delivery, bounce handling, retry operations, and sandbox/staging verification remain open. Production requires a protected `EMAIL_TOKEN_SECRET`, HTTPS frontend URL, secure cookies, provider implementation, durable worker scheduling/monitoring, and retention for rate buckets/outbox. The current production configuration rejects local delivery and the default development secret, but a provider transport has not yet been built. The email HMAC secret can reconstruct outstanding links; custody and rotation require operational policy.
