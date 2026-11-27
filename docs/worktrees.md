# Worktrees

Same setup as sas-site. Development runs in [T3 Code](https://github.com/pingdotgg/t3code): each thread works in its own git worktree under `~/.t3/worktrees/milesroxas-site/`, cut from the branch you pick for the thread. Each worktree gets its own `.env`, dev port and Postgres database, so any number of them can run at once. The scripts live in `scripts/worktree/`. A plain `git worktree` in a terminal uses the same scripts.

## First-time setup

1. The main checkout is `~/SITES/milesroxas-site`. Every worktree is a worktree of it, and its `.env` is the one each worktree copies. The scripts never `git pull` it.
2. Make sure the main dev DB `payload` has content (dev TUI → Pull production content). New worktrees clone it.
3. Save these as the project's scripts in T3 Code (stored in T3 Code, not in this repo). Each command falls back to `.conductor/`, where the scripts lived before 2026-11-27, so a worktree cut from an older branch still sets up:

   | Project script | Command | When |
   |---|---|---|
   | Setup worktree | `bash "$(test -d scripts/worktree && echo scripts/worktree || echo .conductor)/setup.sh"` | Automatically on worktree create |
   | Dev | `bash "$(test -d scripts/worktree && echo scripts/worktree || echo .conductor)/run-dev.sh"` | Play button |
   | Storybook | `bash "$(test -d scripts/worktree && echo scripts/worktree || echo .conductor)/run-storybook.sh"` | Manual |
   | Prune worktree DBs (dry run) | `bash "$(test -d scripts/worktree && echo scripts/worktree || echo .conductor)/prune-dbs.sh"` | Manual; add `--yes` in a terminal to drop |

4. Start every thread's worktree from `dev`. T3 Code cuts the worktree from the branch the thread names, and a worktree cut from `main` starts from production.

In the main checkout (a T3 thread in local mode) `setup.sh` refuses, since the main checkout keeps its own `.env`, DB `payload` and port 3000, and `run-dev.sh` is plain `pnpm dev`.

## Branch flow

`dev` is the integration branch; `main` is production. A worktree branches from `origin/dev`. A push to `dev` does not deploy: `vercel.json` turns off git deployments for every branch except `main`, to save build minutes. A preview of `dev` deploys only by hand (Vercel dashboard → Deployments → Create Deployment, ref `dev`); it builds the Vercel preview and migrates the Neon preview branch. Never `vercel deploy` from a worktree: a CLI deployment is a preview that gets production database credentials, and `scripts/guard-preview-db.ts` refuses it (as it did on 2026-10-16).

**Default: push straight to `dev`.** Miles works alone, so most work skips PRs:

```bash
git fetch origin && git rebase origin/dev
git push origin HEAD:dev   # a worktree cannot check out dev; the main checkout holds it
```

The pre-push hook checks exactly what lands on `dev`, and git rejects the push if `dev` moved since the rebase: rebase and push again.

**PR flow, when Miles asks for one** (a change he wants to review on GitHub, or a long-running branch): push the worktree branch and open a PR into `dev`. The `dev` ruleset requires the `snapshot-chain` check. If the PR adds a migration and `dev` gained one since, rebase and regenerate before merging. Never assume the PR flow; use it only when asked.

**Release:** from the main checkout, `git pull && git push origin dev:main` (fast-forward), or a PR from `dev` into `main` when Miles wants one. Either way production deploys and its DB migrates, so only Miles releases; agents give him the command.

## What a worktree gets

| Thing | Where it comes from |
|-------|---------------------|
| Worktree | `~/.t3/worktrees/milesroxas-site/<thread dir>`, made by T3 Code |
| `.env` | Copied from the main checkout (`$T3CODE_PROJECT_ROOT`, or the git main worktree in a terminal). Only `POSTGRES_URL`, `NEXT_PUBLIC_SERVER_URL` and `DEV_PORT` are rewritten. Re-run setup to pick up a changed main `.env` |
| Ports | T3 Code hands out none. Setup takes the first even port in 3300–3398 that no other worktree's `.env` claims and nothing listens on, stores it as `DEV_PORT`, and Storybook runs on `+1` |
| Database | `payload_<worktree dir>` in the one shared `milesroxas-postgres-1` container (port 54330), cloned from the main dev DB `payload` |
| Cloudflare R2, Images, Stream, Resend, … | Shared with the main checkout: same keys, same stores |

Setup copies only `.env`. Never copy `.env.production.pulled` into a worktree: it holds Neon production credentials. The scripts and the dev TUI read the main checkout's copy instead.

Never create `.env.local` in a worktree. Next.js loads it **over** `.env`, and `vercel env pull` writes it by default with `POSTGRES_URL` = Neon production, so dev push would then offer to drop production tables. `lib.sh` refuses to run setup/dev/storybook while `.env.local` or `.env.development.local` names any DB other than the worktree's (`mv .env.local .env.local.neon-bak`). Pull production env via the dev TUI, which writes `.env.production.pulled`, a name Next.js never reads; run in a worktree it reads the main checkout's copy when one exists.

### Isolation from sas-site and other repos

- Docker: compose project `milesroxas`, container `milesroxas-postgres-1`, volume `milesroxas_postgres_data`, host port 54330. sas-site has its own project, container, volume and port (54320). `ensure_postgres` refuses to run when 54330 is published by any other compose project or held by another process.
- Ports: each repo has its own worktree range (milesroxas-site 3300–3398, sas-site 3200–3298). A dev server orphaned from an earlier session (in any repo) can still hold a port, so `run-dev.sh` and `run-storybook.sh` refuse to start on a taken port and print the owning pid and checkout. Stop the stale server (`kill <pid>`) and run again; never fall back to another port, or the worktree's stored URL opens the wrong site.

## Scripts

| Script | When | What |
|--------|------|------|
| `setup.sh` | Worktree created; re-runnable | Copy `.env`, pick `DEV_PORT`, rewrite `POSTGRES_URL` / `NEXT_PUBLIC_SERVER_URL`, `pnpm install`, start postgres if needed, create the worktree DB |
| `run-dev.sh` | Dev (play button) | Re-ensure postgres + DB, `next dev -p $DEV_PORT` |
| `run-storybook.sh` | Storybook | `storybook dev -p $((DEV_PORT+1))` |
| `prune-dbs.sh` | Manual | Drop worktree DBs no live worktree references (dry run unless `--yes`) |

All of them source `lib.sh`, run from the worktree directory, and only touch the DB named in the worktree's `.env`. They need the local Docker container and the main checkout's `.env`.

### Database identity

The DB is keyed on the worktree **directory** (`payload_<worktree dir>`, symlinks resolved), and once `.env` exists its `POSTGRES_URL` is the source of truth, so setup re-runs and prune agree on one database.

Setup marks each worktree DB with the comment `worktree`, and `prune-dbs.sh` only considers marked DBs (DBs made before 2026-11-27 carry `conductor-workspace` until their next run, and count too). A hand-made DB (`payload_x`) has no mark, so prune never drops it. T3 Code has no hook when it removes a worktree, so prune is the only cleanup; run it now and then:

```bash
bash scripts/worktree/prune-dbs.sh        # list orphans
bash scripts/worktree/prune-dbs.sh --yes  # drop them
```

Prune counts T3 worktrees (`~/.t3/worktrees/milesroxas-site`) and every git worktree of the checkout as live.

### Seeding and reseeding

New worktree DBs are cloned from the main dev DB `payload` (`CREATE DATABASE … TEMPLATE` when nothing is connected to `payload`, otherwise `pg_dump | psql`). `payload` is itself a production restore (dev TUI → Pull production content, see MIGRATIONS.md), so a clone is prod-equivalent content in seconds, offline. Options from a worktree terminal:

```bash
bash scripts/worktree/setup.sh --reseed                    # fresh clone of payload
bash scripts/worktree/setup.sh --reseed --from production  # pg_dump straight from Neon
pnpm dev:tui                                         # Pull production content → this worktree's DB
```

`--from production` needs `.env.production.pulled` in the main checkout or a logged-in `vercel` CLI; it falls back to the local clone otherwise, and sets `PAYLOAD_SECRET` to production's so encrypted fields decrypt. The dev TUI's pull targets the DB the worktree `.env` names (never the shared `payload`), borrows the main checkout's Vercel link and pulled env, and keeps the database comment prune relies on.

### Shared container, never re-created from a worktree

`docker-compose.yml` pins `name: milesroxas`, so every checkout addresses the same container. It is a separate container from sas-site's on purpose: `prune-dbs.sh` drops every marked `payload_*` DB that no worktree of *this* repo references, so two repos must never share one container. `docker compose up` re-creates a running container whenever the rendered config differs from the one it started with, dropping every worktree's connections, so `lib.sh` only runs `up` when nothing is running.

## Schema changes across worktrees

At the database level nothing is shared: each worktree's DB is drizzle-**push**-synced from its own branch on `pnpm dev`, exactly like the main checkout. Two worktrees can add, rename or drop fields independently.

The coupling is in the **migration files**. `payload migrate:create` does not look at any database: it diffs the current config against the newest `src/migrations/*.json` snapshot (newest by filename). That gives one rule:

> **Your migration's snapshot must be generated on top of the newest migration on `dev` at the time it lands there (push or PR merge).**

`main` only receives `dev`, so a correct chain on `dev` is a correct chain on `main`.

Why: worktree A and worktree B both branch from `dev` whose newest snapshot is S₀. A generates `T1_a` (snapshot S₀+A), B generates `T2_b` (snapshot S₀+B). Both migrations apply cleanly in CI. But after both merge, the newest snapshot is S₀+B, which does not know about A. The next `migrate:create` on any branch diffs against S₀+B and re-emits A's `ADD COLUMN`s; CI's `payload migrate` then fails on `already exists` and the deploy is dead.

Procedure for a branch that carries a migration:

1. Before pushing to `dev` (or opening / merging a PR): `git fetch origin && git rebase origin/dev`.
2. Did `origin/dev` gain migration files newer than the one your migration was generated against? Then delete your migration (`.ts` **and** `.json`), and regenerate it with `pnpm migrate:create <name>` (ask first, per `CLAUDE.md`), so its snapshot includes dev's changes and its timestamp sorts last.
3. `pnpm check:migrations` (enum safety) and `pnpm check:migrations:drift` (newest snapshot == config). The pre-push hook runs both whenever schema source or migrations changed.
4. `src/migrations/index.ts` conflicts: keep both branches' imports/entries in filename order, or let `migrate:create` rewrite it.

Three gates enforce the rule, because the drift check alone only sees the branch's own tree: a migration generated before `dev` gained another one passes it on the branch and breaks the chain on merge.

- **Pre-push** (`.githooks/pre-push`): when the push adds a migration, it fetches `origin/dev` and fails unless the branch holds every migration on `dev` and its own migrations sort after `dev`'s newest.
- **PR check** (PR flow only; `.github/workflows/migrations.yml`, job `snapshot-chain`): runs the enum and drift checks on the merge commit GitHub builds for every PR into `dev` or `main`. The `dev` ruleset makes it required, so a PR with a broken chain cannot merge.
- **Push check** (same workflow): runs again on every push to `dev` and `main`. A PR's check only runs when the PR changes, so if two open PRs both add migrations and one merges, the other's green check is out of date. The push check on `dev` catches the result before it reaches `main`.

When the push check on `dev` goes red, do not regenerate the merged migration. A preview of `dev` may already have applied it to the Neon preview branch, so that ledger (and production's, after a release) has its name, and a regenerated copy would run its SQL again. Fix forward: the next `migrate:create` re-emits the other branch's statements, so delete those statements from its `up()`/`down()` (the databases already have them) and keep its `.json`, which restores the chain.

`pnpm check:migrations:drift` is the same diff `migrate:create` would run, with no DB connection and no files written. It also catches the older failure mode: a field added after the migration was generated. If drizzle asks a create-vs-rename question during the check, the answer is irrelevant: a prompt already means the snapshot and the config disagree.

Merge order does not matter as long as the last migration to land was regenerated on top of the others. Two worktrees should never generate a migration for the *same* change; one branch owns a schema change.

After rebasing, `pnpm dev` push re-syncs the worktree DB. If push warns about data loss (a column removed on `dev`), accept (the worktree DB is disposable) or run `bash scripts/worktree/setup.sh --reseed`.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Dev: `no .env in this worktree` | Setup never ran. T3 Code → Setup worktree, or `bash scripts/worktree/setup.sh` |
| `this is the main checkout, not a worktree` | Setup ran in the main checkout (a T3 thread in local mode). Nothing to do: it uses `.env` as is |
| `no free port pair in 3300-3398` | 50 worktrees claim ports. Remove stale worktrees, then re-run setup |
| `Docker is not running` | Start Docker Desktop; Dev re-ensures the container |
| Dev server reads/writes the shared `payload` DB although `.env` names `payload_<worktree dir>` | The launcher injected `POSTGRES_URL` into the process env (Next.js prefers process env over `.env`). `lib.sh` exports the worktree URL explicitly; restart Dev |
| `.env.local sets POSTGRES_URL to a database other than …` | `vercel env pull` ran in the worktree. `mv .env.local .env.local.neon-bak`, restart |
| `<main checkout>/.env not found` | The main checkout has no `.env`; create it from `.env.example` |
| Setup slow (~30 s) on "creating database" | Something is connected to `payload` (the main dev server), so `TEMPLATE` was refused and it fell back to dump/restore. Normal |
| Dev server exits right after a schema change | Drizzle push asked to confirm data loss and got no TTY. Run `pnpm dev` once in the worktree terminal and answer, or `setup.sh --reseed` |
| Disk filling with `payload_*` DBs | `bash scripts/worktree/prune-dbs.sh --yes` |
| CI `payload migrate`: `column … already exists` | The snapshot rule above was broken. The failing migration re-emits another branch's statements: delete those from its `up()`/`down()`, keep its `.json` (see "Schema changes across worktrees") |
| Pre-push: `this branch's migration is not generated on top of origin/dev` | `git rebase origin/dev`, delete the branch's migration (`.ts` + `.json`), regenerate it |
