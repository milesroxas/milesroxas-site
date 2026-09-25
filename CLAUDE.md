# CLAUDE.md

This file documents the working conventions for AI assistants in this repository.

## Stack Snapshot

- Next.js 16 App Router
- React 19 + TypeScript
- Payload CMS 3.58
- Postgres via `@payloadcms/db-vercel-postgres`
- Tailwind CSS 4 + Radix UI + shadcn/ui
- GSAP + Three.js + React Three Fiber
- Biome 2.3.10 for lint/format

## Development Commands

- `pnpm dev` - Start development server (Turbopack, local Docker DB, schema push)
- `pnpm dev:tui` - Interactive dev menu (dev against local/prod DB, pull production content, db/payload/quality)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint and auto-fix with Biome
- `pnpm lint:check` - Lint check only
- `pnpm format` - Format and auto-fix with Biome
- `pnpm format:check` - Format check only
- `pnpm check` - Lint + format with fixes
- `pnpm lint:ci` - Lint + format check mode (no fixes)
- `pnpm ci` - Vercel build command (preview-DB guard, `payload migrate`, build). Never run locally
- `pnpm generate:types` - Generate `src/payload-types.ts`
- `pnpm generate:db-schema` - Generate `src/payload-generated-schema.ts`
- `pnpm payload` - Run Payload CLI

### Storybook Commands

- `pnpm storybook` - Start Storybook dev server (port 6006)
- `pnpm build-storybook` - Build static Storybook
- `pnpm test:storybook` - Run all stories as Vitest browser tests (Playwright/Chromium)

Storybook conventions:

- Stories are colocated with components as `*.stories.tsx` (CSF3, `satisfies Meta`).
- Payload-shaped fixtures live in `src/stories/fixtures.ts` and must mirror `src/payload-types.ts`.
- Config lives in `.storybook/` (`@storybook/nextjs-vite` framework); theme switching drives the site's `data-theme` attribute.
- Components tied to the live app shell (page-transition GSAP flow, SiteFrame, server-only Payload access, R3F scenes) are intentionally not storied — see the Overview page in Storybook.

### Database Commands

- `pnpm db:up` / `pnpm db:down` / `pnpm db:reset` - Local Docker Postgres (`127.0.0.1:54330/payload`)
- `pnpm migrate:create <name>` - Create migration (ask first, see below)
- `pnpm check:migrations` - Enum safety check on migrations
- `pnpm check:migrations:drift` - Newest migration snapshot against the current config
- `pnpm migrate:status` - Production ledger only (reads `.env.production.pulled`)

**Push in dev, migrations in CI.** Same workflow as sas-site. Human docs: `MIGRATIONS.md`. Conductor: `docs/conductor.md`.

## Codebase Conventions

- Use `pnpm` for all package and script operations.
- Prefer project aliases (`@/*` and `@payload-config`) over deep relative imports.
- Follow Biome formatting rules (single quotes, trailing commas, 2-space indentation, 100 columns).
- Use `node:` protocol for Node.js built-in imports.
- Keep server components by default; add `'use client'` only when required by hooks/browser APIs.
- In App Router files, default exports are expected; otherwise follow existing local patterns.
- Keep edits minimal and colocated with related feature files.

## Payload Rules

- Never manually edit generated files:
  - `src/payload-types.ts`
  - `src/payload-generated-schema.ts`
- For schema changes:
  1. Update collection/global/field definitions.
  2. Local schema syncs via Drizzle push on `pnpm dev` (push runs only against a local `POSTGRES_URL`).
  3. Regenerate types/import maps (`pnpm generate:types`, `pnpm generate:importmap`) without asking.
  4. Ask before `pnpm migrate:create`. On approval, review the SQL and commit the `.ts` + `.json` together. The Vercel build (`pnpm ci`) applies it.
  5. Run `pnpm check:migrations` and `pnpm check:migrations:drift`. The migration must cover every schema change in the branch; if a field was added after it was generated, regenerate it (ask first).
- Hard prohibitions:
  - Do not run `pnpm migrate:create` unless the user asks in this conversation. Say a migration is needed and wait.
  - Never run `payload migrate` locally or against Neon by hand. Mixing push and migrations corrupts the ledger.
  - Never create `.env.local` / `.env.production`; Next.js loads them over `.env` and would point dev at Neon.
- Whenever your work would make `migrate:create` ask create-vs-rename questions, end with an answer sheet: the suggested command, each expected prompt with the option to pick (renamed entity → **rename** from the old name; brand-new → **create**), and a one-line reason. `scripts/migrate-create.exp` takes the same answers (see `MIGRATIONS.md`).

## Architecture Pointers

- Public routes live in `src/app/(frontend)`.
- Payload admin/API routes live in `src/app/(payload)`.
- Collections are in `src/collections` (`pages`, `posts`, `works`, `media`, `categories`, `users`).
- Layout blocks are in `src/blocks`.
- Hero configs/components are in `src/heros`.
- Frame/transition system is in `src/SiteFrame` and `src/stores/siteframeStore.ts`.
