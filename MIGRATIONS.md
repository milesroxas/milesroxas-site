# Database & migrations

Push in development. Migrations in CI.

This is the same workflow as sas-site. Local dev runs against a Docker Postgres that Drizzle **push** keeps in sync with the Payload config. Neon (preview and production) is only ever changed by `payload migrate` inside the Vercel build.

## Local database

`docker-compose.yml` runs Postgres 17 (Neon production's major) on `127.0.0.1:54330`, database `payload` (trust auth, no password). `.env` points at it:

```bash
POSTGRES_URL=postgresql://postgres@127.0.0.1:54330/payload
```

```bash
pnpm db:up      # start the container
pnpm db:down    # stop it
pnpm db:reset   # destroy the volume and start fresh; pnpm dev pushes the schema again
pnpm dev:tui    # dev TUI: pull production content, dev against local or prod, backups
```

`push` in `src/payload.config.ts` is on only when `POSTGRES_URL` is `127.0.0.1` or `localhost`, and `PAYLOAD_DB_PUSH=false` turns it off. A Neon URL in the env chain never gets pushed to.

Do not keep `.env.local` or `.env.production` in the repo root. Next.js loads them over `.env`, so a `vercel env pull` silently points dev (or a local `pnpm build`) at Neon. The dev TUI pulls production env into `.env.production.pulled`, a name Next.js never reads.

### Get production content locally

`pnpm dev:tui` → **Pull production content → local Docker DB**. It pulls `.env.production.pulled` with the Vercel CLI if missing, `pg_dump`s production with the container's own client, and restores it over the local `payload` DB. Local data is replaced and not backed up; use **Database → Back up local Docker DB** first if local has work worth keeping.

After a pull, `pnpm dev` push re-applies any schema changes on your branch.

## Production and preview

`vercel.json` sets the build command to `pnpm run ci`:

```bash
pnpm guard:preview-db && payload migrate && pnpm build
```

`pnpm ci` is the only writer of the Neon schema and the `payload_migrations` ledger. Git pushes build `main` (production) and `dev` (preview, Neon preview branch) only.

`scripts/guard-preview-db.ts` aborts a non-production build whose `POSTGRES_URL` is the production Neon endpoint. It needs `PRODUCTION_DB_ENDPOINT` (the production endpoint id, `ep-...`) set as a Vercel env var for Preview.

`scripts/vercel-ignore-build.sh` (`ignoreCommand`) skips a build when every changed file is one the site never reads (docs, agent config, stories, local tooling). New inert paths go in its `INERT_RES`.

## Schema change flow

1. Change the config: collections, globals, fields, blocks.
2. `pnpm dev` pushes the change into the local DB.
3. `pnpm generate:types` (and `pnpm generate:importmap` for admin components).
4. `pnpm migrate:create <name>`. Review the SQL. Commit the `.ts` and `.json` together.
5. `pnpm check:migrations` (enum safety) and `pnpm check:migrations:drift` (newest snapshot against the config).
6. Push. The Vercel build applies the migration: preview on `dev`, production on `main`.

```bash
pnpm migrate:create <name>    # a file to review and commit; touches no database
pnpm check:migrations         # enum safety
pnpm check:migrations:drift   # newest snapshot against the current config
pnpm migrate:status           # production ledger only
```

Never run `payload migrate` locally. The local DB is push-managed, and mixing push and migrations on one database corrupts the ledger. There is no `pnpm migrate` script for that reason.

`pnpm migrate:status` reads production through `.env.production.pulled`. The local database has no meaningful ledger. "No" means a committed migration is not deployed yet. "Yes" means CI has applied it.

### The migration must cover every schema change in the branch

`migrate:create` diffs the config against the newest `src/migrations/*.json` snapshot, never against a database. A field added after the migration was generated is synced locally by push, so the local build passes, but Neon never gets the column. `pnpm check:migrations:drift` catches it; the pre-push hook runs it.

### Postgres enum values

Payload runs each migration inside a transaction. A label added with `ALTER TYPE ... ADD VALUE` cannot be used in the same transaction. If `migrate:create` both adds a label and sets it as a default in one `up()`, recreate the enum in that migration, or split the add and the use across two migrations. Converting `text` to a `select` (enum) casts existing rows; normalize them with `UPDATE`s before the cast. `pnpm check:migrations` catches both.

### Create / rename prompt answers

`migrate:create` asks whether each new table or column is a **create** or a **rename**. A wrong answer can drop data. Renamed field, collection or block slug: **rename** from the old name. Brand-new entity: **create**.

`scripts/migrate-create.exp` answers the prompts from an explicit sheet and aborts on anything unanswered:

```bash
expect scripts/migrate-create.exp <name> column:posts.body_text=body column:posts.body=body_text
```

### Pre-push hook

`.githooks/pre-push` (wired by `pnpm install` via `prepare`) rejects a push that changes schema files without a new migration. It also runs the enum check on changed migrations and the drift check when schema or migrations changed. When you add a schema-owning path, add it to `SCHEMA_RES` in the hook. `SKIP_MIGRATION_GUARD=1 git push` skips it; use that only when you are sure no migration is needed.

### Parallel workspaces

Each Conductor workspace has its own database. The last migration to merge has to be generated on top of the others. See [docs/conductor.md](docs/conductor.md).

## Legacy recovery scripts

From the manual-migration era; they take an explicit `POSTGRES_URL`:

```bash
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/mark-migration.ts <migration-name>
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/check-schema.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/add-missing-columns.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/check-indexes.ts
POSTGRES_URL="<database-url>" pnpm dlx tsx scripts/fix-indexes.ts
```

Generated files are never edited by hand: `src/payload-types.ts` (`pnpm generate:types`) and `src/payload-generated-schema.ts` (`pnpm generate:db-schema`).
