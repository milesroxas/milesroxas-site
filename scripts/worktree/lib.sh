#!/usr/bin/env bash
# Shared helpers for the worktree setup / run / prune scripts (docs/worktrees.md).
# Sourced, not executed. Requires: Docker Desktop, pnpm.
#
# They run from the worktree directory, under T3 Code or a plain terminal:
#
#   T3 Code    T3CODE_PROJECT_ROOT (the main checkout) / T3CODE_WORKTREE_PATH
#   Terminal   neither set: the worktree is $PWD and the root is the git
#              main worktree.
#
# No port is handed out: `allocate_port` picks one and setup stores it in the
# worktree's .env as DEV_PORT.

set -euo pipefail

if [ -n "${T3CODE_PROJECT_ROOT:-}" ]; then
  WORKSPACE_HOST="t3"
  ROOT="$T3CODE_PROJECT_ROOT"
  WS_PATH="${T3CODE_WORKTREE_PATH:-$PWD}"
else
  WORKSPACE_HOST="terminal"
  WS_PATH="$PWD"
  # The main worktree owns the shared git dir: its parent is the main checkout.
  ROOT="$(dirname "$(git -C "$WS_PATH" rev-parse --path-format=absolute --git-common-dir)")"
fi
# Only the root's untracked files matter here: .env (copied into each
# worktree) and, optionally, .env.production.pulled.
WS_NAME="$(basename "$WS_PATH")"

MAIN_DB="payload"
DB_HOST="127.0.0.1:54330"
# Same image as docker-compose.yml / scripts/dev-tui/constants.ts — dumping
# production with the container's own pg_dump avoids client/server mismatch.
POSTGRES_IMAGE="pgvector/pgvector:pg17-trixie"
# Vercel-pulled production env in the root (same file/convention as the dev
# TUI). Optional: only needed for `setup.sh --from production`.
PROD_ENV_FILE="$ROOT/.env.production.pulled"

# The main checkout is not a worktree: it keeps its own .env, the shared
# 'payload' DB and port 3000. T3 Code runs project scripts there too (a thread
# in local mode), so every script checks this before touching anything.
is_main_checkout() {
  [ "$(cd "$WS_PATH" && pwd -P)" = "$(cd "$ROOT" && pwd -P)" ]
}

require_root() {
  [ -d "$ROOT" ] || {
    echo "worktree: root checkout '$ROOT' not found." >&2
    exit 1
  }
  if is_main_checkout; then
    echo "worktree: this is the main checkout, not a worktree; it keeps its own .env and DB. Nothing to set up." >&2
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Worktree database identity
#
# Keyed on the worktree DIRECTORY, never on a display or branch name, which can
# change. Once the worktree has a .env, its POSTGRES_URL is the source of
# truth, so setup re-runs and prune agree on one database.
# ---------------------------------------------------------------------------
sanitize_db_name() {
  # Postgres identifiers cap at 63 chars; keep well under it.
  printf 'payload_%s' "$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | cut -c1-40)"
}

# Resolve symlinks so every path to the worktree maps to the same DB.
workspace_dir_name() {
  basename "$(cd "$WS_PATH" && pwd -P)"
}

# Read KEY from a dotenv-style file, stripping optional surrounding quotes.
# `vercel env pull` writes a value stored with a trailing newline as "…\n";
# drop that, and treat its [SENSITIVE] placeholder as unset.
read_env_key() {
  local file="$1" key="$2" line v
  line="$(grep "^${key}=" "$file" 2>/dev/null | tail -n1)" || return 1
  v="${line#*=}"
  v="${v%\"}" v="${v#\"}" v="${v%\'}" v="${v#\'}"
  v="${v%\\n}"
  [ "$v" != "[SENSITIVE]" ] || return 1
  printf '%s' "$v"
}

# DB name from a worktree .env POSTGRES_URL: only a local per-worktree DB
# (payload_*) counts; a URL pointing at the shared 'payload' DB or elsewhere
# means "no worktree DB yet".
db_name_from_env_file() {
  local url db
  url="$(read_env_key "$1" POSTGRES_URL 2>/dev/null || true)"
  case "$url" in
  *"$DB_HOST"/payload_*)
    db="${url##*/}"
    printf '%s' "${db%%\?*}"
    ;;
  *) return 1 ;;
  esac
}

DB_NAME="$(db_name_from_env_file "$WS_PATH/.env" || sanitize_db_name "$(workspace_dir_name)")"

# Next.js loads .env.local (and .env.development.local) OVER .env, so a
# `vercel env pull` run inside a worktree silently re-points POSTGRES_URL at
# Neon production — dev push would then prompt to drop production tables.
# Refuse to continue while any override file names a DB other than this
# worktree's. (Unset keys in those files are fine.)
assert_no_db_override() {
  local f url key
  for f in "$WS_PATH/.env.local" "$WS_PATH/.env.development.local"; do
    [ -f "$f" ] || continue
    for key in POSTGRES_URL DATABASE_URL POSTGRES_URL_NON_POOLING DATABASE_URL_UNPOOLED; do
      url="$(read_env_key "$f" "$key" 2>/dev/null || true)"
      [ -n "$url" ] || continue
      case "$url" in
      *"$DB_HOST/$DB_NAME"|*"$DB_HOST/$DB_NAME?"*) ;;
      *)
        printf 'worktree: %s sets %s to a database other than %s (%s).\n' \
          "$f" "$key" "$DB_NAME" "$(printf '%s' "$url" | sed -E 's#://[^@]*@#://***@#')" >&2
        printf 'worktree: Next.js reads that file over .env. Remove it: mv %s %s.neon-bak\n' "$f" "$f" >&2
        exit 1
        ;;
      esac
    done
  done
}
# The main checkout is not a worktree and owns its override files.
is_main_checkout || assert_no_db_override


# ---------------------------------------------------------------------------
# Ports
#
# An orphaned dev server from an earlier session (any repo) can still hold a
# worktree's stored port, and its URL would reach that project. Refuse to start.
# ---------------------------------------------------------------------------

# "<pid> <cwd>" of whatever listens on TCP port $1; fails when the port is free.
port_owner() {
  local pid cwd
  pid="$(lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -n1 || true)"
  [ -n "$pid" ] || return 1
  cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n1)"
  printf '%s %s' "$pid" "${cwd:-unknown}"
}

assert_port_free() {
  local port="$1" owner pid cwd
  owner="$(port_owner "$port")" || return 0
  pid="${owner%% *}" cwd="${owner#* }"
  echo "worktree: port $port is already taken by pid $pid ($cwd)." >&2
  case "$cwd" in
  "$(cd "$WS_PATH" && pwd -P)"*)
    echo "worktree: that is this worktree's own server; stop it first: kill $pid" >&2
    ;;
  *)
    echo "worktree: it belongs to another checkout, so this worktree will not share it." >&2
    echo "worktree: stop it if it is stale (kill $pid), then start Dev again." >&2
    ;;
  esac
  exit 1
}

# T3 Code hands out no port. Each worktree takes the first even port in
# WORKTREE_PORT_FIRST..LAST (Next on it, Storybook on +1) that no other
# worktree's .env claims as DEV_PORT and nothing listens on, and setup stores
# it, so a worktree keeps its port across restarts. The range is this repo's
# in the machine registry (registry.md in the global worktree setup skill).
WORKTREE_PORT_FIRST=3300
WORKTREE_PORT_LAST=3398

# DEV_PORT values every other worktree of this repo has claimed.
claimed_worktree_ports() {
  local wt real_ws
  real_ws="$(cd "$WS_PATH" && pwd -P)"
  git -C "$WS_PATH" worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p' |
    while IFS= read -r wt; do
      [ -d "$wt" ] || continue
      [ "$(cd "$wt" && pwd -P)" = "$real_ws" ] && continue
      read_env_key "$wt/.env" DEV_PORT 2>/dev/null || true
      echo
    done
}

allocate_port() {
  local claimed port
  claimed=" $(claimed_worktree_ports | tr '\n' ' ') "
  for ((port = WORKTREE_PORT_FIRST; port <= WORKTREE_PORT_LAST; port += 2)); do
    case "$claimed" in *" $port "*) continue ;; esac
    port_owner "$port" >/dev/null && continue
    port_owner "$((port + 1))" >/dev/null && continue
    printf '%s' "$port"
    return 0
  done
  echo "worktree: no free port pair in $WORKTREE_PORT_FIRST-$WORKTREE_PORT_LAST" >&2
  return 1
}

# This checkout's port: the main checkout's 3000, the one setup stored for
# the worktree, else the next free pair (setup stores it).
if is_main_checkout; then
  PORT=3000
else
  PORT="$(read_env_key "$WS_PATH/.env" DEV_PORT 2>/dev/null || true)"
  [ -n "$PORT" ] || PORT="$(allocate_port)"
fi

# A launcher can hand the script a process env that already contains
# POSTGRES_URL from the main checkout's .env, and Next.js lets the process env
# win over the worktree .env: the dev server then silently uses the shared
# 'payload' DB. Pin both the DB URL and the public URL in the process env.
if ! is_main_checkout; then
  export POSTGRES_URL="postgresql://postgres@$DB_HOST/$DB_NAME"
  export NEXT_PUBLIC_SERVER_URL="http://localhost:$PORT"
fi

# ---------------------------------------------------------------------------
# Postgres (one shared container, one DB per worktree)
# ---------------------------------------------------------------------------

# docker-compose.yml pins `name: milesroxas`, so compose from any checkout
# addresses the same container/volume. Use the worktree's own compose file:
# it matches the code being run.
compose() {
  docker compose --project-directory "$WS_PATH" "$@"
}

psql_c() {
  compose exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -q "$@"
}

postgres_running() {
  [ -n "$(compose ps -q --status running postgres 2>/dev/null)" ]
}

# 54330 must be this repo's container (compose project `milesroxas`), never
# sas-site's (54320) or anything else: the app connects by port, not by name.
assert_db_port_ours() {
  local port="${DB_HOST##*:}" project owner
  project="$(docker ps --filter "publish=$port" --format '{{.Label "com.docker.compose.project"}}' | head -n1)"
  if [ -n "$project" ]; then
    [ "$project" = milesroxas ] && return 0
    echo "worktree: port $port is published by docker project '$project', not 'milesroxas'." >&2
    exit 1
  fi
  if owner="$(port_owner "$port")"; then
    echo "worktree: port $port is held by pid ${owner%% *} (${owner#* }), not the milesroxas postgres container." >&2
    exit 1
  fi
}

ensure_postgres() {
  if ! docker info >/dev/null 2>&1; then
    echo "worktree: Docker is not running — start Docker Desktop first." >&2
    exit 1
  fi
  # `up` only when nothing is running: `docker compose up` re-creates a running
  # container whenever the rendered config differs from the one it was started
  # with (e.g. compose.yml changed on this branch), which drops every other
  # worktree's DB connections mid-request.
  if ! postgres_running; then
    assert_db_port_ours
    compose up -d postgres
  fi
  assert_db_port_ours
  local i=0
  until compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then
      echo "worktree: postgres did not become healthy within 60s" >&2
      exit 1
    fi
    sleep 1
  done
}

db_exists() {
  [ "$(psql_c -tAc "SELECT 1 FROM pg_database WHERE datname='$1'")" = "1" ]
}

# Hard guard for every DROP in these scripts: only payload_<worktree>
# databases, never the shared 'payload' dev DB.
assert_workspace_db_name() {
  case "$1" in
  payload_?*) ;;
  *)
    echo "worktree: refusing to touch database '$1' (not a worktree DB)" >&2
    return 1
    ;;
  esac
}

drop_workspace_db() {
  assert_workspace_db_name "$1"
  psql_c -c "DROP DATABASE IF EXISTS \"$1\" WITH (FORCE)"
}

# prune-dbs.sh drops only databases carrying one of these comments, so a
# hand-made DB (payload_x) is never taken for an orphan. CREATE DATABASE …
# TEMPLATE does not copy comments. Setup writes the first; DBs made before
# 2026-11-27 carry the second until their next run re-marks them.
WORKSPACE_DB_MARK="worktree"
LEGACY_WORKSPACE_DB_MARK="conductor-workspace"

mark_workspace_db() {
  psql_c -c "COMMENT ON DATABASE \"$1\" IS '$WORKSPACE_DB_MARK'"
}

# Clone the main dev DB ('payload' — itself a production restore, see MIGRATIONS.md
# "Reset local database") into the worktree DB.
# Fast path: CREATE DATABASE … TEMPLATE copies files in ~1s but needs no other
# session on the template, which fails whenever a dev server is running against
# 'payload' — then fall back to dump | restore.
clone_local_db() {
  if psql_c -c "CREATE DATABASE \"$DB_NAME\" TEMPLATE \"$MAIN_DB\"" 2>/dev/null; then
    return 0
  fi
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  compose exec -T postgres pg_dump -U postgres --no-owner --no-acl "$MAIN_DB" |
    psql_c -d "$DB_NAME" >/dev/null
}

# Pull production env from Vercel into the main checkout if missing.
# Never refreshes an existing file (repo convention — see MIGRATIONS.md).
ensure_production_env() {
  require_root
  if [ -f "$PROD_ENV_FILE" ]; then
    return 0
  fi
  if ! command -v vercel >/dev/null 2>&1; then
    echo "worktree: vercel CLI not found (npm i -g vercel) — cannot pull production env" >&2
    return 1
  fi
  echo "worktree: pulling Vercel production env → $PROD_ENV_FILE"
  (cd "$ROOT" && vercel env pull .env.production.pulled --environment=production --yes)
}

# pg_dump production straight into the worktree DB. Prefers a direct URL
# (PgBouncer breaks pg_dump): the non-pooling vars, else the pooled Neon host
# with `-pooler` removed. PG17+ pg_dump emits `SET transaction_timeout`
# which older servers reject on restore — strip it (mirrors dev-tui pg-tools).
seed_db_from_production() {
  local dump_url
  dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL_NON_POOLING || true)"
  [ -n "$dump_url" ] || dump_url="$(read_env_key "$PROD_ENV_FILE" DATABASE_URL_UNPOOLED || true)"
  [ -n "$dump_url" ] ||
    dump_url="$(read_env_key "$PROD_ENV_FILE" POSTGRES_URL | sed -E 's#@(ep-[^.]+)-pooler\.#@\1.#' || true)"
  if [ -z "$dump_url" ]; then
    echo "worktree: no POSTGRES_URL in $PROD_ENV_FILE — re-pull production env" >&2
    return 1
  fi
  echo "worktree: dumping production content into $DB_NAME (this can take a minute)"
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  docker run --rm "$POSTGRES_IMAGE" pg_dump "$dump_url" --no-owner --no-acl |
    sed '/^[[:space:]]*SET transaction_timeout/d' |
    psql_c -d "$DB_NAME" >/dev/null
}

# Create the worktree DB if missing. $1 = local (default) | production.
#   local      — clone of the main dev DB: fast, offline, prod-equivalent content.
#   production — pg_dump straight from Neon (needs .env.production.pulled in the
#                main checkout, or a logged-in vercel CLI); falls back to local.
# Sets WORKSPACE_DB_SOURCE = existing | local | production | empty.
ensure_workspace_db() {
  create_workspace_db "${1:-local}"
  mark_workspace_db "$DB_NAME"
}

create_workspace_db() {
  local from="$1"
  WORKSPACE_DB_SOURCE="existing"
  if db_exists "$DB_NAME"; then
    return 0
  fi
  assert_workspace_db_name "$DB_NAME"
  echo "worktree: creating database $DB_NAME"

  if [ "$from" = "production" ]; then
    if ensure_production_env && seed_db_from_production; then
      WORKSPACE_DB_SOURCE="production"
      echo "worktree: $DB_NAME seeded from production"
      return 0
    fi
    echo "worktree: production seed unavailable — falling back to a clone of '$MAIN_DB'" >&2
    # A failed restore may be partial; start over clean.
    drop_workspace_db "$DB_NAME"
  fi

  if db_exists "$MAIN_DB"; then
    if clone_local_db; then
      WORKSPACE_DB_SOURCE="local"
      echo "worktree: $DB_NAME cloned from '$MAIN_DB'"
      return 0
    fi
    drop_workspace_db "$DB_NAME"
    echo "worktree: clone of '$MAIN_DB' into $DB_NAME failed" >&2
    exit 1
  fi

  # Nothing to copy from — empty DB; drizzle push builds the schema on first Run.
  # The image's initdb script enables pgvector only in 'payload'; Ask's
  # ask_embeddings table needs it before push.
  psql_c -c "CREATE DATABASE \"$DB_NAME\""
  psql_c -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector"
  WORKSPACE_DB_SOURCE="empty"
  echo "worktree: $DB_NAME created empty ('$MAIN_DB' does not exist yet)"
}

# Upsert KEY=VALUE in the worktree .env (BSD sed — macOS). Delete-then-append
# so values with sed metacharacters (&, |, \ — e.g. secrets) survive intact.
set_env() {
  local key="$1" value="$2"
  sed -i '' "/^${key}=/d" .env
  printf '%s=%s\n' "$key" "$value" >>.env
}
