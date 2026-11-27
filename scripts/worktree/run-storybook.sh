#!/usr/bin/env bash
# Storybook script (T3 Code): Storybook on the worktree's DEV_PORT + 1.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

assert_port_free "$((PORT + 1))"
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation storybook dev -p "$((PORT + 1))" --no-open
