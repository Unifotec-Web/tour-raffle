# Tour Raffle consolidated baseline

Audited from commit `6a987c3` on 19 October 2026. The source-derived completion matrix, routes, evidence and priorities are in [COMPLETION_AUDIT.md](COMPLETION_AUDIT.md). The previous integration baseline covered only milestones 1–4 and was stale. This documentation-only audit did not rerun tests or browser checks.

## Working local/test scope

FastAPI/PostgreSQL with Alembic migrations `0001`–`0008` provides cookie authentication and member/admin checks; campaign administration; transactional coupon redemption and capacity; $10 USD server-priced orders with expiring holds; fake-provider checkout and idempotent issuance; disabled-by-default Stripe/Paystack sandbox adapters; admin reconciliation and remedy review; local/test frozen draw preparation, approval, execution and separate privacy-safe publication; and owner-only winner claims with admin review and recorded fulfillment evidence. Connected member screens include purchase/checkout/processing, My Coupons, My Entries, My Payments/details, My Wins and claim status. Connected admin screens include campaigns, draws, payments/remedies and claims. Public featured progress and published draw summaries read APIs.

Oscar's confirmed rules are recorded in [MILESTONE_5.md](MILESTONE_5.md): no discounts; one $10 USD coupon per reserved slot; purchase alone is not draw eligibility; unused coupons expire at closure with separate remedy review; registration closes at entry limit or deadline; no automatic refund, forfeiture or code recycling. The state and exceptions are detailed in the completion audit.

## Verification boundary

[MILESTONE_7.md](MILESTONE_7.md) records the latest full local checks: disposable PostgreSQL 16 migrated from empty through `0008_winner_claims`, clean Alembic drift check, **50 passed** backend tests, successful Next build and standalone TypeScript check, `npm audit --json` with **0 vulnerabilities**, and 1440px/390px browser/design comparison for the claim journey. M5/M6 record fake-provider checkout/reconciliation browser checks plus **mocked HTTP** Stripe/Paystack adapter tests. **No actual Stripe or Paystack sandbox charge, webhook or query was verified** because credentials and reachable webhook setup were unavailable. This audit inspected source and navigation without repeating passed checks. The nine original reference PNGs are unavailable; prior committed frontend revisions served as visual baselines. No code was pushed or deployed.

## Remaining gaps and gates

Public campaign detail, dashboard overview, notifications, receipts/transactions, support, account settings, email verification/recovery and several admin modules still use sample data or inactive controls; eight literal navigation destinations lack page routes. See the audit matrix for exact routes/services and prioritized work. There is no general audit viewer/export, deployed scheduler, email/SMS delivery, deployment configuration, CI/CD, backup/restore or database readiness probe. `/health` reports app liveness only.

Live payments and production draws remain disabled by configuration. Real sandbox provider verification requires credentials, compatible test account and reachable webhooks. Paid-coupon remedy/refund/replacement, eligibility and official campaign rules, claim/fulfillment rules and operational approvals remain unresolved. **Database operators can read the plaintext approved draw seed and preview outcomes;** there is no independent custody or tamper anchor. This is an internal engineering audit, not independent certification.

## Reproduce the previously reported local checks

With dependencies installed and only a disposable verification database:

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
docker compose -f backend/compose.verify.yml down -v
```

For browser setup and guarded fixture scripts, follow [MILESTONE_5.md](MILESTONE_5.md), [MILESTONE_6.md](MILESTONE_6.md), and [MILESTONE_7.md](MILESTONE_7.md). Those scripts reset only the disposable verification database.
