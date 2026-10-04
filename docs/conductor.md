# Conductor workspaces

Same setup as sas-site. [Conductor](https://www.conductor.build/docs) runs several agents in parallel, each in its own git worktree. This repo's shared settings live in `.conductor/settings.toml`; the scripts it points at live in `.conductor/*.sh`. Personal overrides go in `.conductor/settings.local.toml` (gitignored).

## First-time setup

1. Conductor's root for this repo is the main checkout, `~/SITES/milesroxas-site` (added with Open project on 2026-10-03); every workspace is a worktree of it. `setup.sh` runs `git pull --ff-only` in the root on every new workspace, so keep the main checkout on `dev`. (`~/conductor/repos/milesroxas-site` is an older clone Conductor does not use.)
2. The root's `.env` is your main `.env`, so workspaces copy it directly.
3. Make sure the main dev DB `payload` has content (dev TUI → Pull production content). New workspaces clone it.
4. In Conductor, set the repository's base branch and each workspace's target branch to `dev` (target branch: top of the workspace page).

## Branch flow

`dev` is the integration branch; `main` is production. A workspace branches from `origin/dev`. A push to `dev` builds the Vercel preview and migrates the Neon preview branch.

**Default: push straight to `dev`.** Miles works alone, so most work skips PRs:

```bash
git fetch origin && git rebase origin/dev
git push origin HEAD:dev   # a workspace cannot check out dev; the main checkout holds it
```

The pre-push hook checks exactly what lands on `dev`, and git rejects the push if `dev` moved since the rebase: rebase and push again. Then archive the workspace.

**PR flow, when Miles asks for one** (a change he wants to review on GitHub, or a long-running branch): push the workspace branch and open a PR into `dev` (Conductor → Create PR, target `dev`). The `dev` ruleset requires the `snapshot-chain` check. If the PR adds a migration and `dev` gained one since, rebase and regenerate before merging. Never assume the PR flow; use it only when asked.

**Release:** from the main checkout, `git pull && git push origin dev:main` (fast-forward), or a PR from `dev` into `main` when Miles wants one. Either way production deploys and its DB migrates, so only Miles releases; agents give him the command.

## What a workspace gets

| Thing | Where it comes from |
|-------|---------------------|
| Worktree | `~/conductor/workspaces/milesroxas-site/<city>` — Conductor also adds a `<branch-name>` symlink beside it once the branch is renamed |
| `.env` | Copied from the Conductor root (`$CONDUCTOR_ROOT_PATH` = the main checkout). Only `POSTGRES_URL` and `NEXT_PUBLIC_SERVER_URL` are rewritten per workspace. Re-run setup to pick up a changed root `.env` |
| Files to copy | Only `.env` (`file_include_globs`). Conductor's default `.env*` would also copy `.env.production.pulled`, which holds Neon production credentials |
| Ports | `$CONDUCTOR_PORT` for Next, `+1` for Storybook (Conductor reserves `CONDUCTOR_PORT..+9`) |
| Open button | Site, Admin (`/admin`) and Storybook URLs for the workspace ports (`preview_urls`) |
| Database | `payload_<city>` in the one shared `milesroxas-postgres-1` container (port 54330), cloned from the main dev DB `payload` |
| Vercel Blob, Cloudflare, Resend, … | Shared with your main checkout — same keys, same stores |

Never create `.env.local` in a workspace. Next.js loads it **over** `.env`, and `vercel env pull` writes it by default with `POSTGRES_URL` = Neon production — dev push would then offer to drop production tables. `lib.sh` refuses to run setup/dev/storybook while `.env.local` or `.env.development.local` names any DB other than the workspace one (`mv .env.local .env.local.neon-bak`). Pull production env only from the main checkout via the dev TUI, which writes `.env.production.pulled`.

`run_mode = "concurrent"`: because port and DB are per-workspace, any number of workspaces can run at once.

### Isolation from sas-site and other repos

- Docker: compose project `milesroxas`, container `milesroxas-postgres-1`, volume `milesroxas_postgres_data`, host port 54330. sas-site has its own project, container, volume and port (54320). `ensure_postgres` refuses to run when 54330 is published by any other compose project or held by another process.
- Ports: Conductor reserves `CONDUCTOR_PORT..+9` per workspace but does not check the port is free, so a dev server orphaned from an earlier session (in any repo) can still hold it. `run-dev.sh` and `run-storybook.sh` refuse to start on a taken port and print the owning pid and checkout. Stop the stale server (`kill <pid>`) and Run again; the Open button always points at `$CONDUCTOR_PORT`, so falling back to another port would open the wrong site.

## Scripts

| Script | When | What |
|--------|------|------|
| `setup.sh` | Workspace created; re-runnable | Copy `.env`, rewrite `POSTGRES_URL` / `NEXT_PUBLIC_SERVER_URL`, `pnpm install`, start postgres if needed, create the workspace DB |
| `run-dev.sh` | Run ▶ (default) | Re-ensure postgres + DB, `next dev -p $CONDUCTOR_PORT` |
| `run-storybook.sh` | Run ▶ Storybook | `storybook dev -p $((CONDUCTOR_PORT+1))` |
| `archive.sh` | Before archive | Drop the workspace DB. Never fails the archive |
| `prune-dbs.sh` | Manual | Drop workspace DBs no live workspace references (dry run unless `--yes`) |

All of them source `lib.sh`, run from the workspace directory, and only touch the DB named in the workspace's `.env`. The run scripts are `available_in = ["local"]`: they need the local Docker container and the root `.env`.

### Database identity

The DB is keyed on the workspace **directory** (`payload_<city>`), and once `.env` exists its `POSTGRES_URL` is the source of truth. It is deliberately not keyed on `$CONDUCTOR_WORKSPACE_NAME`: Conductor renames the workspace to the branch name after the first chat, so a name-keyed DB got re-created under the new name on the next Run and the archive dropped the wrong one — orphans accumulated at ~50 MB each.

Setup marks each workspace DB with the comment `conductor-workspace`, and `prune-dbs.sh` only considers marked DBs. A hand-made worktree DB (`payload_x`, see below) has no mark, so prune never drops it. Reclaim any leftovers:

```bash
bash .conductor/prune-dbs.sh        # list orphans
bash .conductor/prune-dbs.sh --yes  # drop them
```

### Seeding and reseeding

New workspace DBs are cloned from the main dev DB `payload` (`CREATE DATABASE … TEMPLATE` when nothing is connected to `payload`, otherwise `pg_dump | psql`). `payload` is itself a production restore (dev TUI → Pull production content, see MIGRATIONS.md), so a clone is prod-equivalent content in seconds, offline. Options from a workspace terminal:

```bash
bash .conductor/setup.sh --reseed                    # fresh clone of payload
bash .conductor/setup.sh --reseed --from production  # pg_dump straight from Neon
```

`--from production` needs `.env.production.pulled` in the Conductor root (the main checkout) or a logged-in `vercel` CLI; it falls back to the local clone otherwise, and sets `PAYLOAD_SECRET` to production's so encrypted fields decrypt.

### Shared container, never re-created from a workspace

`docker-compose.yml` pins `name: milesroxas`, so every checkout addresses the same container. It is a separate container from sas-site's on purpose: `prune-dbs.sh` drops every `payload_*` DB that no workspace of *this* repo references, so two repos must never share one container. `docker compose up` re-creates a running container whenever the rendered config differs from the one it started with, dropping every workspace's connections — so `lib.sh` only runs `up` when nothing is running.

## Schema changes across workspaces

At the database level nothing is shared: each workspace's DB is drizzle-**push**-synced from its own branch on `pnpm dev`, exactly like the main checkout. Two workspaces can add, rename or drop fields independently.

The coupling is in the **migration files**. `payload migrate:create` does not look at any database — it diffs the current config against the newest `src/migrations/*.json` snapshot (newest by filename). That gives one rule:

> **Your migration's snapshot must be generated on top of the newest migration on `dev` at the time it lands there (push or PR merge).**

`main` only receives `dev`, so a correct chain on `dev` is a correct chain on `main`.

Why: workspace A and workspace B both branch from `dev` whose newest snapshot is S₀. A generates `T1_a` (snapshot S₀+A), B generates `T2_b` (snapshot S₀+B). Both migrations apply cleanly in CI. But after both merge, the newest snapshot is S₀+B — it does not know about A. The next `migrate:create` on any branch diffs against S₀+B and re-emits A's `ADD COLUMN`s; CI's `payload migrate` then fails on `already exists` and the deploy is dead.

Procedure for a branch that carries a migration:

1. Before pushing to `dev` (or opening / merging a PR): `git fetch origin && git rebase origin/dev`.
2. Did `origin/dev` gain migration files newer than the one your migration was generated against? Then delete your migration (`.ts` **and** `.json`), and regenerate it — `pnpm migrate:create <name>` (ask first, per `CLAUDE.md`) — so its snapshot includes dev's changes and its timestamp sorts last.
3. `pnpm check:migrations` (enum safety) and `pnpm check:migrations:drift` (newest snapshot == config). The pre-push hook runs both whenever schema source or migrations changed.
4. `src/migrations/index.ts` conflicts: keep both branches' imports/entries in filename order, or just let `migrate:create` rewrite it.

Three gates enforce the rule, because the drift check alone only sees the branch's own tree: a migration generated before `dev` gained another one passes it on the branch and breaks the chain on merge.

- **Pre-push** (`.githooks/pre-push`): when the push adds a migration, it fetches `origin/dev` and fails unless the branch holds every migration on `dev` and its own migrations sort after `dev`'s newest.
- **PR check** (PR flow only; `.github/workflows/migrations.yml`, job `snapshot-chain`): runs the enum and drift checks on the merge commit GitHub builds for every PR into `dev` or `main`. The `dev` ruleset makes it required, so a PR with a broken chain cannot merge.
- **Push check** (same workflow): runs again on every push to `dev` and `main`. A PR's check only runs when the PR changes, so if two open PRs both add migrations and one merges, the other's green check is out of date. The push check on `dev` catches the result before it reaches `main`.

When the push check on `dev` goes red, the migrations are already applied on the Neon preview branch. Do not regenerate the merged migration: the preview (and later production) ledger has its name, and a regenerated copy would run its SQL again. Fix forward: the next `migrate:create` re-emits the other branch's statements, so delete those statements from its `up()`/`down()` (the databases already have them) and keep its `.json`, which restores the chain.

`pnpm check:migrations:drift` is the same diff `migrate:create` would run, with no DB connection and no files written. It also catches the older failure mode — a field added after the migration was generated. If drizzle asks a create-vs-rename question during the check, the answer is irrelevant: a prompt already means the snapshot and the config disagree.

Merge order does not matter as long as the last migration to land was regenerated on top of the others. Two workspaces should never generate a migration for the *same* change; one branch owns a schema change.

After rebasing, `pnpm dev` push re-syncs the workspace DB. If push warns about data loss (a column removed on `dev`), accept — the workspace DB is disposable — or `bash .conductor/setup.sh --reseed`.

## Worktrees outside Conductor

A hand-made worktree (`git worktree add …`) that copies the main `.env` shares the `payload` DB and port 3000 with the main checkout. Two branches pushing different schemas into one DB fight each other (columns added/dropped on every restart, data-loss prompts). Either run that branch in Conductor, or give it its own DB the same way: `CREATE DATABASE payload_x TEMPLATE payload` and point its `.env` at it. Prune does not touch that DB; drop it yourself when the worktree goes.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Run: `no .env in this workspace` | Setup never ran — Conductor → Run setup script, or `bash .conductor/setup.sh` |
| `Docker is not running` | Start Docker Desktop; Run re-ensures the container |
| Dev server reads/writes the shared `payload` DB although `.env` names `payload_<city>` | Launcher injected `POSTGRES_URL` into the process env (Next.js prefers process env over `.env`). `lib.sh` exports the workspace URL explicitly; restart Run ▶ |
| `.env.local sets POSTGRES_URL to a database other than …` | `vercel env pull` ran in the workspace. `mv .env.local .env.local.neon-bak`, restart |
| `$CONDUCTOR_ROOT_PATH/.env not found` | The main checkout has no `.env`; create it from `.env.example` |
| Setup slow (~30 s) on "creating database" | Something is connected to `payload` (main dev server), so `TEMPLATE` was refused and it fell back to dump/restore. Normal |
| Dev server exits right after a schema change | Drizzle push asked to confirm data loss and got no TTY. Run `pnpm dev` once in the workspace terminal and answer, or `setup.sh --reseed` |
| Disk filling with `payload_*` DBs | `bash .conductor/prune-dbs.sh --yes` |
| CI `payload migrate`: `column … already exists` | The snapshot rule above was broken. The failing migration re-emits another branch's statements: delete those from its `up()`/`down()`, keep its `.json` (see "Schema changes across workspaces") |
| Pre-push: `this branch's migration is not generated on top of origin/dev` | `git rebase origin/dev`, delete the branch's migration (`.ts` + `.json`), regenerate it |
