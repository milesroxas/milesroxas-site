<!-- Published post, milesroxas.com/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer, read 2026-10-26. Evidence for cases 7 and 10. -->

# Fourteen branches, one afternoon: how I work in parallel

## The bottleneck was never typing

On October 7 this site's repo took 58 commits. They came from 14 workspaces I opened that day, each on its own branch, each with its own dev server and database, most of them driven by a coding agent while I reviewed the one before. Since 25 September the count is 170 commits, 23 migrations and 37 workspace branches, from one person.

None of that is possible with one checkout. Someone building alone is rarely blocked by how fast they can write code. They are blocked by waiting: a dev server restarting, an agent running for ten minutes, a schema push that has to finish before the next thing starts. One checkout means one branch, one port, one database. Start a second task and you stash, switch, re-sync the schema and lose the state of the first.

The fix is not a faster machine. It is making a task cheap to open and cheap to throw away, then running as many at once as attention allows. The rest of this post is the setup that does that: the worktree tooling, the database isolation, and the migration gates that keep parallel schema work from breaking production.

[figure] Commits per day since Conductor went in: Daily commits on the dev branch. The workspace tooling landed on 3 October; the spike is 14 workspaces landing on the same afternoon.

## A workspace is a whole site

Conductor opens a git worktree per task and runs a coding agent inside it. That is the easy half. The repo's job is to make each worktree a complete, isolated copy of the site: its own port, its own Postgres database, its own .env. Three small scripts do it, and a fourth holds the shared helpers.

- setup.sh runs once when the workspace is created. It copies .env from the main checkout, rewrites POSTGRES_URL and NEXT_PUBLIC_SERVER_URL for this workspace, runs pnpm install, and creates the database.
- run-dev.sh is the Run button. It re-checks Postgres and the database, then starts Next on $CONDUCTOR_PORT.
- archive.sh drops the workspace database and nothing else.
- lib.sh is sourced by all three and owns the database identity, the port checks and the guards.

[figure] What a workspace gets, from open to archive: Only the main checkout's .env and the shared Postgres container are touched from outside the worktree. Everything else lives and dies with it.

Conductor reads one file, .conductor/settings.toml. It names the scripts, tells Conductor that workspaces may run at the same time, and gives every agent that opens in this repo the landing rule, so Claude and Codex both get it without reading CLAUDE.md.

The database is the part most parallel setups get wrong. Running one Postgres per workspace is slow and eats memory; sharing one database between branches is worse, because two branches pushing different schemas into it fight on every restart. The middle path is one container, one database per workspace.

docker-compose.yml pins the compose project name, so every checkout addresses the same container and volume whatever directory it runs from. The image is the pgvector build of Postgres 17, the same major as Neon in production, so what push does locally matches what the migration does there.

A new workspace database is a clone of the main dev database, payload, which is itself a production restore pulled by the dev TUI. So every workspace opens with real content, offline, and the clone takes about a second: CREATE DATABASE ... TEMPLATE copies files rather than rows. Postgres refuses the template while another session is connected to it, which is whenever the main dev server is running, so the helper falls back to a dump and restore.

The scripts are short. The guards around them are where the time went, and each one is a bug I hit once.

- Database identity is the directory, not the name. Conductor renames a workspace to its branch after the first chat. Keyed on the name, the next Run created a second database and the archive dropped the wrong one. Orphans piled up at 50 MB each. Now the DB name comes from the worktree directory, and once .env exists its POSTGRES_URL is the source of truth.
- Ports are checked before use. Conductor reserves ten ports per workspace but never checks they are free. A dev server orphaned from another repo can still hold one, and the Open button would reach the wrong site. run-dev.sh refuses to start on a taken port and prints the owning pid and checkout.
- The process env is pinned. The Run button can hand the script an environment that already carries the root checkout's POSTGRES_URL, and Next.js prefers process env over .env. The dev server would then write to the shared database while the banner claimed the workspace one. lib.sh exports both URLs explicitly.
- .env.local is refused. vercel env pull writes it with the production database URL, and Next.js loads it over .env. Push would then offer to drop production tables. Setup and Run stop if any override file names a different database.
- Prune only drops what setup made. Each workspace DB carries a database comment, and prune-dbs.sh only considers marked databases, so a hand-made worktree's database is never taken for an orphan.

## Push in dev, migrations in CI

Two workspaces changing the schema at once is the real test of a parallel setup. The rule that makes it safe has two halves. Local databases are push-managed: on every pnpm dev, Drizzle diffs the Payload config against the workspace database and applies the difference. Neon, in preview and production, is only ever changed by payload migrate inside the Vercel build. Nothing runs migrations by hand, and push is wired so it cannot reach a remote database.

The catch is in how migrations are generated. payload migrate:create never looks at a database. It diffs the config against the newest snapshot file in src/migrations. That gives one rule for parallel branches: a migration's snapshot must be generated on top of the newest migration on dev at the moment it lands there.

Break it and the failure is delayed and ugly. Workspace A and workspace B both branch from dev, whose newest snapshot is S0. A generates a migration with snapshot S0 plus A's columns; B generates one with S0 plus B's. Both apply cleanly in CI. After both land, the newest snapshot is whichever merged last, and it does not know about the other's columns. The next migrate:create on any branch re-emits them, and the production build dies on column already exists.

So the rule is enforced three times, because each check sees something the others cannot.

[figure] A schema change on its way to production: The pre-push hook sees the branch; the GitHub check sees the merge result; the Vercel build is the only thing that ever writes to Neon.

The pre-push hook is the one that earns its keep. It is an allowlist of schema-owning files, not whole folders, so a change to a block's component or a story never trips it and nobody learns to bypass it. When a push adds a migration, it fetches origin/dev and fails unless the branch holds every migration on dev and its own sort after dev's newest. When schema files changed, it runs the same diff migrate:create would, with no database and no files written, so a field added after the migration was generated is caught before it leaves the machine.

The other side is kept deliberately dull. Only main deploys; a push to dev builds nothing, which saves build minutes and means a release is one fast-forward push that only I make. The build command is three steps, and the first one exists because a preview build once pointed at the wrong database.

## A day in the loop

A working day looks like this. I open a workspace per task and give each one a line: fix the carousel tab position, make capabilities a taxonomy, tune the mask animation speed. Setup runs on its own. The agent builds while I review the previous workspace's preview on its own port, with real content, and Storybook one port up when a component needs isolating. When a task is right, it lands with a rebase and a push to dev, and the workspace is archived. Three to six are open at any time; the limit is my attention, not the machine.

[figure] One task, from a line of text to production: The workspace does the setup and the landing. I do the review and the release.

Parallel only pays off when the tasks are independent, so the commit scopes tell the story better than the count. Since 25 September the work spread across the case-study dial, the scroll reveal system, media on Cloudflare, the composer blocks, posts, site chrome and more, and most of those streams were open on the same days.

[figure] Where the work went since 25 September: Commits by conventional-commit scope. Only scopes with four or more commits are shown.

Content runs through the same loop. This site exposes an MCP server, so an agent in one workspace can draft a post or patch a block against the live CMS while another workspace is changing code. This post was drafted that way, with the charts above built from the repo's own git log.

What it costs, so the picture is honest:

- Each workspace database is about 48 MB. Archiving drops it, and prune-dbs.sh reclaims any that an offline Docker left behind.
- Setup takes about thirty seconds instead of one when the main dev server is connected to payload, because Postgres refuses the template.
- A push to dev deploys nothing. A preview of dev is a manual deployment from the Vercel dashboard, which is one more click than a PR-per-branch flow gives you.
- The guards took longer to write than the scripts, and each one was written after the bug, not before.

The point is not the commit count. It is that a half-finished thought never blocks the next one. A task that would have waited for a free checkout now waits for nothing, and the schema rules mean I can let several of them touch the database at once and still trust the release.

## By the numbers

- **170 commits.** On dev since 25 September 2026, with 23 migrations among them.
- **37 workspaces.** Opened between 3 and 12 October, 14 of them on 7 October.
- **About 1 second.** To clone a workspace database from the main dev DB with CREATE DATABASE TEMPLATE.
- **3 gates.** Pre-push hook, GitHub check on the merge, and the Vercel build as the only writer to Neon.
