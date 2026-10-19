# Milestone 7 — winner claims and review

Branch: `codex/winner-claims-review` from `a58182a`. Local commit only; no push or deployment. Live payments and production draw execution remain disabled.

## Implemented

- **My Wins** reads only published draw winners owned by the authenticated member. It links each win to a claim or its current claim status. The existing results, claim instructions, claim form, and claim status screens now use API data. Fabricated names, dates, required identity documents, voucher promises, and timer/alert success were removed without changing the page layout, color system, typography, or card styling.
- A winner can submit one claim per published win. PostgreSQL uniquely constrains `winner_id`, and the submission transaction locks the winner row; retries return the existing claim. The server snapshots the account name and email as contact details and accepts optional phone and preference note. Another member receives 404 for the win or claim. The member can reply when the claim is `needs_information`.
- Admins have a paginated/filterable claim list, detail, and append-only review events with actor, reason, timestamp, and status transition. Review events and the existing audit log commit in the same PostgreSQL transaction as the claim status. Every admin review supplies the status observed by the reviewer; a concurrent stale decision returns 409.
- Allowed states are `submitted → under_review / needs_information / rejected`, `under_review → needs_information / approved / rejected`, `needs_information → submitted` (member reply) or `under_review / rejected` (admin), `approved → fulfillment_pending`, and `fulfillment_pending → fulfilled`. `rejected` and `fulfilled` are terminal. A PostgreSQL trigger and API checks both enforce transitions. Winner and owner associations are immutable.
- Approval records a decision only. To mark a claim `fulfilled`, an admin must record **both** a fulfillment reference and evidence text. PostgreSQL checks the fulfilled state, and its evidence becomes immutable. No external payout, voucher issuance, document upload, or identity verification was implemented.
- `/draws/published` still exposes campaign-level published results without participant IDs, entry codes, contact details, claims, or seed material. Claim data remains behind member ownership or admin role checks.

## Requirements left configurable or undecided

`CLAIM_REQUIRE_PHONE=false` and `CLAIM_REQUIRE_PREFERENCE_NOTE=false` are explicit environment flags in `backend/.env.example`. The API exposes these to the form. No claim deadline is configured or enforced. Identity document requirements, consent/public winner profile rules, review criteria, fulfillment method, and any deadline need a confirmed policy before implementation. Document uploads and external payouts are deferred. The generic reference/evidence fields record a completed local/test fulfillment decision; they do not prove delivery by an outside system.

## Verification observed

- Disposable PostgreSQL 16 via `backend/compose.verify.yml`: Alembic applied migrations from an empty database through `0008_winner_claims`; `alembic check` reported `No new upgrade operations detected`.
- Full backend suite: **50 passed**. Claim tests covered unpublished result rejection, owner/admin boundaries, six concurrent submissions yielding one claim, PostgreSQL uniqueness and transition guards, concurrent stale review rejection, member information response, invalid transitions, rejection terminality, fulfillment evidence checks, and rollback when audit logging fails. Event and audit counts matched after completed transitions.
- `npm run build`, `npx tsc --noEmit`, and `git diff --check` passed. `npm audit --json` reported **0 vulnerabilities**.
- Playwright Chromium completed registration/login, fixture coupon redemption, draw preparation/approval/execution/publication, then member claim submission and retry, admin information request, member response, approval, fulfillment pending, and fulfillment with evidence. It checked member/admin boundaries and the public result's privacy. The six affected screens were captured at **1440px and 390px**, with no horizontal overflow. Screenshots: `/tmp/tour-raffle-m7-browser`.
- An isolated frontend from `a58182a` ran on port 3001. Existing results, instructions, form, and status routes plus the shared admin shell were compared at **1440px and 390px**. Heading typography/color and shell geometry matched. The original claim content contained fabricated sample details, so content height and text necessarily differ. New admin claim routes have no prior counterpart. Screenshot pairs and metrics: `/tmp/tour-raffle-m7-design`. The nine reference PNGs remain unavailable; the prior committed frontend was the visual baseline.

## Reproduce

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
cd ..
API_INTERNAL_URL=http://127.0.0.1:8001 npm run build
npx tsc --noEmit
npm audit --json
```

For browser verification, serve FastAPI on port 8001 with `APP_ENV=test`, `ENABLE_LOCAL_DRAW=true`, `FRONTEND_URL=http://127.0.0.1:3000`, and the disposable database URL. Serve the built Next.js frontend on port 3000 with `API_INTERNAL_URL=http://127.0.0.1:8001`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` and `DATABASE_URL`, then run `node scripts/verify-integration-browser.cjs` (resets only the guarded disposable database) followed by `node scripts/verify-milestone7-browser.cjs`. For the design comparison, serve an isolated `git archive a58182a` frontend on port 3001 and run `node scripts/compare-m7-design.cjs`.

## Remaining blockers

Real Stripe/Paystack sandbox verification still needs credentials and reachable webhooks. The paid-coupon remedy policy remains undecided. Production draw execution and live payments remain disabled. Database operators can access draw seeds as documented in `BASELINE.md`; this milestone does not alter that limitation.
