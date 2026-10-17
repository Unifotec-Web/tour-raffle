# Tour Raffle API

This milestone provides PostgreSQL migrations, registration, login, logout, session checks, and server-side role checks. It does not issue entries, charge cards, or perform draws.

## Local run

Start PostgreSQL and create the `tour_raffle` database. From `backend/`:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

Run the Next.js app from the repository root with `npm ci && npm run dev`. The default Next.js API rewrite and middleware expect FastAPI at `http://localhost:8000`. Set `API_INTERNAL_URL` for a different internal API address, and set `FRONTEND_URL` in `backend/.env` to the exact browser origin. Production requires an HTTPS frontend URL and `SESSION_COOKIE_SECURE=true`. Keep the `/api/v1` rewrite same origin so the session cookie reaches Next.js middleware. Run migrations as a separate deployment step before starting the API.

## Checks

From `backend/`, run `.venv/bin/python -m pytest -q` for quick isolated SQLite checks. For PostgreSQL, start `docker compose -f backend/compose.verify.yml up -d --wait` from the repository root, then apply `alembic upgrade head` and run the tests with `TEST_DATABASE_URL` set to the disposable database URL. See `BASELINE.md` for exact commands and browser checks. The PostgreSQL migration and auth suite passed on a fresh disposable database; production deployment still needs its own environment check.

The cookie holds an opaque random token. Only its SHA-256 digest is stored in PostgreSQL. It is HTTP-only, SameSite=Lax, and expires after eight hours by default. The API checks request Origin for cookie-changing requests and caps failed authentication attempts per email or IP. Passwords use bcrypt. Public registration can only create the `user` role. Admin access requires the server-side `/api/v1/admin/me` check. User accounts currently remain unverified because email delivery and verification are later work; no commerce API is enabled.
