# Milestone 5 — orders, capacity reservations, sandbox payments

Branch: `codex/orders-reservations-sandbox-payments`, based on verified integration commit `70dc92a`. This is an internal local/test implementation. Nothing was pushed or deployed. Live payments and production draws remain disabled.

## Confirmed product rules from Oscar

- Every coupon costs **exactly $10.00 USD**; there are no discounts. An order for quantity `q` costs `q × $10.00 USD`, calculated on the server. Campaign `currency` describes the prize value; the coupon/order currency is USD.
- Each successfully purchased coupon reserves one campaign slot and receives one unique, cryptographically generated code. Purchase alone does not qualify for the draw: the owner must register the code before closure.
- Purchased coupon states are `unused`, `registered`, `expired`, and `refunded`. Legacy local fixtures retain `active` and `redeemed` compatibility. `refunded` is reserved for an explicitly reviewed resolution; a refund/dispute notification creates a review record and does not silently alter an entry or frozen draw.
- Unused coupons expire at registration closure and are excluded from eligibility. Expiry neither automatically refunds nor forfeits payment. A separate `pending_review` remedy record is created per expired purchased coupon.
- Stripe and Paystack use interchangeable, disabled-by-default sandbox adapters. Neither activates without explicit configuration. A browser redirect is never accepted as proof of payment.
- Orders retain requested unit/total amount and currency, verified paid amount/currency, provider reference/transaction ID, and an exchange-rate snapshot when applicable. Current USD-only successful charges record USD→USD at 1:1; mismatched-currency payments retain original paid currency and require review because no trustworthy FX rate was supplied.
- Registration closes at the confirmed registered-entry limit or configured deadline, whichever comes first. The registration transaction enforces the deadline even if maintenance has not run.

## Implementation and counting rules

Migration `0006_orders_reservations` adds capacity counters, checkout holds, provider events, order snapshots and states, coupon order positions, remedy records, and notification records. It backfills `issued_count` from existing codes; a database with more historical codes than campaign capacity must be reconciled before migration rather than silently oversold. The guarded local fixture issuer now locks and counts issuance too.

A checkout hold lasts **30 minutes by default** (`CHECKOUT_HOLD_MINUTES`, 1–60). Each mutation locks the campaign row first, then order/hold/coupon rows. Under that lock, creation checks both:

```text
confirmed registered entries + unused purchased reservations + active checkout holds <= campaign capacity
cumulative issued codes + active checkout holds <= campaign capacity
```

The first check protects actual slot allocation. The second deliberately avoids recycling expired or refunded issued codes into new sales until a replacement policy is confirmed. A verified payment converts its active hold into purchased reservations; coupon issuance is a separate, retryable transaction with unique `(order_id, order_position)` positions. Registration moves one purchased reservation into one confirmed entry without increasing occupancy. The one-entry-per-coupon database constraint remains in force. Successful redemption retries return the existing entry without changing counters.

When a verified payment arrives after its hold expired, the callback locks the campaign and reacquires capacity only if registration is still open and both limits allow it. Otherwise the order stores the payment and enters `reconciliation_required` with a remedy record. If issuance is interrupted, `paid_pending_issuance` and its reserved slots remain committed for `/admin/orders/recover`; closure instead records `paid_unissued_at_closure` for review. Deadline or admin closure expires active holds and unused coupons in the same campaign transaction. Draw preparation also enforces delayed deadline closure before building its immutable entry snapshot. Late callbacks cannot reopen the campaign or add to that snapshot.

Order states are `held`, `checkout_pending`, `paid_pending_issuance`, `issued`, `failed`, `cancelled`, and `reconciliation_required`. `hold_expired` is a truthful API projection of an expired hold awaiting any late provider outcome. Provider event IDs and transaction IDs are unique, duplicates are idempotent, and failure events cannot reverse a recorded successful payment. Mismatched amount/currency callbacks are rejected for issuance but retain the observed paid amount/currency and a remedy record. Refund/dispute notifications are recorded for review, including after draw preparation; they do not rewrite the frozen snapshot.

The local maintenance command `PYTHONPATH=. .venv/bin/python -m scripts.run_order_maintenance` expires holds, closes due campaigns, and creates deduplicated `deadline_reminder` notification records for unused purchased coupons within seven days of the deadline. Its database `local_sink` is the current delivery sink. Admin-only `/admin/remedies` exposes pending cases; there is no automatic refund or forfeiture action.

The existing purchase, checkout, processing, My Coupons, and My Payments pages now use API data. The discount examples, PayPal placeholder, fixed receipt data, and timer-based payment success were removed. The checkout screen shows only configured providers. The processing page polls the authenticated order and shows pending, confirmed, cancelled/failed, expired-hold, and remedy states. Existing layout, components, colors, typography, and spacing were retained.

## Provider contracts and configuration

The Stripe adapter creates a test Checkout Session with server-side USD line item, quantity, order reference, and idempotency key. It verifies the raw-body `Stripe-Signature` within five minutes and, before issuance, fetches the current test Checkout Session to confirm paid status, reference, amount, currency, order association, and payment intent. This follows [Stripe Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create), [webhook signature guidance](https://docs.stripe.com/events/manage-webhook-endpoints#signature-errors), and [Stripe's snapshot-event guidance](https://docs.stripe.com/events/set-up-events#snapshot-events-exception-cases). The Paystack adapter initializes a test transaction in minor units with a server-generated reference, verifies the raw-body HMAC-SHA512 signature, and calls Verify Transaction before issuance, following [Paystack webhooks](https://paystack.com/docs/payments/webhooks/), [initialization](https://paystack.com/docs/api/transaction/), and [payment verification](https://paystack.com/docs/payments/verify-payments/).

Set `APP_ENV=test` or `development` and explicitly configure **one** of:

- `ENABLE_FAKE_PAYMENTS=true` plus `FAKE_PAYMENT_SECRET` for deterministic local fixtures.
- `ENABLE_STRIPE_SANDBOX=true` plus `STRIPE_SECRET_KEY=sk_test_...` and `STRIPE_WEBHOOK_SECRET=whsec_...`.
- `ENABLE_PAYSTACK_SANDBOX=true` plus `PAYSTACK_SECRET_KEY=sk_test_...`.

The test-only fake confirmation endpoint requires an authenticated order owner and is disabled in production. Production settings reject enabling any payment adapter. Stripe and Paystack remain disabled in the checked-in configuration. No real provider credentials were available, so **no external sandbox charge or webhook delivery was exercised**; their adapter request/signature/verification contracts were checked with deterministic mocked HTTP responses. Provider account support for USD settlement, publicly reachable TLS webhook endpoints, and credential provisioning remain setup gaps.

## Verification results

- A fresh disposable PostgreSQL 16 Compose container was created after `down -v`. Alembic upgraded from empty to `0006_orders_reservations`; `alembic check` returned `No new upgrade operations detected`.
- The full PostgreSQL backend suite passed **41 tests**. It covers concurrent final-slot holds; expired-hold payment versus new checkout; duplicate and out-of-order callbacks; amount/currency/signature rejection; one-time issuance and recovery after a forced rollback; no code recycling; ownership/admin boundaries; registration without double counting; deadline closure and unused-code expiry, including rejected purchase and failed draw preparation; frozen draw eligibility after a stale callback and refund event; and reminder deduplication. Existing deprecation warnings remain without failures.
- `npm run build` passed, followed by `npx tsc --noEmit`. `npm audit --audit-level=low --json` reported **0 vulnerabilities** at all severity levels. No `npm audit fix --force` was used.
- Chromium completed the test-mode journey through registration/login, fixture checkout and verified payment, My Coupons and My Payments, redemption and capacity closure, draw preparation permission checks, and the pending, cancelled, failed, and reconciliation screens. Screenshots are in `/tmp/tour-raffle-m5-browser`.
- The prior `scripts/verify-integration-browser.cjs` journey also passed after the fixture issuer change: fixture redemption, capacity closure, draw preparation, approval, execution, publication, and member/admin boundaries remained working.
- An isolated `git archive 70dc92a` frontend on port 3001 was compared with the current frontend at **1440px and 390px** for purchase, checkout, processing, coupons, and payments. Heading font/size/weight/color, shell geometry, and document width matched; no horizontal overflow was observed. Screenshot pairs and metrics are in `/tmp/tour-raffle-m5-design`. Content height changed where discount examples, unavailable providers, timer success, and fabricated payment rows became truthful states. The nine PNG references named in `Tour_Raffle.md` were unavailable, so the prior committed frontend was the visual baseline.

### Reproduce locally

From the repository root, with dependencies already installed:

```bash
docker compose -f backend/compose.verify.yml down -v
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
cd ..
npm run build
npx tsc --noEmit
npm audit --audit-level=low --json
```

For the browser journey, run FastAPI with `APP_ENV=test`, `ENABLE_FAKE_PAYMENTS=true`, `FAKE_PAYMENT_SECRET=local-browser-only`, `ENABLE_LOCAL_DRAW=true`, `FRONTEND_URL=http://127.0.0.1:3000`, and the disposable `DATABASE_URL` above on port 8001. Run Next.js with `API_INTERNAL_URL=http://127.0.0.1:8001` on port 3000. Then run `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome DATABASE_URL=<disposable URL> node scripts/verify-milestone5-browser.cjs`. This browser script resets only the guarded disposable database. For visual comparison, serve `git archive 70dc92a` as a separate Next.js app on port 3001 with the same API rewrite, then run `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome DATABASE_URL=<disposable URL> node scripts/compare-m5-design.cjs` after the browser journey. The comparison uses the browser fixture account and does not change application data.

## Remaining decisions and limits

- Oscar's remedy for paid, unused coupons after closure and the handling of full or partial refunds, disputes, replacement codes, and payment after an expired hold still require explicit product decisions. The system records these cases for review; it does not invent a refund or forfeiture policy.
- USD-only checkout means no non-USD exchange rate is currently applied. If an approved provider later offers cross-currency payment, an authoritative conversion source and original FX snapshot policy are required before enabling it.
- A production scheduler, messaging provider, external sandbox credentials, webhook endpoint registration, and provider operations/reconciliation process are not configured. Local reminder records are stored but no email/SMS is sent.
- Email verification and messaging are still unconfigured; the local test checkout uses authenticated but unverified fixture accounts.
- Production payments and draws remain disabled. Database operators still have seed access, as recorded in the integration baseline; this milestone does not change draw-integrity controls.
