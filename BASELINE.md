# Tour Raffle integration baseline

Verified locally on 17 October 2026 on `codex/local-integration`, branched from `1ca17b9`. This document consolidates the current state. The milestone records remain in [MILESTONE_2.md](MILESTONE_2.md), [MILESTONE_3.md](MILESTONE_3.md), [MILESTONE_4.md](MILESTONE_4.md), and [DRAW_INTEGRITY_REVIEW.md](DRAW_INTEGRITY_REVIEW.md). No code has been pushed or deployed.

## Included history

`git merge-base --is-ancestor` confirmed every milestone commit is in the integration branch:

| Commit | Included work |
| --- | --- |
| `f17f392` | FastAPI/PostgreSQL authentication baseline and dependency fixes |
| `ad24102` | Campaigns, fixture coupons, transactional redemption, member coupon/entry screens |
| `bcb3efb` | Admin campaign create/edit/status management and audit records |
| `9f784e0` | Recoverable local/test draw selection and separate publication |
| `1ca17b9` | Approval-time seed generation and draw-integrity review |

## Working features

| Area | Current behavior |
| --- | --- |
| Authentication and permissions | Sign-up, sign-in, logout, persisted/expiring/revocable cookie sessions, server-side member/admin checks, same-origin mutation checks, and auth middleware for private pages. Public registration cannot assign an admin role; fixture provisioning promotes local test admins. |
| Campaign administration | Admin-only campaign list, create, detail/edit, allowed status transitions, validation of capacity/winners/dates, entry-aware rule locks, and creation/edit/status audit records. Campaign progress comes from the API. |
| Coupons and entries | Local/test fixture coupon generation only. Authenticated validation/redemption checks ownership, expiry, campaign status/capacity, and confirmed entry uniqueness. One PostgreSQL transaction redeems the coupon, creates the entry, updates capacity, and closes registration at capacity. Same-owner retry returns the existing entry. My Coupons and My Entries read actual user records. |
| Draws | Admin-only prepare, approve, execute, and publish workflow in opt-in local/test mode. A canonical immutable eligibility/rules snapshot, hash, approval-time 256-bit seed, distinct-participant HMAC selection, one run per campaign, durable results, recovery, and audit events are implemented. Member results are private until publication; public winners/audit summaries use published API data without identities. Production mutations are disabled even if the feature flag is set. |
| Database | Alembic migrations `0001` through `0005`; PostgreSQL constraints and triggers protect capacity, coupon uniqueness, draw snapshots, seed commitments, result uniqueness, and draw transitions. |

## Remaining mock behavior and gaps

- The public marketing/home, destination imagery, FAQ, and parts of the raffle detail pages still contain editorial or static content. The member and admin overview dashboards still show invented counters/activity and should not be treated as live reporting.
- Purchase, checkout, payment-processing, payment history, transactions, and receipts screens are not connected to payment/order services. The payment-processing screen uses a timer and purchase screens can show local success without a real transaction. Admin coupon generation is a local alert, not a secure public issuance path. No live money or public coupon issuance is enabled.
- Password recovery/reset, email verification, profile/password changes, support/contact, notifications, public check-entry, claim/verification, and much of broader admin management remain static, local-state, or form-only. The admin login screen is separate from the working member sign-in form and is not the authoritative admin auth flow.
- Existing admin sidebar links `/admin/coupons`, `/admin/users`, `/admin/payments`, `/admin/entries`, `/admin/exports`, `/admin/audit`, and `/admin/settings` have no matching page routes. Existing detail pages for coupon inventory/generation and a user exist, but do not supply those index modules.
- Proposed routes such as `/destinations`, `/destinations/[slug]`, `/prizes`, `/verify-eligibility`, `/dashboard/eligibility`, `/dashboard/wins`, `/admin/winners`, and `/admin/draws/[id]` are absent. Several proposed aliases (`/login`, `/register`, `/faq`, etc.) are also absent; current routes are `/sign-in`, `/sign-up`, and `/faqs`.
- There is no email delivery, eligibility policy service, payment integration/webhooks/refunds, order reconciliation, production draw authorization/review, winner claim handling, notification worker, external randomness audit, or production-scale draw verification. The health endpoint is an app liveness response, not a database readiness check.

## External dependencies and unresolved decisions

The runnable stack requires PostgreSQL 16, Python dependencies in `backend/requirements.txt`, and Node dependencies in `package-lock.json`. Docker Compose provides disposable local PostgreSQL verification; Playwright Chromium is used only for browser checks. Existing pages request images from Unsplash, so those images depend on network availability. No payment provider, email provider, Redis/worker, object storage, or deployment service is configured.

Technical/product decisions still needed before later milestones: payment provider and webhook contract; issuance after confirmed payment; treatment of paid-but-unredeemed coupons when campaigns close; refund/disqualification/reconciliation policy; eligibility and official rules approval inputs; review and privacy consent before public winner identity release; a production seed-custody and independent audit model; and how legacy prepared draws with preapproval seeds should be resolved. **Database operators can read the plaintext draw seed after approval and preview outcomes before execution.** Application/API controls prevent a seed from being generated before approval for new runs, but there is no external tamper anchor or separation of duties. This review is internal engineering work, not independent audit certification.

## Integration verification

A fresh disposable PostgreSQL 16 Compose database was migrated from empty to `0005_draw_seed_approval`. `alembic check` returned **“No new upgrade operations detected.”** The complete PostgreSQL backend suite passed **26 tests**. `npm run build` and standalone `npx tsc --noEmit` passed. `npm audit --audit-level=low --json` reported **0 vulnerabilities** at all severities. Existing Pydantic, passlib, SQLAlchemy, and httpx deprecation warnings remain; no test failed.

One Chromium journey used the actual sign-up/sign-in forms, local fixture coupon issuance, the existing member coupon/entry screens, and the admin draw screen. It verified member admin-API rejection, another member's coupon being hidden, redemption and automatic closure at the two-entry capacity, one approved two-winner draw, stable execution retry, private results before publication, and member/public results after publication. Desktop 1440px and mobile 390px screenshots in `/tmp/tour-raffle-integration-browser` showed the existing layout, colors, typography, spacing, sidebar/header/footer treatment, and no document-width overflow. The nine reference PNGs named in `Tour_Raffle.md` are unavailable; the committed frontend remains the visual baseline. No frontend design code was changed in this integration pass.

### Reproduce

From the repository root:

```bash
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
cd ..
npm run build
npx tsc --noEmit
npm audit --audit-level=low
```

For the browser journey, use separate terminals for the local API and frontend:

```bash
cd backend
APP_ENV=test FRONTEND_URL=http://127.0.0.1:3000 ENABLE_LOCAL_DRAW=true DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001
```

```bash
API_INTERNAL_URL=http://127.0.0.1:8001 npm run dev -- --hostname 127.0.0.1 --port 3000
```

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify node scripts/verify-integration-browser.cjs
docker compose -f backend/compose.verify.yml down -v
```

The browser script resets only the guarded disposable verification database. Do not point it at any other database. Production draws remain disabled; nothing in this baseline authorizes live payments, publication of personal winner details, push, or deployment.
