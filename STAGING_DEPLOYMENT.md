# Tour Raffle staging deployment

Prepared for `https://raffle-staging.unifotecweb.com` and `Unifotec-Web/tour-raffle`. Public pages are open to visitors; member and admin functions require application login. Use synthetic demo accounts and data only. Do not enable live payments, production draws, or real messaging.

## Stack and safety boundary

`compose.staging.yml` builds the Next.js standalone web image and FastAPI image. PostgreSQL 16 uses the `postgres_data` named volume and has no host port. The one-shot `migrate` service runs `alembic upgrade head` after database health and before API startup. Web waits for API health. The `order_maintenance` worker runs the existing deadline/reminder task every five minutes. Email delivery has no implemented provider; `EMAIL_DELIVERY_MODE=disabled` and no email worker is started. Health checks and `unless-stopped` policies cover long-running services.

Only `gateway:8080` receives a Dokploy domain. Caddy serves public pages without HTTP Basic authentication and adds `X-Robots-Tag: noindex, nofollow, noarchive`; Dokploy must terminate HTTPS. Caddy returns 404 for `/api/v1/test/*` and forwards other paths to Next.js, which rewrites `/api/v1/*` to `http://api:8000/api/v1/*` on the private Compose network. The browser sees one HTTPS origin, sends secure session cookies there, and its `Origin` header remains `https://raffle-staging.unifotecweb.com` for FastAPI's exact origin check. Application sessions, server-side member/admin permissions, Origin checks, and login rate limits remain in force. Do not add separate domains or public ports for `web`, `api`, or `db`.

`APP_ENV=staging` has production-grade HTTPS/cookie checks and rejects all fake or sandbox payments and local draws. It does not masquerade as `test`. No coupon purchase or draw execution is possible in this configuration; that is an intentional demo limit until a separately reviewed staging-only adapter and draw policy exist.

## Dokploy setup

1. Select the existing project and GitHub connection, create a **Docker Compose** service from `Unifotec-Web/tour-raffle`, choose the reviewed commit, and set Compose path to `compose.staging.yml`. Keep automatic deployments off until the team approves a release. Dokploy [supports GitHub Compose sources and environment settings](https://docs.dokploy.com/docs/core/docker-compose).
2. In the Compose service's Environment tab, set all values below. Do not commit an `.env` file. Generate independent random passwords and tokens. URL-encode special characters in the password portion of `DATABASE_URL`.
3. Add one domain in the Compose service's Domains tab: host `raffle-staging.unifotecweb.com`, service `gateway`, container port `8080`, path `/`, HTTPS on, Let's Encrypt certificate. Point DNS to the Dokploy server first. Dokploy's [Compose domain setup](https://docs.dokploy.com/docs/core/docker-compose/domains) routes to the specified container port without a host port mapping. Require HTTPS redirection at the edge.
4. Deploy once, then check `db`, `migrate`, `api`, `web`, `gateway`, and `order_maintenance` in logs. `migrate` should exit 0; the other services should become healthy or running. Check that unauthenticated HTTPS requests to `/`, `/sign-in`, and public campaign pages return 200 without a Basic-auth challenge; private pages redirect to application login and private APIs return 401. Confirm `/api/v1/test/orders/<UUID>/confirm`, `/api/v1/docs`, and `/api/v1/openapi.json` return 404, `X-Robots-Tag` is present, and no database, API, or web domain or host port exists. Remove the obsolete `STAGING_BASIC_AUTH_USER` and `STAGING_BASIC_AUTH_HASH` values from this Compose service's Dokploy environment settings after deploying; they are no longer read by the gateway.

| Dokploy variable | Value or source |
| --- | --- |
| `POSTGRES_PASSWORD` | Unique random database password, stored only in Dokploy |
| `DATABASE_URL` | `postgresql://tour_raffle:<URL-encoded password>@db:5432/tour_raffle_staging` |
| `EMAIL_TOKEN_SECRET` | Independent random secret of at least 32 characters |

The Compose file fixes `APP_ENV`, `FRONTEND_URL`, secure cookies, disabled payment/draw modes, and disabled messaging; changing those values requires a reviewed source change.

## Synthetic fixture

After migration, run the one-time script inside the `api` container from Dokploy's terminal. Supply `STAGING_ADMIN_EMAIL` and `STAGING_MEMBER_EMAIL` under the reserved `@example.com` domain, separate 12–72 byte passwords through temporary environment values, and `STAGING_FIXTURE_CONFIRM=create-synthetic-accounts`. The exact command is `python -m scripts.seed_staging_demo`. Do not put passwords in terminal history, deployment logs, or the Compose file. The script refuses any other environment/URL, refuses existing fixture emails, prints no credentials, and creates an audit record. The two synthetic accounts are marked verified because no mail is delivered. Sign in as the admin and create a small draft campaign through the existing admin UI; use only invented prize and participant data. Do not import production data or create entries through payments. Keep the fixture credentials in the team secret store, and remove the temporary fixture environment values after use.

Open `bash` in the `api` container's interactive terminal, then enter values without echoing passwords or adding them to shell history:

```bash
read -r -p 'Synthetic admin email: ' STAGING_ADMIN_EMAIL
read -r -p 'Synthetic member email: ' STAGING_MEMBER_EMAIL
read -r -s -p 'Admin password: ' STAGING_ADMIN_PASSWORD; printf '\n'
read -r -s -p 'Member password: ' STAGING_MEMBER_PASSWORD; printf '\n'
export STAGING_ADMIN_EMAIL STAGING_MEMBER_EMAIL STAGING_ADMIN_PASSWORD STAGING_MEMBER_PASSWORD
STAGING_FIXTURE_CONFIRM=create-synthetic-accounts python -m scripts.seed_staging_demo
unset STAGING_ADMIN_EMAIL STAGING_MEMBER_EMAIL STAGING_ADMIN_PASSWORD STAGING_MEMBER_PASSWORD
```

## Browser access and recovery

An unauthenticated HTTPS request to `/` should return `200` without `WWW-Authenticate`. `/api/v1/auth/session` returns `401` until the user signs into the app, then `200` with the server-side role. Admin accounts signing in through `/sign-in` land on `/admin/campaigns`; members land on `/dashboard`. A member request to `/admin/campaigns` is redirected to the member dashboard, and the admin API still rejects it with `403`.

If a normal browser profile still fails while a fresh profile works, inspect the first document request in DevTools Network with **Preserve log** enabled. Record its status, `Location`, and `WWW-Authenticate` response headers, plus the final URL; omit `Authorization`, `Cookie`, passwords, and token values. Repeated `30x` responses point to redirect handling. A `200` document followed by a failed `/api/v1/auth/session` or JavaScript request points to app session or cached assets. An unexpected `WWW-Authenticate: Basic` response means another gateway or proxy still requires Basic authentication.

For a one-time recovery **after recording the failing request**, close all tabs for the staging host, clear only `raffle-staging.unifotecweb.com` site data (cookies and cached files), fully quit and reopen the browser, then revisit the HTTPS URL and sign into the app. Do not clear unrelated sites or disable cookie or Origin protections. If the failure remains, compare the sanitized Network sequence with a fresh profile and inspect gateway logs before changing server settings.

## Backup, rollback, and operations

Enable a scheduled backup for the `postgres_data` named volume to the team's configured backup destination before meaningful staging data is created. Dokploy [backs up named volumes](https://docs.dokploy.com/docs/core/volume-backups); bind mounts are unsuitable for that feature. Periodically test restore into a separate isolated Compose project. Also take a PostgreSQL logical backup before any schema migration: from the server's Compose directory run `docker compose -f compose.staging.yml exec -T db pg_dump -Fc -U tour_raffle -d tour_raffle_staging > staging-before-migration.dump`, then transfer that file to restricted off-host storage and remove the server copy after verifying the transfer.

For an application rollback, stop automatic redeploys, take a fresh backup, redeploy the previously reviewed commit, and verify health and login. Alembic migrations are forward-only by default; do not blindly downgrade a database that may contain newer data. If a migration is incompatible, restore the matching pre-migration backup into an isolated database, verify it, then switch the staging stack during a maintenance window. Never use `docker compose down -v` on staging.

Outstanding limits: no real email provider or worker, no password-reset delivery, no live payments, no remote fake payments, and no staging draw execution. A future interactive purchase/draw demo needs explicit, narrow staging-only safety gates and review; setting `APP_ENV=test` on the remote host is prohibited.
