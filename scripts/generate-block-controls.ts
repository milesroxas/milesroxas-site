/**
 * `pnpm generate:block-controls` writes the Storybook control manifest
 * (`src/stories/block-controls/manifest.generated.json`) from the layout
 * block configs, so a story's controls carry the options, labels, defaults
 * and conditions the CMS editor does. `--check` fails when the committed
 * file is stale.
 *
 * Runs in Node, not in a story: the block configs import Payload's
 * server-only editor code, which the Storybook bundle cannot carry.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { Block } from 'payload'
import { pageLayoutBlocks, postLayoutBlocks, workLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { blockControlsManifest } from '@/stories/block-controls/manifest'

const OUTPUT = 'src/stories/block-controls/manifest.generated.json'

// One entry per slug: the Section instances differ only by interface name.
const blocks = new Map<string, Block>()
for (const block of [...pageLayoutBlocks, ...workLayoutBlocks, ...postLayoutBlocks]) {
  if (!blocks.has(block.slug)) blocks.set(block.slug, block)
}
const sorted = [...blocks.values()].sort((a, b) => a.slug.localeCompare(b.slug))
const next = `${JSON.stringify(blockControlsManifest(sorted), null, 2)}\n`

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(OUTPUT, 'utf8')
  } catch {
    // Missing file: stale by definition.
  }
  if (current !== next) {
    console.error(
      `${OUTPUT} is out of date with the block configs. Run: pnpm generate:block-controls`,
    )
    process.exit(1)
  }
  console.log(`${OUTPUT} matches the block configs.`)
} else {
  writeFileSync(OUTPUT, next)
  console.log(`Wrote ${OUTPUT} (${sorted.length} blocks).`)
}
