# Workflow Guide

## Branch Strategy

`dev` is the integration branch for preview deployments.  
`main` is the production branch for live deployments.

## Daily Development

```bash
git checkout dev
pnpm dev
```

Code quality commands:

```bash
pnpm check
pnpm ci
```

## Migration Workflow

See `MIGRATIONS.md` for full details.

When schema-related files change (collections, globals, fields):

```bash
pnpm migrate:create
pnpm migrate:status
pnpm migrate
```

To run against remote databases, override `POSTGRES_URL`:

```bash
POSTGRES_URL="<preview-url>" pnpm migrate
POSTGRES_URL="<production-url>" pnpm migrate
```

## Release Flow

1. Build and test changes on `dev`.
2. For schema changes, create and apply migrations locally.
3. Apply migrations to preview DB (`POSTGRES_URL="<preview-url>" pnpm migrate`).
4. Push `dev` and validate preview deployment.
5. Merge `dev` into `main`.
6. Apply migrations to production DB (`POSTGRES_URL="<production-url>" pnpm migrate`).
7. Push `main`.

## Environment Files

| File | Purpose |
| --- | --- |
| `.env.local` | Local development values |
| `.env.production` | Local production build/run values |
| `.env.example` | Reference template |

Pull env values from Vercel if needed:

```bash
vercel env pull .env.local --environment development
vercel env pull .env.production --environment production
```

## Key Environment Variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Postgres connection string |
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
