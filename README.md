# Miles Roxas Site

This repository contains the website and CMS for `milesroxas.com`.
It is a single Next.js App Router codebase with Payload CMS, Postgres, and a custom animated
frontend.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Payload CMS 3.58 (`@payloadcms/next`)
- Postgres via `@payloadcms/db-vercel-postgres`
- Vercel Blob storage with Cloudflare media sync hooks
- Tailwind CSS 4, Radix UI, shadcn/ui
- GSAP, Three.js, React Three Fiber
- Biome for linting and formatting

## Requirements

- Node.js `>=20.9.0`
- pnpm
- Docker Desktop (local Postgres)
- Vercel CLI, logged in (pulling production content)

## Local Development

1. Install dependencies: `pnpm install` (also wires `.githooks`)
2. Copy env template: `cp .env.example .env` and fill the secrets
3. Start Postgres: `pnpm db:up`
4. `pnpm dev:tui` → **Pull production content → local Docker DB**
5. `pnpm dev`, then open `http://localhost:3000`

Skip step 4 for an empty database: `pnpm dev` pushes the schema and the admin prompts for a first user. Database workflow: [MIGRATIONS.md](MIGRATIONS.md). Parallel workspaces: [docs/conductor.md](docs/conductor.md).

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server (Turbopack, local DB, schema push) |
| `pnpm dev:tui` | Dev TUI: dev server against local or production DB, pull production content, db/payload/quality menus |
| `pnpm db:up` / `db:down` / `db:reset` | Local Docker Postgres |
| `pnpm dev:prod` | Build and run production mode locally |
| `pnpm build` | Build for production (`next build --webpack`) |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint with auto-fix (Biome) |
| `pnpm lint:check` | Lint without fixes |
| `pnpm format` | Format with auto-fix (Biome) |
| `pnpm format:check` | Check formatting without fixes |
| `pnpm check` | Lint + format with auto-fix |
| `pnpm lint:ci` | Lint + format check mode (no fixes) |
| `pnpm ci` | Vercel build: preview-DB guard, `payload migrate`, build. Never run locally |
| `pnpm migrate:create` | Create a migration |
| `pnpm migrate:status` | Production migration ledger |
| `pnpm check:migrations` | Migration enum safety |
| `pnpm check:migrations:drift` | Newest migration snapshot against the config |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm generate:db-schema` | Regenerate `src/payload-generated-schema.ts` |
| `pnpm payload` | Run Payload CLI |

## Environment Variables

Core:

- `POSTGRES_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `PREVIEW_SECRET`
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`

Cloudflare media:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_IMAGES_ACCOUNT_HASH`
- `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`
- `CLOUDFLARE_STREAM_WEBHOOK_SECRET`

Analytics:

- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Content Model

Collections:

- `pages`
- `posts`
- `works`
- `media`
- `categories`
- `users`

Globals:

- `Header`
- `Footer`

Layout blocks used by `pages` and `works`:

- `archive`
- `callout`
- `cta`
- `content`
- `formBlock`
- `mediaBlock`
- `slider`
- `tabs`

Rich text blocks used by `posts`:

- `banner`
- `code`
- `mediaBlock`

Hero types:

- `none`
- `home`
- `highImpact`
- `mediumImpact`
- `lowImpact`

## Project Structure

Main directories inside `src/`:

- `app` - Next.js routes (`(frontend)`, `(payload)`, `(sitemaps)`)
- `collections` - Payload collections
- `blocks` - Layout block configs/components
- `heros` - Hero configs/components
- `SiteFrame` - Frame and transition UI
- `templates` - Page templates and shared animation stores
- `stores` - Zustand stores
- `plugins` - Payload plugin setup
- `migrations` - Database migrations

## Migrations and Deployment

- Push in development, migrations in CI: the Vercel build runs `payload migrate`.
- See `MIGRATIONS.md` for migration workflow.
- See `WORKFLOW.md` for branch and release flow.
