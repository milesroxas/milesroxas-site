#!/usr/bin/env bash
# Worktree setup (docs/worktrees.md). Runs from the worktree directory after
# T3 Code creates it (the project's "Setup worktree" script). Leaves the
# worktree ready for Dev with zero manual steps. Idempotent: re-running
# refreshes .env from the main checkout and keeps the worktree's DB and port.
# Refuses to run in the main checkout.
#
#   bash scripts/worktree/setup.sh                      # normal (T3 Code calls this)
#   bash scripts/worktree/setup.sh --reseed             # drop + recreate the worktree DB from 'payload'
#   bash scripts/worktree/setup.sh --reseed --from production   # … from a Neon production dump
set -euo pipefail
source "$(dirname "$0")/lib.sh"
require_root

RESEED=0
FROM="local"
while [ $# -gt 0 ]; do
  case "$1" in
  --reseed) RESEED=1 ;;
  --from)
    FROM="${2:-}"
    shift
    ;;
  *)
    echo "usage: setup.sh [--reseed] [--from local|production]" >&2
    exit 2
    ;;
  esac
  shift
done
case "$FROM" in local | production) ;; *)
  echo "worktree: --from must be local or production" >&2
  exit 2
  ;;
esac

echo "worktree: setting up '$WS_NAME' via $WORKSPACE_HOST (port $PORT, db $DB_NAME)"

# 1. Environment — copy the real .env from the main checkout (never pulled:
#    its branch is Miles's to move), then point this worktree at its own port
#    and database. Re-runs pick up rotated secrets
#    but keep the DB this worktree already owns (DB_NAME came from .env).
if [ ! -f "$ROOT/.env" ]; then
  echo "worktree: $ROOT/.env not found. Create it first (see .env.example)." >&2
  exit 1
fi
cp "$ROOT/.env" .env
set_env POSTGRES_URL "postgresql://postgres@$DB_HOST/$DB_NAME"
set_env NEXT_PUBLIC_SERVER_URL "http://localhost:$PORT"
# The worktree keeps this port (lib.sh reads DEV_PORT before allocating).
set_env DEV_PORT "$PORT"

# 2. Dependencies — pnpm store is shared machine-wide, so this is mostly
#    linking. Also wires .githooks via the `prepare` script.
pnpm install

# 3. Database — shared container, isolated per-worktree DB.
ensure_postgres
if [ "$RESEED" = 1 ] && db_exists "$DB_NAME"; then
  echo "worktree: --reseed — dropping $DB_NAME"
  drop_workspace_db "$DB_NAME"
fi
ensure_workspace_db "$FROM"

# 4. A production dump's encrypted fields (API keys etc.) only decrypt with
#    production's PAYLOAD_SECRET — mirror the dev TUI. A local clone shares the
#    main checkout's .env secret already.
if [ "${WORKSPACE_DB_SOURCE:-}" = "production" ]; then
  prod_secret="$(read_env_key "$PROD_ENV_FILE" PAYLOAD_SECRET || true)"
  if [ -n "$prod_secret" ]; then
    set_env PAYLOAD_SECRET "$prod_secret"
    echo "worktree: PAYLOAD_SECRET set from production env (encrypted fields decrypt)"
  fi
fi

echo "worktree: setup complete (db $DB_NAME, source: ${WORKSPACE_DB_SOURCE:-unknown}) — dev server will run at http://localhost:$PORT"
