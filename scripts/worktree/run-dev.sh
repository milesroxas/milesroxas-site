#!/usr/bin/env bash
# Dev script (T3 Code): Next dev on this worktree's port.
# Re-ensures postgres + the worktree DB so Dev works after a reboot or db:reset.
# In the main checkout (a T3 thread in local mode) it is plain `pnpm dev`.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

if is_main_checkout; then
  exec pnpm dev
fi

if [ ! -f .env ]; then
  echo "worktree: no .env in this worktree — run the setup script first (bash scripts/worktree/setup.sh)" >&2
  exit 1
fi

assert_port_free "$PORT"
ensure_postgres
ensure_workspace_db
echo "worktree: $WS_NAME → http://localhost:$PORT (db $DB_NAME)"

# Mirrors package.json `dev` but with the worktree port instead of 3000.
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation next dev --turbopack -p "$PORT"
