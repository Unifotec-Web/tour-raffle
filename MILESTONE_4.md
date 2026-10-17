# Milestone 4 — recoverable local/test draws

This records the implementation and verification at commit `9f784e0`. The later focused seed and algorithm review is documented in `DRAW_INTEGRITY_REVIEW.md`; that review supersedes the seed timing described below.

Branch: `codex/recoverable-draw-processing`, based on verified milestone 3 commit `bcb3efb`.

## Implemented

- Admin-only draw APIs require an authenticated admin session and the configured request origin. Mutations are enabled only when `APP_ENV` is `development` or `test` **and** `ENABLE_LOCAL_DRAW=true` (default false). Production cannot execute or publish draws through these endpoints even if the flag is set.
- `POST /api/v1/admin/draws/{campaign_id}/prepare` requires registration to be closed, the campaign counter to match all entries, every entry to be confirmed and backed by a redeemed coupon owned by the same active participant, and at least `winner_count` distinct eligible participants. Payment/order reconciliation, eligibility screening beyond these stored flags, refunds, disqualifications, and official rules approval have no implementation in this local fixture milestone; those must be completed before a production draw design is authorized.
- Preparation locks the campaign row and stores one canonical JSON snapshot per campaign with eligible entry/participant/coupon IDs, the critical campaign rules, the eligibility/winner policy, a SHA-256 hash, an algorithm version, and a 256-bit cryptographic random seed plus seed hash. A unique campaign constraint prevents a second run. Critical campaign rule edits are rejected after preparation.
- The admin separately approves the frozen snapshot, executes, and publishes. Execution requires approval and rechecks snapshot and seed hashes. Results, run state, timestamp, and success audit event commit in one PostgreSQL transaction. A failed transaction rolls back all winner rows and leaves the approved snapshot and seed intact; a separate `draw.failure` audit event records the error type when the database remains available. An abrupt process or database failure may prevent that failure event, but the `approved` run state remains recoverable.
- The `hmac-sha256-entry-weighted-v1` algorithm uses HMAC-SHA-256 blocks from the stored random seed and rejection sampling to pick one eligible entry uniformly. It then removes **all** entries of that participant before the next pick. A participant with multiple entries has a proportionally higher chance at the first selection (their entries divided by all eligible entries). For later places, the same weighting applies among participants who have not already won. No participant can win twice. Repeating execution uses the same stored seed and snapshot, so an interrupted attempt cannot silently reroll.
- PostgreSQL constraints enforce unique draw per campaign and unique winner rank, entry, and participant per run. Triggers reject snapshot/winner updates or deletion, winner insertion after execution, mutation of seed/run inputs and recorded approvers/timestamps, and backward or skipped run transitions. This protects application-level immutability; a database superuser can still bypass database controls, so external audit/backup controls are future work.
- Publication is a separate, idempotent admin action. The public API exposes only published draw metadata and hashes, not winner identities. Authenticated members see only their own published winning entry codes. The admin draw screen, member results/audit screens, and public winners summary now show server data instead of fabricated results or independent-verification claims. Prize claims, notifications, and individual public winner profiles remain outside this milestone.

## Verification

Disposable PostgreSQL: `backend/compose.verify.yml`, `127.0.0.1:55432`, database `tour_raffle_verify`. The verification volume was destroyed and recreated; Alembic upgraded an empty database through `0004_recoverable_draws`. The full suite passed: **19 tests**, including simultaneous execution, stable retries, rollback after injected failure, exactly one result set, distinct winners, immutable rows and status, permissions, production/feature guards, open campaign rejection, insufficient participants, reconciliation failures, and the existing auth, campaign, and coupon tests. The suite emits existing Pydantic, SQLAlchemy, passlib, and httpx deprecation warnings.

`npm run build` passed with Next.js 15.5.28, including lint and TypeScript validation. Browser automation passed against local FastAPI/Next with two fixture participants: both redeemed, capacity closed registration, admin prepared/approved/executed/published, retry returned the same winners, members saw no result before publication and their own result afterward, member admin access returned 403, and the audit/public summary showed published data. API failure state rendered an alert. Screenshots were captured at 1440px and 390px with no horizontal overflow (`/tmp/tour-raffle-m4-browser`).

For layout comparison, an isolated `git archive bcb3efb` frontend ran on port 3001. Desktop/mobile screenshots of the previous member results screen and admin campaign shell were compared with the new member results, audit, and admin draws screens (`/tmp/tour-raffle-m4-visual`). The shared header, sidebar, footer, colors, type, spacing, and card styling remain consistent. The results page is shorter in its truthful empty state because the previous page contained five fabricated winners. The new admin draw route had no previous counterpart. The nine PNG references named in `Tour_Raffle.md` are unavailable; the prior committed frontend served as the visual baseline.

### Reproduce

```bash
docker compose -f backend/compose.verify.yml up -d
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
```

From the repository root, run `npm run build`. For the browser check, run the backend with `APP_ENV=test FRONTEND_URL=http://127.0.0.1:3000 ENABLE_LOCAL_DRAW=true DATABASE_URL=... .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001`, and the frontend with `API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- --hostname 127.0.0.1 --port 3000`. Then run `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/home/xvira/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome DATABASE_URL=... node scripts/verify-milestone4-browser.cjs`. The browser script resets **only** the guarded disposable verification database and creates local fixture accounts/coupons; do not point it at another database.

## Remaining limits

- Production draw execution is disabled. No payments, public coupon issuance, purchase reconciliation, prize claims, notifications, independent randomness audit, public identity consent, or production scale/performance validation were added.
- The approval endpoint records one admin decision; it does not require a second person. A separate review/privacy gate before publication is still needed for production. Public output is aggregate only until consent and publication policy are specified.
- Campaign status remains `closed` after publication; `completed` transition and related lifecycle policy remain for a later milestone.
- The seed is stored in the database for deterministic recovery and is not exposed by the API. Database operators can access it; independent verification or a stronger custody model requires an approved production design.
- The local selection keeps the entry pool in memory and removes a winner's entries at each step. Scale testing against the planned campaign size is still required before production use.
