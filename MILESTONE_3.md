# Milestone 3: campaign administration

Branch: `codex/campaign-administration`, created from verified milestone 2 commit `ad24102`. This milestone adds no payment, public coupon issuance, draw execution, or unrelated admin module. No push or deployment was performed.

## Implemented rules

- The existing admin campaign list and create form now use FastAPI. A campaign detail route reuses the create form styling and shows server-approved status transitions. The list has search; the list, detail, and form show loading, empty, validation, permission, API failure, and save states using existing card and text styles.
- `GET /api/v1/admin/campaigns`, `GET /{id}`, `POST`, `PATCH /{id}`, and `POST /{id}/status` require a valid server-side admin role. Writes also require the configured browser Origin. Campaign creation starts in `draft`; state changes use the milestone 2 transition service and a row lock. Scheduling requires a future start; opening requires the current registration window and available capacity. Reopening a closed campaign is disallowed. `completed` is reserved for the later draw workflow.
- Positive capacity and winner count, winner count within capacity, ordered timezone-aware dates, money precision, and nonblank name/destination are validated by the API. A campaign row lock serializes admin edits and closure with coupon redemption. Capacity cannot fall below confirmed entries or the stored entry counter. Setting capacity equal to current entries closes an open campaign in the same transaction.
- After any entry exists, including a pending entry, **name, description, capacity, and the featured marker remain editable**. Capacity must remain at or above confirmed entries and winner count. **Destination, prize value, currency, coupon price, winner count, start date, and end date are locked**. Cancellation with entries is blocked. Closing registration remains available. This policy keeps prize and entry rules stable while allowing display copy and capacity operations; reopening after a capacity closure remains disallowed.
- Campaign creation, successful edits, and status changes write `audit_logs` records in the same transaction. Capacity closure caused by redemption writes a system status audit record. Rejected or rolled-back changes write no audit record. A featured draft stays off the public progress widget until scheduled or open; no new schema migration was needed.

## Observed verification

On 17 October 2026, a disposable PostgreSQL 16 Compose database was migrated from empty to Alembic head. `alembic check` found no pending operations. **16 backend tests passed**, covering admin/member access, invalid input, permitted and locked edits (including a pending entry), capacity below two confirmed entries, audit records, scheduled and open transitions, and simultaneous admin closure and member redemption. In the race test, closure and redemption serialized on the campaign row; the campaign ended closed and its entry count equaled the number of committed entries.

The Playwright browser flow passed with a promoted local admin fixture and a separate member. It observed a real empty admin list, member API rejection with HTTP 403 and route redirect, form validation, a simulated create API failure, successful creation, opening, list search, two member redemptions, locked prize fields, rejection of capacity 1 below two entries, successful capacity 2 edit with automatic closure, loading, list API and permission errors, and redirect after session removal. The browser fixture scripts accept only `APP_ENV=test` and the fixed disposable localhost database.

Desktop (1440 px) and mobile (390 px) captures were compared with the previous committed frontend `ad24102`. On both widths, list and create headings and card top positions matched exactly, and page widths remained 1440/390 px with no new horizontal page overflow. The admin list remained 1296 px high at desktop; its mobile height changed from 1793 to 1489 px because the five mock rows became a truthful empty state. The create page grew from 1296 to 1442 px at desktop and 1913 to 2257 px at mobile because destination, price, capacity, winner count, and featured controls were added inside the original form style. The new detail route has no previous counterpart; it reuses the create form card and inputs. Captures and geometry JSON are in `/tmp/tour-raffle-m3-browser/`. The nine external reference PNGs remain unavailable, so the prior committed frontend is the visual baseline.

`npm run build`, `npx tsc --noEmit`, and `git diff --check` passed. The build includes the new `/admin/campaigns/[id]` route.

## Reproduce

From the repository root, start only the disposable database:

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/python -m pytest -q
cd ..
```

For the browser and visual checks, export the previous frontend and serve the API and two frontends in separate terminals:

```bash
mkdir -p /tmp/tour-raffle-m3-original
git archive ad24102 | tar -x -C /tmp/tour-raffle-m3-original
ln -s "$PWD/node_modules" /tmp/tour-raffle-m3-original/node_modules
```

```bash
cd backend
FRONTEND_URL=http://127.0.0.1:3000 DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
```

```bash
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- -H 127.0.0.1 -p 3000
```

```bash
cd /tmp/tour-raffle-m3-original
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- -H 127.0.0.1 -p 3001
```

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify npm run verify:milestone3-browser
```

The browser command resets the **disposable verification database only** before creating its users and fixtures. Stop the servers and remove the container with `docker compose -f backend/compose.verify.yml down`. Run `npm run build` and `npx tsc --noEmit` from the repository root.

## Remaining work

- Admin accounts are provisioned outside this UI. There is no campaign deletion, bulk operation, pagination, audit-log viewer, or automatic date-driven status job.
- Featured switching requires unfeaturing the current campaign before featuring another. Draft campaigns can be marked featured in admin data but are not displayed publicly until scheduled or open.
- Purchases, payment handling, public coupon issuance, and draw completion remain deferred. The treatment of paid but unredeemed coupons from milestone 2 remains unresolved; no payment behavior is assumed here.
