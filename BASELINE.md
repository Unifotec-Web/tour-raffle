# Tour Raffle baseline and phased plan

The authentication baseline below is historical and was committed locally as `f17f392`. Milestone 2 campaign and redemption implementation and verification are recorded in [MILESTONE_2.md](MILESTONE_2.md).

## Scope and evidence

Audit date: 17 October 2026. The existing Next.js App Router includes 58 page files, including dynamic raffle and admin-user pages. `src/components/` holds the shared navigation, footer, auth, account, dashboard, admin, and home sections. The design is in the existing JSX, Tailwind config, CSS tokens, Unsplash URLs, and `public/hero.png`. The nine PNG design references named in `Tour_Raffle.md` are absent from this checkout. The visual baseline used below is the original Git revision `c29c11017cc4e9f919b64a4873f3e1cdca1abc83`; it cannot establish a match to the missing references. The only local PNGs are `hero.png` and `public/hero.png`.

Before changes, `npm run build` passed and generated 59 static pages. `npx tsc --noEmit` failed with TS6053 while the concurrent build was regenerating `.next/types`; this was a transient generated-file race, not a source type error. The later standalone type check and updated build pass. The initial `npm audit` reported 10 vulnerabilities: 1 critical, 7 high, 2 moderate. A sandboxed audit first failed DNS; a network-enabled retry produced the report. No `AGENTS.md` was found in the project or its parent directories.

## Route and interaction inventory

| Area | Existing routes | Baseline behavior |
| --- | --- | --- |
| Public | `/`, `/about`, `/how-it-works`, `/current-raffle`, `/raffles/[id]`, `/rules`, `/winners`, `/faqs`, `/check-entry`, `/support`, `/support/contact`, `/campaigns/completed`, legal pages | Mostly static copy and fixture campaign, winner, progress, and activity data. FAQ toggles, raffle tabs/slides, and check-entry result states are local UI state. Contact form prevents submit. |
| Authentication | `/sign-up`, `/sign-in`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verification-complete`, `/account-recovery`, `/session-expired` | Sign-up and sign-in now use the API. Other forms and verification screens remain local UI only. Google/Facebook buttons have no provider integration. |
| Member | `/dashboard` and its coupons, entries, payments, transactions, receipts, notifications, support, profile, checkout, payment, and draw subroutes; `/account/*` | Private routes now check the API session. Contents are still fixtures. Purchase, entry registration, draw verification, and claim actions use local success states or alerts; no authoritative records are created. |
| Admin | `/admin`, `/admin/login`, campaigns, coupons, `/admin/users/[id]` | Admin pages are mock views. Private admin routes now check the API role. Admin login and create/generate controls remain inert or local alerts. |

Footer links to fragments such as `#contact`, `#terms`, and `#privacy` rather than the existing full routes. The master specification also calls for destination listings/details, prizes, live progress, public draw process and audit, eligibility, notification preferences, and broader admin operations that have no dedicated implemented routes. Existing route names differ from parts of the specification; keep aliases when these flows are implemented.

## Backend state after this milestone

FastAPI exposes `/health`, `/api/v1/auth/register`, `/login`, `/logout`, `/session`, `/api/v1/users/me`, and `/api/v1/admin/me`. Alembic migration `0001_initial` creates existing scaffold tables plus users, consent timestamp, sessions, and authentication attempt records. Database tables are no longer created on app import. User registration cannot assign admin roles. Sessions are revocable, expiring, and stored as digests; cookies are HTTP-only and checked server-side. The Next.js same-origin rewrite forwards auth requests, and middleware checks member/admin session permissions.

Verification used a disposable PostgreSQL 16 Compose service with an in-memory data directory. From a fresh database, `alembic upgrade head` passed, `alembic check` reported no pending operations, and all three auth tests passed against PostgreSQL. The tests covered registration, normalized and duplicate emails, invalid credentials, persistence in another client, logout and revoked-cookie reuse, expiry, unauthorized member/admin access, member/admin permissions, rate limiting, and development/production cookie settings. A headless browser also completed the existing sign-up/sign-in flow through Next.js and FastAPI, including middleware access checks, reload persistence, and logout. SQLite tests remain available for quick isolated checks.

Email verification, password recovery/reset, user profile mutation, proxy-aware abuse controls, operational audit logging, and account administration are gaps. All campaign/coupon/order/entry models remain scaffold data without business APIs or transaction rules. There is no email, payment, worker, storage, draw, capacity, or winner service. The public health endpoint does not yet check database readiness.

## Dependency and design check

Next.js moved from 15.1.0 to patched 15.5.28. Tailwind moved from 3.4.x to 4.3.3 with the existing JavaScript theme loaded through `@config`; PostCSS is pinned and overridden to 8.5.30. `npm audit --audit-level=low` reports **0 vulnerabilities**. This needed the supported Tailwind 4 PostCSS plugin and CSS import syntax; the existing theme values and component markup were retained. `npm run build` and `npx tsc --noEmit` pass. Browser comparison against the original revision found a changed desktop auth heading line height; `AuthLayout` now restores the original geometry at desktop widths.

| Auth page | Width | Original/current document size | Measured element geometry | Changed pixels |
| --- | ---: | --- | --- | ---: |
| Sign-in | 1440 px | 1440 × 1226 / 1440 × 1226 | Equal | 0.21% |
| Sign-up | 1440 px | 1440 × 1276 / 1440 × 1276 | Equal | 0.25% |
| Sign-in | 390 px | 390 × 1972 / 390 × 1972 | Equal | 0.23% |
| Sign-up | 390 px | 390 × 2147 / 390 × 2147 | Equal | 0.22% |

The pixel metric counts RGB differences greater than 24 across the three channels. Visual inspection found matching layouts, colors, imagery, form positions, and spacing. The small residual differences include different Next.js development indicator icons between the two revisions and browser color rendering; full-page screenshots and JSON results were written to `/tmp/tour-raffle-visual/`. The nine external reference PNGs remain unavailable, so only original-revision parity was verified.

## Reproduce verification

Create the disposable database from the repository root. Its PostgreSQL data is held in container memory and removed by `down`:

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/python -m pytest -q tests/test_auth.py
cd ..
```

For the browser checks, prepare the current checkout, then use separate terminals for the three servers. The original checkout is exported from the pinned revision so uncommitted work in this branch is excluded:

```bash
npm ci
npx playwright-core install chromium
```

```bash
mkdir -p /tmp/tour-raffle-original
git archive c29c11017cc4e9f919b64a4873f3e1cdca1abc83 | tar -x -C /tmp/tour-raffle-original
(cd /tmp/tour-raffle-original && npm ci && npm run dev -- -H 127.0.0.1 -p 3001)
```

```bash
cd backend
FRONTEND_URL=http://127.0.0.1:3000 DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
```

```bash
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- -H 127.0.0.1 -p 3000
```

```bash
FRONTEND_URL=http://127.0.0.1:3000 npm run verify:auth-browser
npm run verify:auth-visual
docker compose -f backend/compose.verify.yml down
```

If Chromium is already installed elsewhere, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for the browser scripts. The browser auth check creates one disposable account in the verification database. Port 8001 was used because port 8000 was occupied during this run.

## Next phases

1. **Finish identity:** configure email delivery; add single-use expiring verification and recovery tokens, password reset, account security/profile mutations, logout UI, session-expired handling, proxy-aware abuse controls, and PostgreSQL-backed integration tests. Connect existing forms without changing their visual structure.
2. **Replace fixtures with authoritative read APIs:** campaigns, destinations, availability, eligibility, coupon and entry views, pagination, and admin data. Remove local success messages until real API writes exist.
3. **Commerce and capacity:** choose provider after operational setup, add order/payment/webhook state machines, idempotency, exact capacity locking, refunds, and concurrency tests. Keep live money and entries disabled until this phase is verified.
4. **Draw and claims:** implement draw approval, immutable audit trail, deterministic verification, winner publication consent, claim workflow, and recovery tests.

Do not deploy or push this milestone yet.
