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

- `pnpm dev` - Start development server (Turbopack)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint and auto-fix with Biome
- `pnpm lint:check` - Lint check only
- `pnpm format` - Format and auto-fix with Biome
- `pnpm format:check` - Format check only
- `pnpm check` - Lint + format with fixes
- `pnpm ci` - Lint + format check mode (no fixes)
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

- `pnpm migrate:create` - Create migration
- `pnpm migrate:status` - Migration status
- `pnpm migrate` - Run pending migrations

Migrations are manual and must run before deployment. See `MIGRATIONS.md`.

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
  2. Run `pnpm migrate:create`.
  3. Run `pnpm migrate` against the target database.
  4. Commit migration files in `src/migrations/`.

## Architecture Pointers

- Public routes live in `src/app/(frontend)`.
- Payload admin/API routes live in `src/app/(payload)`.
- Collections are in `src/collections` (`pages`, `posts`, `works`, `media`, `categories`, `users`).
- Layout blocks are in `src/blocks`.
- Hero configs/components are in `src/heros`.
- Frame/transition system is in `src/SiteFrame` and `src/stores/siteframeStore.ts`.
