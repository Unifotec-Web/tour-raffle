# Local demo handoff — checkpoint `54b1897`

21 October 2026. Branch `codex/demo-handoff-m9`. This is a bounded local/test demonstration of the existing product through winner claim review. No live payment, real email, external fulfillment, or production draw execution is enabled. Earnest's existing layouts, typography, colors, imagery, and component styling remain in place. The nine original reference PNGs are unavailable.

## Setup

The script below uses only the guarded disposable PostgreSQL database on `127.0.0.1:55432`. **`DEMO_RESET_DB=1` clears that disposable database each time the browser journey runs.** Do not point it at a database containing work you want to retain. The fixture promotion and reset scripts reject other databases and production mode.

From the repository root, use Docker Compose where available:

```bash
docker compose -f backend/compose.verify.yml up -d
```

On this WSL host, Docker was unavailable, so the verified run used Podman:

```bash
podman run -d --rm --name tour-raffle-demo-pg \
  -e POSTGRES_USER=tour_raffle_verify -e POSTGRES_PASSWORD=local-verify-only \
  -e POSTGRES_DB=tour_raffle_verify -p 127.0.0.1:55432:5432 \
  docker.io/library/postgres:16-alpine
```

Install dependencies if needed and generate local credentials outside the repository. The generator creates a mode `0600` shell file with a random demo account password, email-token secret, and fake-payment signing secret; it does not print them or overwrite an existing file.

```bash
npm ci
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
python3 scripts/create-demo-env.py
source /tmp/tour-raffle-demo.env
cd backend
.venv/bin/alembic upgrade head
.venv/bin/alembic check
cd ..
```

If `/tmp/tour-raffle-demo.env` already exists, reuse it or remove it deliberately before creating new credentials. Keep the file private and outside version control. The fixed database password in these commands is solely for the disposable localhost database.

Open the demo at `http://localhost:3000`. In local/test mode, FastAPI accepts only the exact `http://localhost:3000` and `http://127.0.0.1:3000` browser origins when the configured frontend URL is one of those addresses. The configured `FRONTEND_URL` is used for email and payment return links; production accepts only its configured HTTPS origin. If reusing an older demo env file with `FRONTEND_URL=http://127.0.0.1:3000`, change that one setting to `http://localhost:3000` and restart FastAPI; retain the existing secrets and database.

## Start, run, and stop

Start FastAPI in one terminal:

```bash
cd backend
source /tmp/tour-raffle-demo.env
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the built frontend in another terminal:

```bash
npm run build
npm run start -- -p 3000
```

Run the complete browser setup and walkthrough from a third terminal:

```bash
source /tmp/tour-raffle-demo.env
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/your/chrome node scripts/verify-demo-handoff.cjs
```

The browser script creates a **two-slot, one-winner** featured campaign, three fresh accounts, and the full test journey. It promotes only its admin account via the guarded local fixture. Its output lists the generated admin and member email addresses and campaign ID. The account password is in `/tmp/tour-raffle-demo.env`; use it locally without pasting it into logs. The script invokes the existing outbox worker and reads verification links from `LOCAL_EMAIL_SINK_DIR` (`/tmp/tour-raffle-demo-mail` by default). Those `.eml` files contain usable one-time links and need private local handling. To deliver pending local mail manually, run `cd backend && source /tmp/tour-raffle-demo.env && .venv/bin/python -m scripts.run_email_outbox`.

The same setup can be walked manually: sign up three accounts, run the local outbox worker and open their verification links, promote one account with `APP_ENV=test .venv/bin/python -m scripts.seed_admin_browser --email <admin-email>` from `backend/`, then use `/admin/campaigns/create` to create a capacity-2, winner-count-1 campaign with current dates and open registration. Use the account password you chose locally. The automated script is the reproducible fixture path; it generates random identifiers and does not commit credentials.

Stop the API and frontend with `Ctrl+C`. Stop the disposable database with `docker compose -f backend/compose.verify.yml down -v` or `podman stop tour-raffle-demo-pg`, matching how it was started. Remove `/tmp/tour-raffle-demo.env`, `/tmp/tour-raffle-demo-mail`, and `/tmp/tour-raffle-demo-handoff` when finished; the email sink contains live local verification links.

## Walkthrough

1. As a guest, open `/current-raffle`, view the featured campaign detail, and follow **Get Coupons** to the sign-in page. Sign up as a member, use the locally delivered verification link, then sign in.
2. Select one coupon on `/dashboard/coupons/purchase`. Checkout clearly says **Local Test Payment**. **Pay Now** triggers a test-only server confirmation; no money moves. The server issues a $10 USD coupon. Open **My Coupons**, register the coupon, and confirm it appears in **My Entries**. Repeat as the second member; the two confirmed entries close the small campaign.
3. As the admin, use `/admin/draws` to prepare the snapshot, approve it, execute the local draw, and publish results. Before publication, member win lists remain empty. The member and admin roles are enforced by FastAPI.
4. The published winner uses **My Wins → Start claim → Start Claim Process → Submit Claim**. The admin uses `/admin/claims` to record `under_review` and `approved`. The member sees the status and history. Approval is **not** delivery; this demo does not mark fulfillment complete.
5. At 390px, use the visible menu to reach the core member and admin routes. At desktop widths, the existing sidebars show the same working routes.

## What works and what is simulated

The tested flow uses real FastAPI/PostgreSQL state for campaigns, sessions and roles, coupon capacity and redemption, draw snapshot/selection/publication, and claim review. The demo uses a **fake payment provider** restricted to local/test mode and a **local file email sink**. No Stripe/Paystack sandbox transaction or real inbox delivery was verified. Draw execution requires `APP_ENV=test` and `ENABLE_LOCAL_DRAW=true`; production draws remain disabled. Live payments remain disabled.

Secondary links to unimplemented admin indexes, sample transaction/notification/support/profile screens, search, social fragments, and newsletter submission are hidden from primary navigation for this handoff. Their underlying pages and unfinished behavior were not replaced. The admin sample-metrics dashboard remains accessible by direct URL but is no longer the admin login destination. Public imagery and some editorial content are still sample assets. Footer support/contact routes exist but their forms are not a ticket service. No real email transport, deployed worker, external prize delivery, refund/replacement policy, or independent draw-seed custody is provided. Database operators can access approved draw seeds. Real Stripe/Paystack sandbox verification needs credentials, supported accounts, and a reachable webhook; it was outside this handoff.

## Verification on 21 October 2026

- Fresh disposable PostgreSQL 16 migration through `0010_email_lifecycle`; `alembic check`: **No new upgrade operations detected**.
- Full backend suite: **58 passed** (561 existing deprecation warnings).
- `npm run build` and `npx tsc --noEmit`: passed. An initial build surfaced a stale badge reference after hiding unfinished navigation; it was removed and the final build passed.
- Final Playwright run: passed guest discovery, local email verification, admin login, two fake $10 purchases, coupon registration and closure, draw preparation/approval/execution/publication, winner claim/review, owner/role boundaries, and mobile menu navigation. Both 1440px and 390px checked without horizontal overflow. Screenshots are in `/tmp/tour-raffle-demo-handoff`.
- The local environment generator created a mode `0600` file. No account passwords or signing secrets were added to the repository.
