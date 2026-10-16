# Miles Roxas Site

This repository contains the website and CMS for `milesroxas.com`.
It is a single Next.js App Router codebase with Payload CMS, Postgres, and a custom animated
frontend.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Payload CMS 3.90 (`@payloadcms/next`)
- Postgres via `@payloadcms/db-vercel-postgres`
- Cloudflare R2 storage (browser uploads) with Cloudflare Images and Stream sync hooks
- Tailwind CSS 4, Radix UI, shadcn/ui
- GSAP, Three.js, React Three Fiber
- Biome for linting and formatting

## Requirements

- Node.js 24 (`package.json#engines`)
- pnpm 10 (`package.json#packageManager`, pnpm self-switches)
- Docker Desktop (local Postgres)
- Vercel CLI, logged in (pulling production content)

## Local Development

1. Install dependencies: `pnpm install` (also wires `.githooks`)
2. Copy env template: `cp .env.example .env` and fill the secrets
3. Start Postgres: `pnpm db:up`
4. `pnpm dev:tui` → **Pull production content → local Docker DB**
5. `pnpm dev`, then open `http://localhost:3000`

Skip step 4 for an empty database: `pnpm dev` pushes the schema and the admin prompts for a first user. Database workflow: [MIGRATIONS.md](MIGRATIONS.md). Parallel workspaces: [docs/conductor.md](docs/conductor.md).

## Branches and Releases

`dev` is the integration branch and `main` is production. Feature branches and Conductor workspaces start from `origin/dev` and land on `dev`: rebase onto `origin/dev` and `git push origin HEAD:dev`, or a PR into `dev` when one is wanted. Vercel builds only `main` (`vercel.json` → `git.deploymentEnabled`); a preview of `dev` is created by hand in the Vercel dashboard (Deployments → Create Deployment, ref `dev`) and migrates the Neon preview branch. Release: Miles runs `git push origin dev:main` from the main checkout (fast-forward), or merges a PR from `dev` into `main`; the production build migrates production, and `pnpm migrate:status` confirms the ledger. Never `vercel deploy` from a branch: `scripts/guard-preview-db.ts` refuses it. Details: [docs/conductor.md](docs/conductor.md) → Branch flow.

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
| `pnpm test:unit` | Vitest unit project |
| `pnpm storybook` | Storybook dev server on port 6006 |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm test:storybook` | Run every story as a Vitest browser test (Playwright/Chromium) |
| `pnpm ci` | Vercel build: preview-DB guard, `payload migrate`, build. Never run locally |
| `pnpm migrate:create` | Create a migration (ask Miles first) |
| `pnpm migrate:status` | Production migration ledger |
| `pnpm check:migrations` | Migration enum safety |
| `pnpm check:migrations:drift` | Newest migration snapshot against the config |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm generate:db-schema` | Regenerate `src/payload-generated-schema.ts` |
| `pnpm generate:importmap` | Regenerate the admin import map after adding admin components |
| `pnpm generate:block-controls` | Regenerate the Storybook block-controls manifest after changing a block's fields |
| `pnpm check:block-controls` | Fail if the block-controls manifest is stale (pre-push hook runs it) |
| `pnpm cms:upload` | Upload media to the CMS over the MCP server ([docs/mcp.md](docs/mcp.md)) |
| `pnpm payload` | Run Payload CLI |

## Environment

This is the single reference for environment files and variables. `.env.example` carries the same comments.

### Environment Files

| File | Purpose |
| --- | --- |
| `.env` | Local development values; `POSTGRES_URL` is the local Docker DB |
| `.env.production.pulled` | Production env pulled by the dev TUI. Only the TUI, `pnpm migrate:status` and Conductor read it |
| `.env.example` | Reference template |

Do not create `.env.local` or `.env.production`: Next.js loads them over `.env`, and a `vercel env pull` into either points local dev or a local build at Neon. Pull production env through `pnpm dev:tui` → Database → Pull Vercel production env.

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Postgres connection string: local Docker in `.env` (`postgres@host`, no password, trust auth), Neon on Vercel. Drizzle push runs only against a local URL |
| `PRODUCTION_DB_ENDPOINT` | Production Neon endpoint id (`ep-...`), Vercel only; `scripts/guard-preview-db.ts` refuses to migrate it from a preview build |
| `PAYLOAD_SECRET` | Encrypts JWT tokens (Payload auth) |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL for absolute links, no trailing slash; the canonical domain in production |
| `CRON_SECRET` | Authenticates cron jobs |
| `PREVIEW_SECRET` | Validates draft preview requests |
| `R2_ACCOUNT_ID` | Cloudflare account that owns the R2 media bucket ([docs/media.md](docs/media.md)) |
| `R2_ACCESS_KEY_ID` | R2 API token access key (Object Read & Write on the bucket) |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET` | R2 bucket name, the media origin |
| `R2_PUBLIC_URL` | The bucket's public r2.dev URL, no trailing slash |
| `R2_ADMIN_TOKEN` | Setup only: the R2 API token value for bucket, public URL and CORS calls |
| `RESEND_API_KEY` | Resend email provider key (optional) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (Images + Stream) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH` | Cloudflare Images account hash |
| `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` | Cloudflare Stream playback domain |
| `CLOUDFLARE_STREAM_WEBHOOK_SECRET` | Cloudflare Stream webhook secret |
| `WORK_ACCESS_KEYS` | Comma-separated access keys for protected works (`?access=<key>`) |
| `INDEXNOW_KEY` | IndexNow key (`openssl rand -hex 16`); pings Bing, Yandex and the other IndexNow engines on publish. Production only, served at `/indexnow.txt`, optional ([docs/aeo.md](docs/aeo.md)) |
| `OPENAI_API_KEY` | Ask (`src/features/ask/README.md`). Without it `/api/ask` answers 503 and the rest of the site is unaffected |
| `OPENAI_ADMIN_API_KEY` | Optional: Site Info › Ask usage panel (an OpenAI Admin key, not the project key) |
| `OPENAI_PROJECT_ID` | Optional: the OpenAI project the usage panel reads |
| `TYPESAFE_API_KEY` | Optional judge (TypeSafe Jev) for Ask; the MCP server's `locateBlock` and `findContent` judge with the same key |
| `ASK_JEV` | Ask judge switch; `off` without a key |
| `CMS_MCP_API_KEY` | `pnpm cms:upload`: the MCP API key to upload with ("Upload media" ticked on the key). Defaults to the `milesroxas-cms` entry in Claude Code's config |
| `CMS_UPLOAD_SERVER` | `pnpm cms:upload`: the site it uploads to. Same default |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | `pnpm cms:upload` only when the target is a preview deployment (Vercel Authentication) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog client key (set on Vercel) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host (set on Vercel) |

## Content Model

Collections (`src/collections`):

- `pages`, `posts`, `works`: the public content, composed from Sections and the shared block run
- `media`: uploads on Cloudflare R2, served by Cloudflare Images and Stream
- `capabilities`, `categories`, `clients`: taxonomy and relations for works and posts
- `inquiries`: contact-form submissions from `/contact`
- `ask-questions`: Ask questions, ratings and the inbox
- `users`: admin accounts

Plugin collections: `forms` and `form-submissions` (form builder), `redirects`, `search`, `streak-looks` (Studio looks, `src/plugins/streak-studio`).

Globals (`src/globals`): `Header` (dock tabs), `SiteInfo` (site-wide facts, Ask switch, SEO identity), `ContactPage`, `WorksIndex`.

Blocks (`src/blocks`). The composer run, listed once in `src/blocks/shared/section-blocks.ts`, nests inside a `section` and is spread into every layout drawer (Pages, Works, Posts):

- Structure: `section`
- Section heading: `rich-transition`, `feature/HeadingOffset`
- Media and content: `full-media`, `media-content-split`, `split-content`, `carousel-split`, `image-pair`, `split-image-offset`
- Media: `feature/ImageStatement`, `caption`, `youtube`
- Text: `rich-text` (with its inline `insights`, `actions` and `pill-list` blocks), `Code`
- Figures: `figures/chart`, `figures/diagram` ([docs/figures.md](docs/figures.md))
- Interactive: `faq`, `Carousel`, `carousel-tabs`, `feature/Tabs`
- Lists: `insight-list`
- Custom: `Content` (multi-column)

Legacy blocks, top-level only on Pages and Works: `ArchiveBlock`, `CallOut` (Pages), `CallToAction`, `Form`, `MediaBlock`, `Slider`, `Tabs` (Works). The post body's rich text embeds `Banner`, `Code` and `MediaBlock`. `RenderBlocks.tsx` renders a layout; `shared` holds the field helpers, band themes and reveal variants.

Hero types (`src/heros/config.ts`): `none`, `editorial` (posts only), `home`, `highImpact`, `mediumImpact`, `lowImpact`.

## Project Structure

Main directories inside `src/`:

- `app` - Next.js routes: `(frontend)` public pages, `(payload)` admin and API, `robots.ts` and `sitemap.ts`
- `collections` - Payload collections
- `globals` - Payload globals (Header, Site Info, Contact page, Works index)
- `blocks` - Layout block configs and components
- `heros` - Hero configs and components
- `sections` - Page-level sections rendered outside the block run (work intro and dial, more work, posts index)
- `features` - Feature modules: Ask, contact, figures, immersive effects, page transitions, contents
- `shared` - Content surfaces for Ask and AEO, shared UI (scroll reveal), test helpers
- `components/SiteChrome` - Top bar, dock and Ask entry ([docs/site-chrome.md](docs/site-chrome.md))
- `templates` - Page templates (homepage)
- `fields` - Reusable Payload fields: lexical editors, visual slots, hero, layout blocks
- `endpoints` - Custom Payload endpoints (`/api/ask`, agent media upload)
- `jobs` - Payload jobs (Cloudflare media sweep, Ask question retention)
- `stores` - Zustand stores
- `plugins` - Payload plugins: AEO, Ask index, figures, MCP server, Studio
- `stories` - Storybook fixtures and the block-controls manifest
- `migrations` - Database migrations

## Docs

- [docs/aeo.md](docs/aeo.md) - SEO and AEO: metadata, JSON-LD, sitemap, `llms.txt` and the `.md` alternates
- [docs/conductor.md](docs/conductor.md) - Conductor workspaces, branch flow, schema changes across workspaces
- [docs/figures.md](docs/figures.md) - Chart and diagram blocks, Markdown input, the figure palette
- [docs/immersive-effects.md](docs/immersive-effects.md) - How the WebGL and shader effects are organized and tuned
- [docs/mcp.md](docs/mcp.md) - The `milesroxas-cms` MCP server: tools, keys, `pnpm cms:upload`
- [docs/media.md](docs/media.md) - Media pipeline: R2 origin, Cloudflare Images and Stream, the sweep job
- [docs/media-dimensions.md](docs/media-dimensions.md) - Export sizes for each block that holds media
- [docs/miles-roxas-brand-context.md](docs/miles-roxas-brand-context.md) - Brand voice and evidence rules for copy in Miles's voice
- [docs/performance.md](docs/performance.md) - Load performance contract and how to measure it
- [docs/site-chrome.md](docs/site-chrome.md) - Top bar, dock, Ask panel, theme toggle and route scroll reset
- [docs/streak-field.md](docs/streak-field.md) - The Streak Field shader as CMS media
- [docs/streak-field-studio.md](docs/streak-field-studio.md) - Authoring Studio looks in the admin
- [docs/studio-effects.md](docs/studio-effects.md) - The Studio effect contract and how to add an effect
- [docs/archive/composer-roadmap.md](docs/archive/composer-roadmap.md) - Record of the composer port, closed 2026-10-15

## Migrations and Deployment

- Push in development, migrations in CI: the Vercel build runs `payload migrate`.
- See [MIGRATIONS.md](MIGRATIONS.md) for the migration workflow.
- See [Branches and Releases](#branches-and-releases) above and [docs/conductor.md](docs/conductor.md) for branch and release flow.
