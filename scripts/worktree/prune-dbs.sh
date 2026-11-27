#!/usr/bin/env bash
# Drop worktree databases that no live worktree references. T3 Code has no
# hook when it removes a worktree, so this is how its DBs are reclaimed. Only
# databases setup marked as worktree DBs (lib.sh WORKSPACE_DB_MARK, or the
# legacy mark) are candidates; a hand-made payload_x is never touched.
#
#   bash scripts/worktree/prune-dbs.sh          # dry run — lists what would be dropped
#   bash scripts/worktree/prune-dbs.sh --yes    # drop them
#
# Run from any worktree or the main checkout. A DB is live when T3 Code's
# worktrees dir or any git worktree of this checkout points at it.
# Extra dirs: WORKSPACES_DIRS="dir1 dir2".
set -euo pipefail
source "$(dirname "$0")/lib.sh"

YES=0
[ "${1:-}" = "--yes" ] && YES=1

REPO="$(basename "$(cd "$ROOT" && pwd -P)")"
candidates=()
for parent in "$HOME/.t3/worktrees/$REPO" ${WORKSPACES_DIRS:-}; do
  [ -d "$parent" ] || continue
  for d in "$parent"/*/; do
    [ -d "$d" ] && candidates+=("$d")
  done
done
while IFS= read -r wt; do
  [ -d "$wt" ] && candidates+=("$wt")
done < <(git -C "$WS_PATH" worktree list --porcelain 2>/dev/null | sed -n 's/^worktree //p')

ensure_postgres

# Live = every DB a candidate directory (symlinks resolved) points at via its
# .env, plus the name setup would derive for a directory that has no .env yet.
live=" "
for d in "${candidates[@]}"; do
  real="$(cd "$d" && pwd -P)"
  name="$(db_name_from_env_file "$real/.env" || sanitize_db_name "$(basename "$real")")"
  live="$live$name "
done

orphans=()
while IFS= read -r db; do
  [ -n "$db" ] || continue
  case "$live" in *" $db "*) continue ;; esac
  orphans+=("$db")
done < <(psql_c -tAc "SELECT datname FROM pg_database WHERE datname LIKE 'payload\\_%'
  AND shobj_description(oid, 'pg_database') IN ('$WORKSPACE_DB_MARK', '$LEGACY_WORKSPACE_DB_MARK') ORDER BY 1")

if [ "${#orphans[@]}" -eq 0 ]; then
  echo "worktree: no orphan worktree databases (${#candidates[@]} live directories checked)"
  exit 0
fi

echo "worktree: orphan worktree databases (no worktree references them):"
for db in "${orphans[@]}"; do
  size="$(psql_c -tAc "SELECT pg_size_pretty(pg_database_size('$db'))")"
  printf '  %-45s %s\n' "$db" "$size"
done

if [ "$YES" != 1 ]; then
  echo "worktree: dry run — re-run with --yes to drop them"
  exit 0
fi

for db in "${orphans[@]}"; do
  echo "worktree: dropping $db"
  drop_workspace_db "$db"
done
