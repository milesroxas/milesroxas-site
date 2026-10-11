#!/bin/bash
# Claude Code cloud sessions: install dependencies and a local .env so lint,
# unit tests and the pre-push checks run. Local machines are left alone.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# pnpm self-switches to the pinned 10.28.0 (package.json#packageManager).
pnpm install

# Scripts run with `tsx --env-file=.env` (check:migrations:drift in the pre-push
# hook). Local Docker Postgres only, never Neon; .env is gitignored. The blob
# token is a placeholder: without one the storage plugin drops media's
# `_objectKey` field and the drift check reports a false DROP COLUMN.
if [ ! -f .env ]; then
  sed -e "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$(openssl rand -hex 32)/" \
    -e 's/^BLOB_READ_WRITE_TOKEN=.*/BLOB_READ_WRITE_TOKEN=vercel_blob_rw_cloudsession_placeholder/' \
    .env.example > .env
fi

# Storybook tests: use the container's Chromium rather than downloading the
# build the pinned Playwright expects (vitest.config.ts reads this).
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
