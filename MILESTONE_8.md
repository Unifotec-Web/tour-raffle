# Milestone 8 — public campaign data and truthful verification

Branch `codex/milestone-8-public-campaign-data` from `a252332`. Local/test only; no push, deployment, live payments or production draw execution.

## Implemented

- Public `GET /api/v1/campaigns/public` and `GET /api/v1/campaigns/public/{id}` return only stored, publishable campaign facts for `scheduled`, `open`, `closed`, or `completed` records. Draft/cancelled/unknown IDs have no public detail. The response excludes owners, coupon/entry codes, order data, seeds and participant information. `Current Raffle`, the home campaign modules, and `/raffles/[id]` now use these APIs, including loading, unavailable and error states. Existing imagery remains decorative because no approved campaign-image field exists. Campaign-specific rules, prize package and draw dates are shown as unavailable when absent from the model; no invented prize terms remain on the detail page.
- `/api/v1/users/me/overview` counts only the authenticated member's coupons and confirmed entries, groups recorded paid amounts by **paid currency**, and lists that member's recent payment/entry events. The dashboard uses this data and shows open campaigns from the public API. A paid order under reconciliation remains a recorded payment, never a fabricated issued coupon.
- `POST /api/v1/users/me/entries/check` accepts an owner coupon or entry code. `POST /api/v1/users/me/wins/check` accepts an owner entry code and returns a win only after the draw is published. Both require a session and same-origin POST; another user's code and an unknown code give the same `{found:false}` response. Responses omit the submitted code and private participant details. `/check-entry` and `/dashboard/draws/verify` use these results and provide truthful empty/error states.
- Migration `0009_lookup_buckets` stores per-user, per-scope 15-minute lookup counts in PostgreSQL. Atomic upsert limits each entry or win lookup scope to 20 attempts per window across workers, including misses; excess requests return 429. Old buckets need retention cleanup in later operations work.
- The homepage's fabricated public activity and testimonial were replaced with neutral messages inside the existing cards. Footer quick/support/legal links now point to existing routes; hard-coded `/raffles/maldives` links in the affected homepage/navigation flow now lead to live campaign navigation. The existing public page sections, imagery, fonts, palette, card styles and spacing were retained after visual comparison exposed and corrected an overly short first draft.

## Verification observed

- Disposable PostgreSQL 16: **54 passed** in the complete backend suite, including new tests for unpublished/unknown campaign visibility, safe public fields, owner-only lookup privacy, published-win boundary, per-currency dashboard totals, sequential and concurrent rate limiting. Existing dependency deprecation warnings remain. The old auth test's fixed migration-head assertion was updated to `0009_lookup_buckets`.
- The verification database was destroyed with `docker compose ... down -v`, recreated, migrated from empty through `0009_lookup_buckets`, and `alembic check` returned **“No new upgrade operations detected.”**
- `API_INTERNAL_URL=http://127.0.0.1:8001 npm run build` and a subsequent `npx tsc --noEmit` passed. A TypeScript invocation run concurrently with the build initially saw transient missing `.next/types` files while Next regenerated them; sequential execution passed.
- The existing fake-provider M5 browser journey passed (registration, local fixture payment, coupons, redemption, closure and remedy states). `scripts/verify-milestone8-browser.cjs` then passed public list/detail navigation, unknown ID, member dashboard counts and USD totals, owner code check, unknown code, unpublished win check and 1440px/390px no-overflow screenshots in `/tmp/tour-raffle-m8-browser`.
- An isolated `git archive a252332` frontend on port 3001 was compared with the final frontend using `scripts/compare-m8-design.cjs`. Heading font, size, weight/color, header geometry and document width matched on six affected routes at **1440px and 390px**; screenshot pairs and metrics are in `/tmp/tour-raffle-m8-design`. Manual inspection of mobile Current Raffle/detail captures confirmed the original sections and visual treatment remain. Content text/heights differ because sample prize claims and figures were removed. The nine reference PNGs remain unavailable; the prior commit is the visual baseline.

## Reproduce

With dependencies installed, from the repository root:

```bash
docker compose -f backend/compose.verify.yml down -v
docker compose -f backend/compose.verify.yml up -d --wait
cd backend
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic upgrade head
DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/alembic check
PYTHONPATH=. TEST_DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify DATABASE_URL=postgresql://tour_raffle_verify:local-verify-only@127.0.0.1:55432/tour_raffle_verify .venv/bin/pytest -q
cd ..
API_INTERNAL_URL=http://127.0.0.1:8001 npm run build
npx tsc --noEmit
```

For the browser journey, run FastAPI on `127.0.0.1:8001` with `APP_ENV=test`, `ENABLE_FAKE_PAYMENTS=true`, `FAKE_PAYMENT_SECRET=local-browser-only`, `ENABLE_LOCAL_DRAW=true`, `FRONTEND_URL=http://127.0.0.1:3000` and the disposable `DATABASE_URL`. Run the built frontend on port 3000 with `API_INTERNAL_URL=http://127.0.0.1:8001`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` and `DATABASE_URL`, run `node scripts/verify-milestone5-browser.cjs` to reset/seed guarded fixture data, then `node scripts/verify-milestone8-browser.cjs`. For comparison, build/serve `git archive a252332` on port 3001 and run `node scripts/compare-m8-design.cjs`. The full backend suite clears fixture users, so reseed before browser scripts. Tear down the disposable Compose volume afterward.

## Remaining gaps

- Public campaign imagery, eligibility/rules versions, complete prize package and draw date lack approved fields/data; existing images are visual decoration. Public `check-entry` is intentionally an owner-only lookup, not a public code oracle. Rate bucket retention and IP-level controls remain operational follow-up.
- Eight literal navigation destinations remain missing: `/account/notifications`, `/account/privacy`, `/admin/coupons`, `/admin/users`, `/admin/entries`, `/admin/exports`, `/admin/audit`, `/admin/settings`. No empty placeholder routes were created. Footer social/newsletter controls remain inactive; other unconnected account, notification, support, admin, report/receipt and eligibility screens are tracked in [COMPLETION_AUDIT.md](COMPLETION_AUDIT.md).
- Stripe/Paystack tests remain mocked-HTTP adapter checks, **not actual provider sandbox verification**. Credentials, suitable accounts and reachable webhooks remain external blockers. Remedy/refund/replacement and official rules decisions remain open. Production payments/draws remain disabled, and database operators can still access approved draw seeds.
