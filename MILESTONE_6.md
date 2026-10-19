# Milestone 6 — payment reconciliation and remedy administration

Branch: `codex/payment-reconciliation-remedies` from `69e4781`. Local/test only. Live payments and production draws remain disabled; nothing was pushed or deployed.

## Implemented

- Admin order list and detail routes show paginated results with independent payment, coupon issuance, and remedy states. The list filters by those states, provider, and campaign. The member payment detail route is owner-only and explains the next step without claiming that a redirect proves payment.
- Admin reconciliation queries the configured sandbox adapter. Stripe retrieves the current test Checkout Session; Paystack verifies the test transaction by reference. A paid result must match the stored reference, server order ID, amount, and currency before the existing `confirm_payment` and `issue_paid_order` services run. Provider failures return 503 and create an audit event without changing the order. The fake provider has no external ledger, so its built-in query reports pending; tests inject a deterministic fake provider response.
- Repeated and concurrent reconciliation uses the existing campaign-first row locks and unique provider event/transaction constraints. Locked entities now refresh ORM state after waiting for another transaction. Issuance remains idempotent. The targeted recovery action runs the same issuance service for a previously verified paid order. Closure and draw snapshot rules in that service prevent late issuance from changing frozen eligibility.
- The remedy queue has filters, pagination, detail, review history, reviewer identity, decision, reason, and audit events. Allowed decisions are **investigate**, **escalate**, and **defer**. They record administrative review only; no endpoint forfeits payment, refunds it, or replaces a coupon.
- New screens use existing `AdminLayout`, `DashboardLayout`, colors, type, cards, controls, and spacing. Existing My Payments links now open the member detail page. The previously ignored `src/lib/auth.ts` and `src/lib/orders.ts` are tracked for reproducible fresh checkouts.

The adapter query follows the official [Stripe Checkout Session retrieval API](https://docs.stripe.com/api/checkout/sessions/retrieve) and [Paystack transaction verification API](https://paystack.com/docs/api/transaction/). Reconciliation never trusts the browser callback URL.

## Verification observed

Disposable PostgreSQL 16 used `backend/compose.verify.yml`. Alembic upgraded an empty database through `0007_payment_remedy_review`; `alembic check` reported `No new upgrade operations detected`.

- Complete backend suite: **46 passed** on PostgreSQL. Focused tests covered member rejection, paginated status filters, four concurrent reconciliations producing one coupon and one provider transaction, four concurrent recovery requests after interrupted issuance producing one coupon, provider failure, amount mismatch, expired unused coupons entering the review queue without a refund, remedy review history and audit events, and an unchanged draw snapshot after a reconciliation attempt on a closed campaign. Stripe and Paystack query adapters were tested with mocked HTTP responses. No real Stripe or Paystack sandbox credentials were available; no real provider call was verified.
- `npm run build` and `npx tsc --noEmit` passed. `npm audit --json` reported **0 vulnerabilities**. `git diff --check` passed.
- Playwright Chromium passed the existing test-mode registration → fake checkout/payment → coupon → redemption → closure → draw-boundary journey. The milestone 6 journey passed member/admin permission checks, member payment detail states, admin pagination and detail, fake-provider pending reconciliation, remedy review, and screenshots at **1440px and 390px**. All six affected screens had no horizontal overflow. Artifacts: `/tmp/tour-raffle-m6-browser`.
- An isolated archive of commit `69e4781` was served on port 3001. My Payments and the shared admin shell matched the original heading typography/color and shell geometry at **1440px and 390px**; screenshots and metrics are in `/tmp/tour-raffle-m6-design`. The new detail and remedy routes have no counterpart in that commit, so their layout was checked against the existing shell and browser screenshots. The original revision omitted the ignored `src/lib/auth.ts` and `src/lib/orders.ts`; those local helper files were copied into the isolated archive solely to make the previous frontend build. The nine reference PNGs remain unavailable, so the prior committed frontend is the visual baseline.

## Reproduce

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
cd ..
npx tsc --noEmit
API_INTERNAL_URL=http://127.0.0.1:8001 npm run build
npm audit --json
```

For browser verification, run FastAPI on `127.0.0.1:8001` with `APP_ENV=test`, `ENABLE_FAKE_PAYMENTS=true`, `FAKE_PAYMENT_SECRET=local-browser-only`, `ENABLE_LOCAL_DRAW=true`, `FRONTEND_URL=http://127.0.0.1:3000`, and the disposable database URL. Run the built frontend with `API_INTERNAL_URL=http://127.0.0.1:8001 npm run start -- -p 3000`. With `PLAYWRIGHT_CHROMIUM_EXECUTABLE` and `DATABASE_URL` set, run `node scripts/verify-milestone5-browser.cjs` (it resets the disposable fixture database), then `node scripts/verify-milestone6-browser.cjs`. The design script also needs an isolated `69e4781` frontend on port 3001: `node scripts/compare-m6-design.cjs`.

## Remaining gaps and decisions

- Real sandbox verification requires explicit test credentials: `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_WEBHOOK_SECRET=whsec_...`, `ENABLE_STRIPE_SANDBOX=true`, or `PAYSTACK_SECRET_KEY=sk_test_...`, `ENABLE_PAYSTACK_SANDBOX=true`; a reachable sandbox webhook endpoint and matching test account are also required. Fake-provider tests and mocked HTTP adapter tests are **not** real sandbox verification.
- The remedy policy for paid but unissued orders, expired unused coupons, disputes, and refunds is undecided. Review decisions do not execute financial or coupon actions. Provider reconciliation is an explicit admin action; no scheduled provider sweep was added. Fake-provider query cannot recover an unobserved fake payment because it has no independent provider ledger.
- Broad admin modules, live payments, production draws, claims, and notifications remain outside this milestone. Database operators can still read the draw seed, as recorded in `BASELINE.md`.
