import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Repository root (parent of `scripts/`) */
export const PROJECT_ROOT = path.resolve(__dirname, '../..')

/**
 * Pinned Postgres image (server + bundled client tools). Same major as Neon
 * production (17), so pg_dump matches the server and drizzle-kit reads the
 * local catalog the way it reads production's.
 * Keep in sync with `docker-compose.yml` and `.conductor/lib.sh`.
 */
export const POSTGRES_DOCKER_IMAGE = 'postgres:17'

export const LOCAL_POSTGRES_DB = 'postgresql://postgres@127.0.0.1:54330/payload'

/**
 * File written by “Pull Vercel production env”. Deliberately NOT a name Next.js
 * auto-loads (`.env.production.local` would be picked up by `next build`/`start`
 * and point local prod-style runs at the production DB). Only the TUI reads it.
 */
export const VERCEL_PULL_ENV_FILE = '.env.production.pulled'
export const SNAPSHOT_REL_DIR = '.dev-tui'
/** Directory-format archive (`pg_dump -Fd -j`) — see scripts/dev-tui/pg-tools.ts. */
export const SNAPSHOT_DIR = 'snapshot.pgdir'
/** Custom-format archive (`pg_dump -Fc`); the local backup is small enough to stay one file. */
export const LOCAL_BACKUP_FILE = 'local-backup.dump'

/**
 * Where the snapshot lands inside the Postgres container. `pg_restore -j` needs
 * a seekable archive, so the dump is copied in rather than piped over stdin.
 */
export const CONTAINER_RESTORE_PATH = '/tmp/milesroxas-dev-tui-restore'

/**
 * Parallel `pg_dump` / `pg_restore` jobs.
 *
 * Same values as sas-site, where they were measured (2026-09-01): a WAN dump is
 * dominated by pg_dump's per-object catalog round-trips, so parallel jobs hide
 * the data phase behind that floor. This schema is far smaller, so the dump is
 * quick either way; restore is never the bottleneck.
 */
export const DUMP_JOBS = 4
export const RESTORE_JOBS = 4
