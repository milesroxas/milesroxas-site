# CLAUDE.md

This file documents the working conventions for AI assistants in this repository.

## Stack Snapshot

- Next.js 16 App Router
- React 19 + TypeScript
- Payload CMS 3.90
- Postgres via `@payloadcms/db-vercel-postgres`
- Tailwind CSS 4 + Radix UI + shadcn/ui
- GSAP + Three.js + React Three Fiber
- Biome 2.5.14 for lint/format

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
- Block stories never hand-write `argTypes` for CMS fields: `blockControls('<slug>')` from `src/stories/block-controls` derives controls and default args from the block's Payload config via a generated manifest (`pnpm generate:block-controls`, checked by `pnpm check:block-controls` and the pre-push hook). Regenerate it, without asking, after changing a block's fields.
- Config lives in `.storybook/` (`@storybook/nextjs-vite` framework); theme switching drives the site's `data-theme` attribute.
- App-shell providers a component needs are mounted by preview decorators, one file each in `.storybook/` (`cursor.tsx` mounts the custom cursor with a toolbar toggle; Docs pages skip it). Add a decorator there rather than per story.
- Components tied to the live app shell (page-transition GSAP flow, SiteChrome, server-only Payload access, R3F scenes) are intentionally not storied — see the Overview page in Storybook.

### Database Commands

- `pnpm db:up` / `pnpm db:down` / `pnpm db:reset` - Local Docker Postgres (`127.0.0.1:54330/payload`)
- `pnpm migrate:create <name>` - Create migration (ask first, see below)
- `pnpm check:migrations` - Enum safety check on migrations
- `pnpm check:migrations:drift` - Newest migration snapshot against the current config
- `pnpm migrate:status` - Production ledger only (reads `.env.production.pulled`)

**Push in dev, migrations in CI.** Same workflow as sas-site. Branches and Conductor workspaces start from `dev` and land on `dev`: by default rebase onto `origin/dev` and `git push origin HEAD:dev`; open a PR into `dev` only when Miles asks for one. `main` is production, only receives `dev`, and only Miles releases to it (`docs/conductor.md` → Branch flow). Human docs: `MIGRATIONS.md`. Conductor: `docs/conductor.md`.

## Codebase Conventions

- Use `pnpm` for all package and script operations. The repo pins pnpm 10.28.0 in
  `package.json#packageManager`; pnpm self-switches here, so plain `pnpm install` is
  correct and only pnpm 10 may write `pnpm-lock.yaml` (see the note in `pnpm-workspace.yaml`).
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
  3. Regenerate types/import maps (`pnpm generate:types`, `pnpm generate:importmap`) and, for a block field, the Storybook control manifest (`pnpm generate:block-controls`) without asking.
  4. Ask before `pnpm migrate:create`. On approval, review the SQL and commit the `.ts` + `.json` together. The Vercel build (`pnpm ci`) applies it.
  5. Run `pnpm check:migrations` and `pnpm check:migrations:drift`. The migration must cover every schema change in the branch; if a field was added after it was generated, regenerate it (ask first).
  6. Before a migration lands on `dev` (direct push or PR): `git fetch origin && git rebase origin/dev`. If `dev` gained a migration, delete the branch's (`.ts` + `.json`) and regenerate it (ask first). The pre-push hook and `.github/workflows/migrations.yml` enforce this (`docs/conductor.md`).
- Hard prohibitions:
  - Do not run `pnpm migrate:create` unless the user asks in this conversation. Say a migration is needed and wait.
  - Never run `payload migrate` locally or against Neon by hand. Mixing push and migrations corrupts the ledger.
  - Never create `.env.local` / `.env.production`; Next.js loads them over `.env` and would point dev at Neon.
  - Never run `vercel deploy` or `vercel --prod`. A CLI deployment is a preview that receives production database credentials (the Neon integration injects the preview branch into git-triggered previews only), and a `--prod` one would migrate production from a branch; `scripts/guard-preview-db.ts` refuses both. A preview of `dev` comes from the Vercel dashboard (Create Deployment, ref `dev`); production comes from Miles merging `dev` into `main`.
- Whenever your work would make `migrate:create` ask create-vs-rename questions, end with an answer sheet: the suggested command, each expected prompt with the option to pick (renamed entity → **rename** from the old name; brand-new → **create**), and a one-line reason. `scripts/migrate-create.exp` takes the same answers (see `MIGRATIONS.md`).

## Architecture Pointers

- Public routes live in `src/app/(frontend)`. Pages are cached HTML (`export const revalidate = 600`, busted on publish by the collections' revalidate hooks). Never call `cookies()` or `headers()` in a page tree directly: the only request read is `hasWorkAccess`, passed as a function to `resolveVisibleWork`, which calls it only for a protected work. The proxy turns `?access=<key>` into the cookie and redirects to the clean URL.
- Payload admin/API routes live in `src/app/(payload)`.
- SEO and AEO are one system (`docs/aeo.md`): every route calls `generateMeta` with its `pathname` and renders `<JsonLd>` from the builders in `src/utilities/schema.ts`; Site Info is the source of the site-wide facts. `src/app/robots.ts` and `src/app/sitemap.ts` replace next-sitemap; `/llms.txt`, `/llms-full.txt` and the `.md` alternates are built in `src/plugins/aeo` from `CONTENT_SURFACES`. A new public collection goes in `CONTENT_SURFACES` first.
- Collections are in `src/collections` (`pages`, `posts`, `works`, `media`, `videos`, `capabilities`, `categories`, `clients`, `inquiries`, `ask-questions`, `users`).
- Layout blocks are in `src/blocks`.
- Hero configs/components are in `src/heros`.
- Figures (Chart, Diagram) are spec-driven: schemas and renderers in `src/features/figures`, blocks in `src/blocks/figures`, save-time validation and diagram geometry in `src/plugins/figures`. Human docs: `docs/figures.md`. Never hand-write `geometry`; the spec is the only authored value.
- Nothing runs on a schedule: no Payload `jobs`, no `crons` in `vercel.json`, no scheduled publish. Background work rides on the request that needs it (Ask retention after each stored question, Stream progress on the admin's status poll and the Stream webhook) or on a script run by hand (`scripts/resync-cloudflare-media.ts`). Do not add a cron or a job.
- Full-length videos are the `videos` collection, not Media: a block's **Play a video** switch (`src/fields/video.ts`) swaps its upload for one, Stream cuts the muted loop and the admin's status poll drives the pipeline (`src/collections/Videos/stream.ts`); the player is `src/components/VideoPlayer`. Human docs: `docs/media.md` → Videos.
- Media: Cloudflare R2 holds every file (browser uploads on presigned PUTs), Cloudflare Images/Stream serve it, one `thumbnail` size for the admin. Sync logic is in `src/collections/Media/cloudflare.ts` (hook and resync script share it). Human docs: `docs/media.md`.
- Load performance is one contract (`docs/performance.md`): analytics, the Ask runtime and the code highlighter load after idle in their own chunks; images carry `sizes` and Cloudflare serves them; a video's poster and rendition follow its frame; public assets are immutable and skip the proxy. Measure with `scripts/perf/` before and after touching the load path.
- Scroll entrances are one system: the `ScrollReveal` shell in `src/shared/ui/scroll-reveal` plays over `data-reveal` markers, and `src/blocks/shared/reveal-variants.ts` says which reveal each block gets. The browser drives every beat (`Element.animate`); never add a bespoke GSAP entrance or a second reveal wrapper.
- Site chrome (top bar, dock, Ask panel) is in `src/components/SiteChrome` and `src/features/ask/AskPanel.tsx`; the dock's tabs come from the Header global, Ask's switch and suggested questions from Site Info. Chrome state is in `src/stores/chromeStore.ts`; the post card → post curtain is in `src/features/page-transition`.
- The agent authoring MCP server (`milesroxas-cms`, `/api/mcp`) is configured in `src/plugins/mcp.ts`, its site tools in `src/plugins/mcp-tools/`. Human docs: `docs/mcp.md`. A new collection or global is not exposed until it is listed there.
- Copy in Miles's voice (site, LinkedIn, YouTube, CV) goes through the `miles-brand-content` skill: `.agents/skills/miles-brand-content`, symlinked into `.claude/skills/` for Claude Code. Its source of truth is `docs/miles-roxas-brand-context.md`; edit the guide, not the skill, when the brand changes.
- Access rule: MCP API keys authenticate as `req.user` over REST too. Team-only access uses the `authenticated` helper (`user.collection === 'users'`) or `authenticatedOr(where)`, never `Boolean(req.user)`.
- Design source is `design-system/` (Elyx `.elyx` files mirroring the CMS blocks, see `design-system/AGENTS.md`; use the `elyx` skill to read or edit them). Nothing in the app imports it: Biome skips it and `scripts/vercel-ignore-build.sh` treats it as inert.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
