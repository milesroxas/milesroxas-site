# Workflow Guide

## Branch Strategy

`dev` is the integration branch for preview deployments.  
`main` is the production branch for live deployments.  
Vercel builds only these two branches (`vercel.json` → `git.deploymentEnabled`). Feature branches and Conductor workspaces merge into `dev`.

## Daily Development

```bash
git checkout dev
pnpm dev:tui     # menu: dev server (local / production DB), pull production content, db, payload, quality
pnpm dev         # or directly: local Docker DB from .env, schema push on
```

Parallel branches run in Conductor, each with its own port and database. See `docs/conductor.md`.

Code quality commands:

```bash
pnpm check       # Biome lint + format with fixes
pnpm lint:ci     # Biome lint + format check, no fixes
```

## Migration Workflow

See `MIGRATIONS.md` for full details. Push in development, migrations in CI.

When schema-related files change (collections, globals, fields):

```bash
pnpm dev                      # push syncs the local DB
pnpm migrate:create <name>    # commit the .ts + .json together
pnpm check:migrations
pnpm check:migrations:drift
```

The Vercel build (`pnpm run ci`) runs `payload migrate`: against the Neon preview branch on `dev`, against production on `main`. Never run `payload migrate` locally.

## Release Flow

1. Build and test changes on `dev`.
2. For schema changes, create the migration and commit it with the change.
3. Push `dev`. The preview build migrates the preview DB. Validate the preview deployment.
4. Merge `dev` into `main` and push. The production build migrates production.
5. `pnpm migrate:status` confirms the production ledger.

## Environment Files

| File | Purpose |
| --- | --- |
| `.env` | Local development values; `POSTGRES_URL` is the local Docker DB |
| `.env.production.pulled` | Production env pulled by the dev TUI. Only the TUI, `pnpm migrate:status` and Conductor read it |
| `.env.example` | Reference template |

Do not create `.env.local` or `.env.production`: Next.js loads them over `.env`, and a `vercel env pull` into either points local dev or a local build at Neon. Pull production env through `pnpm dev:tui` → Database → Pull Vercel production env.

## Key Environment Variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Postgres connection string (local Docker in `.env`, Neon on Vercel) |
| `PRODUCTION_DB_ENDPOINT` | Production Neon endpoint id (`ep-...`), Vercel only; `scripts/guard-preview-db.ts` refuses to migrate it from a preview build |
| `PAYLOAD_SECRET` | Payload auth/encryption secret |
| `NEXT_PUBLIC_SERVER_URL` | Canonical site URL |
| `PREVIEW_SECRET` | Draft preview token |
| `CRON_SECRET` | Jobs endpoint auth token |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |
| `RESEND_API_KEY` | Resend email provider key |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH` | Cloudflare Images account hash |
| `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` | Cloudflare Stream playback domain |
| `CLOUDFLARE_STREAM_WEBHOOK_SECRET` | Cloudflare Stream webhook secret |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog client key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host |
