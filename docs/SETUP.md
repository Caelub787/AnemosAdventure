# Setup & deployment

This project's code, CI workflows, and infrastructure config are all scaffolded and
committed. Nothing is deployed yet — you'll need to create a few free-tier accounts
and paste their keys in as secrets/environment variables. Nothing in this repo needs
your local machine to stay online once it's deployed.

## 1. Accounts to create

| Service | What it's for | Plan |
|---|---|---|
| [Supabase](https://supabase.com) | Postgres, Auth, Storage, Realtime | Free tier |
| [Vercel](https://vercel.com) | Hosts the Next.js app (`apps/web`) | Free tier |
| [Fly.io](https://fly.io) | Hosts the realtime-sync (Hocuspocus) server | Free/low-cost tier |

Create **two Supabase projects** (`arcanavtt-staging`, `arcanavtt-prod`) so `develop`
and `main` never touch the same database. Two Fly.io apps for the same reason
(`arcanavtt-realtime-staging`, `arcanavtt-realtime-prod`).

## 2. Local development

```bash
pnpm install
pnpm dlx supabase@latest login          # one-time
pnpm dlx supabase@latest init --workdir supabase   # only if supabase/ isn't already linked
pnpm dlx supabase@latest start          # requires Docker; runs Postgres/Auth/Storage locally
pnpm dlx supabase@latest db reset       # applies supabase/migrations + supabase/seed.sql

cp apps/web/.env.example apps/web/.env.local   # fill in the local Supabase keys `supabase start` prints
pnpm dev
```

`apps/web` runs at http://localhost:3000. The realtime-sync server can be run
separately with `pnpm --filter @arcanavtt/realtime-sync dev` once its own `.env` is
filled in (see below) — collaborative editing/maps won't sync without it running,
but every other page works fine without it.

## 3. Environment variables

### `apps/web` (Vercel: set once for Preview, once for Production)

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (server-only, never expose to the client) |
| `NEXT_PUBLIC_SITE_URL` | The deployed URL of this environment (e.g. `https://arcanavtt.com` or the Vercel preview URL) |
| `NEXT_PUBLIC_HOCUSPOCUS_URL` | `wss://` URL of the matching realtime-sync Fly app |
| `SUPABASE_JWT_SECRET` | Supabase project → Settings → API → JWT Settings |

### `apps/realtime-sync` (Fly.io secrets, per app)

```bash
fly secrets set --app arcanavtt-realtime-staging \
  DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
  SUPABASE_JWT_SECRET="<same value as above>"
```

Use the Supabase **connection pooler** URL if you hit connection limits under load;
the direct connection string works fine at MVP scale.

### GitHub Actions secrets (repo Settings → Secrets and variables → Actions)

| Secret | Purpose |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Lets CI run `supabase db push` (Supabase dashboard → Account → Access Tokens) |
| `SUPABASE_PROJECT_REF_STAGING` / `_PROD` | Project ref from the Supabase project URL |
| `SUPABASE_DB_PASSWORD_STAGING` / `_PROD` | Set when the Supabase project was created |
| `FLY_API_TOKEN` | `fly tokens create deploy` |
| `FLY_APP_NAME_STAGING` / `_PROD` | e.g. `arcanavtt-realtime-staging` |

Add a `staging` and a `production` GitHub **Environment** (repo Settings →
Environments) so the production migration workflow can require manual approval
before it touches the live database.

## 4. Connect Vercel to GitHub

In the Vercel dashboard: New Project → import this repo → set the root directory to
`apps/web`. Vercel's own GitHub integration handles preview deployments per PR and
production deployment on merge to `main` automatically — no custom Action needed for
that part.

## 5. Bootstrap the first admin

The admin area is deliberately impossible to grant yourself through the UI — insert
the first row directly in the Supabase SQL editor after you've signed up once:

```sql
insert into admin_users (user_id, granted_by)
values ('<your auth.users id>', '<your auth.users id>');
```

## 6. Branching workflow

- `main` — production. Protected; only merges from `develop` or hotfix branches.
- `develop` — staging/integration. Every feature branch merges here first.
- `feature/*` — one branch per change, PR into `develop`.

Pushing a change to `supabase/migrations/**` on `develop` or `main` triggers the
matching migration workflow automatically; pushing to `apps/realtime-sync/**`
triggers its own deploy workflow. Everything else in `apps/web` deploys via Vercel's
native GitHub integration.

## 7. Known placeholders to replace before a real launch

- `apps/web/public/icons/*.svg` are placeholder PWA icons — swap in real branded
  artwork (192px, 512px, and a maskable 512px variant).
- No custom domain is wired up yet — add one in the Vercel dashboard once you have
  one, then update `NEXT_PUBLIC_SITE_URL` and the Supabase Auth redirect allowlist
  (Authentication → URL Configuration) to match.
