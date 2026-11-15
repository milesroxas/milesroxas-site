# Animation plans

Written by the `improve-animations` advisor. Each plan is self-contained: hand
it to any agent (`improve-animations execute plans/<file>`), or work through
it by hand.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Turn a tab swap around with a fresh forward leg](001-tab-return-turns-forward.md) | HIGH | DONE |

## Order and dependencies

1. **001** stands alone.

## Tools

- `tools/tab-swap-probe.mjs`: logs the tab panels frame by frame in
  Storybook (`pnpm storybook` first). Usage:
  `node plans/tools/tab-swap-probe.mjs <chromium|webkit> <story> <back|late|three|revisit>`,
  where `<story>` is the Storybook story id suffix (`default`, `video`, ...).
