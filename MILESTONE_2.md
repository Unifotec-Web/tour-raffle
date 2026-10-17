# Milestone 2: campaigns and coupon redemption

Branch: `codex/campaigns-coupon-redemption`. The verified authentication baseline was committed locally as `f17f392` on `codex/backend-auth-baseline` before this branch was created. No push or deployment was performed.

## Implemented

- Migration `0002_campaign_redemption` adds winner count, update time, positive capacity and date checks, campaign and coupon status checks, and a unique constraint on `entries.coupon_id`. Migration `0003_featured_campaign` adds an explicit featured marker and a unique partial index so the progress API cannot select a different campaign by recency. Campaign states are `draft → scheduled → open → closed → completed`, with `draft` also able to open directly; draft, scheduled, and open may be cancelled. Transitions are checked in the service. Reaching capacity closes registration in the redemption transaction.
- Local/test fixture CLI creates a small campaign and coupons assigned to an existing member. Codes use 128 bits from Python `secrets`. The CLI rejects production environments. There is no public issuance or purchase endpoint.
- Authenticated validation and redemption check ownership. Another member receives the same 404 as for an unknown code. Redemption locks the campaign row, then the coupon row. Coupon status, entry insertion, capacity increment, and registration closure commit together. A same-owner retry returns the original entry even after the campaign closes.
- Member coupon and entry lists use API records. Loading, empty, request failure, and expired-session states are explicit. The registration screen waits for a real redemption response, distinguishes a new entry from a same-owner retry, and shows server errors in the existing card style. Full and closed campaigns have distinct error messages. The home progress component polls the explicitly featured campaign every 15 seconds and has a manual refresh button. When there is no featured campaign, it shows unavailable values rather than fabricated counts.

## Verification

On 17 October 2026, a disposable PostgreSQL 16 Compose database was started. `alembic upgrade head` applied all three migrations from an empty database; `alembic check` reported no new upgrade operations. The PostgreSQL suite passed **10 tests**, including authentication, permissions, ownership, expiry, closed registration, same-owner retry, eight simultaneous requests using one coupon, eight concurrent requests for two final slots, rollback after an injected unique-code failure, and database constraints for duplicate coupon entries, capacity, and featured-campaign uniqueness.

The Playwright browser run used three signed-up users and local fixtures against PostgreSQL. It observed five owner coupons and one initial owner entry; a valid redemption changed that coupon to Redeemed, added exactly one entry, and moved featured progress from 1/3 to 2/3. Repeating the redemption and submitting a previously used coupon returned their existing entries without changing 2/3 progress. Invalid, expired, closed, and full coupon attempts displayed distinct server messages. A second member saw only their own coupon and entry; validation and redemption of the owner's code returned 404. Empty coupon and entry lists, loading indicators, list and progress API failures, in-page 401 messages, and middleware redirect after cookie removal were verified in the browser. The browser script passed end to end.

Affected screens were captured from both this branch and the previous committed frontend (`f17f392`) at **1440 px and 390 px**. Headings and the top positions of cards and tables matched. The registration screen was 1296 px high at desktop and 1832 px at mobile in both revisions. The progress card measured 649 × 277 px at desktop and 358 × 363 px at mobile in both; its desktop x position varied by 1 px. No horizontal page overflow appeared. Coupon rows were 80 px taller in total on mobile because live 128-bit codes wrap more than the old mock codes; the entry table height changed with the number of real rows. The original layout, color, typography, imagery, cards, and spacing were retained. Screenshots and geometry JSON were written to `/tmp/tour-raffle-m2-browser/`. The nine PNG references described in `Tour_Raffle.md` remain unavailable, so the previous committed frontend was the visual baseline.

`npm run build` and `npx tsc --noEmit` passed after the browser fixes. The build includes the existing 59 routes.

Reproduce from the repository root:

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/python -m pytest -q
cd ..
npm run build
npx tsc --noEmit
docker compose -f backend/compose.verify.yml down
```

To reproduce the browser run, keep the disposable database running after migrations. In separate terminals, start the API and both frontend revisions. The prior checkout uses the same installed dependencies and is served only for comparison:

```bash
mkdir -p /tmp/tour-raffle-m2-original
git archive f17f392 | tar -x -C /tmp/tour-raffle-m2-original
ln -s "$PWD/node_modules" /tmp/tour-raffle-m2-original/node_modules
```

```bash
cd backend
FRONTEND_URL=http://127.0.0.1:3000 DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
```

```bash
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- -H 127.0.0.1 -p 3000
```

```bash
cd /tmp/tour-raffle-m2-original
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- -H 127.0.0.1 -p 3001
```

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify npm run verify:milestone2-browser
```

The browser command clears **only** the fixed disposable verification database after checking its host, port, name, user, and `APP_ENV=test`; it then signs up its own users and seeds local fixtures. Stop the servers and run `docker compose -f backend/compose.verify.yml down` afterward.

For a manual local fixture, first sign up a member, then run from `backend/` with `APP_ENV=development` and the desired `DATABASE_URL`:

```bash
.venv/bin/python -m scripts.seed_local --owner-email member@example.com --capacity 10 --winner-count 1 --coupons 2
```

The command prints coupon codes for that member. Fixture creation is a developer action and does not represent a purchase.

## Remaining gaps and decisions

- Payment integration, public coupon purchase, orders, and refunds are deferred. The treatment of paid but unredeemed coupons if a campaign closes or expires is an unresolved purchase-policy decision; no payment behavior has been assumed.
- Winner selection, draw audit, prizes and claims, email workflows, broad campaign administration, and the other mock dashboard and public pages remain future work. The current purchase links still lead to existing mock screens, so they must not be treated as a checkout.
- Campaign transitions are available as a service and fixture flow; there is no admin publishing API yet. A fixture campaign can close when full. Time-based closing after `end_date` is enforced for new redemptions but a background job to change the stored status is future work.
- An explicit featured marker now selects the progress campaign, but a future admin publishing flow must control it. Current frontend list requests are unpaginated; add pagination before large volume.
