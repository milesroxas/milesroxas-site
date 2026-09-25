#!/usr/bin/env bash
#
# Vercel Ignored Build Step (vercel.json `ignoreCommand`).
#
# Skips the build when every file changed since the last successful deployment
# on this branch is one the deployed site never reads: docs, agent/editor
# config, tests, stories, local tooling. A docs-only push to main otherwise
# costs a full `pnpm ci` (migrate + next build) and ships an identical site.
#
# Exit codes are Vercel's contract, and they read backwards:
#   exit 0 -> skip the build (deployment is marked CANCELED)
#   exit 1 -> build
#
# Everything here fails open. The only path to a skip is the explicit `exit 0`
# at the bottom; an unknown file, a missing base commit, or any error builds.
#
# Matching is a denylist of inert paths, not an allowlist of source paths, so a
# new top-level file or folder builds until someone decides it is inert.
#
# The diff base is VERCEL_GIT_PREVIOUS_SHA (last successful deployment for this
# project and branch), not HEAD^: a push can carry several commits, and a
# skipped build does not move that SHA, so skipped commits stay in the next
# diff until something actually builds.
#
# Runs before install: no node_modules, no tsx. Vercel clones with --depth=10,
# so a base more than ten commits back is absent and the build proceeds.
#
# Try it locally:
#   VERCEL_GIT_PREVIOUS_SHA=<sha> bash scripts/vercel-ignore-build.sh; echo $?
#
# When you add a path the build never reads, add it to INERT_RES below.
#
set -uo pipefail

build() {
  echo "vercel-ignore-build: building ($1)"
  exit 1
}

# Paths the deployed site never reads. Anchored regexes against repo-relative
# paths from `git diff --name-only`.
INERT_RES=(
  # Docs and agent/editor instructions.
  '^docs/'
  '^README\.md$'
  '^MIGRATIONS\.md$'
  '^WORKFLOW\.md$'
  '^CLAUDE\.md$'
  '^\.claude/'
  '^\.cursor/'
  '^\.conductor/'
  '^\.vscode/'
  # Repo plumbing that Vercel does not run.
  '^\.githooks/'
  '^\.gitignore$'
  '^\.editorconfig$'
  '^\.env\.example$'
  # Local dev environment.
  '^docker-compose\.yml$'
  '^scripts/dev-tui/'
  # Lint, test and Storybook tooling.
  '^biome\.json$'
  '^\.biomeignore$'
  '^\.prettierignore$'
  '^\.storybook/'
  '^vitest\.config\.ts$'
  # Inside src: stories, tests and READMEs. Nothing in the app imports them.
  '^src/.*\.stories\.tsx?$'
  '^src/.*\.(test|spec)\.tsx?$'
  '^src/.*\.md$'
)

base="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [[ -z "$base" ]]; then
  build "no previous successful deployment on this branch"
fi

if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  build "base ${base} is outside the shallow clone"
fi

# --no-renames lists both sides of a move, so moving a file out of src into
# docs still shows the src path and builds.
if ! changed="$(git diff --name-only --no-renames "$base" HEAD)"; then
  build "git diff failed"
fi

# Same commit as the last deployment: a manual redeploy (env var change, cache
# bust). Someone asked for this build.
if [[ -z "$changed" ]]; then
  build "no diff against ${base}, treating as a deliberate redeploy"
fi

while IFS= read -r file; do
  inert=0
  for re in "${INERT_RES[@]}"; do
    if [[ "$file" =~ $re ]]; then
      inert=1
      break
    fi
  done
  if [[ "$inert" -eq 0 ]]; then
    build "$file"
  fi
done <<<"$changed"

echo "vercel-ignore-build: skipping, only inert paths changed since ${base}:"
echo "$changed"
exit 0
