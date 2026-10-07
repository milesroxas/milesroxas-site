import fs from 'node:fs'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { cmsTarget } from './cms-target'

/**
 * Turns every inverted Section band in Works into a neutral one. Only the
 * Section block's `theme` changes: each section is saved with `patchBlock`,
 * which merges the one field into the stored block, and each work is read
 * again afterwards and compared with what it was.
 *
 * Talks to the site's MCP server with the MCP key (`cms-target.ts`). Plain
 * REST is behind the Vercel firewall challenge in production; `/api/mcp` is
 * not. The saves run the deployed site's hooks, so its pages revalidate.
 *
 *   pnpm exec tsx --env-file=.env scripts/neutralize-inverted-sections.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/neutralize-inverted-sections.ts
 *   pnpm exec tsx --env-file=.env scripts/neutralize-inverted-sections.ts --restore scripts/snapshots/<file>.json
 *   ... --local   (a local dev server, see cms-target.ts)
 *
 * A published work stays published, a never-published one is saved as a
 * draft. A work with an unpublished draft on top of its live version is
 * skipped: publishing the fix would publish that draft too.
 */

type Block = { id: string; blockType: string; theme?: string | null; [key: string]: unknown }
type Work = {
  id: number
  slug?: string | null
  _status?: 'draft' | 'published' | null
  layout?: Block[] | null
  [key: string]: unknown
}
type Change = { blockId: string; from: string; to: string }
/** `before` is the whole work as read, kept in case the theme reversal alone is not enough. */
type SnapshotEntry = {
  id: number
  slug: string | null
  draft: boolean
  changes: Change[]
  before: Work
}

function fail(message: string): never {
  console.error(`neutralize-inverted-sections: ${message}`)
  process.exit(1)
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const restoreIndex = args.indexOf('--restore')
const restoreFile = restoreIndex === -1 ? null : args[restoreIndex + 1]
if (restoreIndex !== -1 && !restoreFile) fail('--restore needs a snapshot file')

const target = cmsTarget({ local: args.includes('--local') })
if (typeof target === 'string') fail(target)
const { headers, key, server } = target

let requestId = 0

/** One MCP tool call over stateless Streamable HTTP; returns the tool's text. */
async function callTool(name: string, toolArgs: Record<string, unknown>): Promise<string> {
  const response = await fetch(`${server}/api/mcp`, {
    method: 'POST',
    headers: {
      ...headers,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++requestId,
      method: 'tools/call',
      params: { name, arguments: toolArgs },
    }),
  })
  const raw = await response.text()
  if (!response.ok) throw new Error(`${name}: ${response.status} ${raw.slice(0, 200)}`)
  const json = raw.startsWith('{') ? raw : raw.match(/^data: (.*)$/m)?.[1]
  const message = JSON.parse(json ?? 'null') as {
    result?: { content?: { text?: string }[]; isError?: boolean }
    error?: { message: string }
  } | null
  const text = message?.result?.content?.map((part) => part.text ?? '').join('') ?? ''
  if (message?.error || message?.result?.isError || /^(Error|❌)/.test(text)) {
    throw new Error(`${name}: ${message?.error?.message ?? text}`)
  }
  return text
}

async function listWorks(): Promise<Work[]> {
  const works: Work[] = []
  for (let page = 1; ; page++) {
    const text = await callTool('findWorks', { draft: true, depth: 0, limit: 100, page })
    for (const match of text.matchAll(/```json\n(.*)\n```/g)) works.push(JSON.parse(match[1]))
    const [, current, total] = text.match(/Page: (\d+) of (\d+)/) ?? []
    if (!total || Number(current) >= Number(total)) return works
  }
}

async function readWork(id: number, draft: boolean): Promise<Work> {
  const text = await callTool('findWorks', { id, draft, depth: 0 })
  return JSON.parse(text.slice(text.indexOf('{')))
}

const label = (work: Pick<Work, 'id' | 'slug'>) => `works/${work.slug || work.id}`

const inverted = (layout: Block[] | null | undefined) =>
  (layout ?? []).filter((block) => block.blockType === 'section' && block.theme === 'inverted')

/** Paths where two reads of a work differ, ignoring the save timestamp. */
function differences(before: unknown, after: unknown, at = ''): string[] {
  if (isDeepStrictEqual(before, after)) return []
  const isObject = (value: unknown) => typeof value === 'object' && value !== null
  if (!isObject(before) || !isObject(after) || Array.isArray(before) !== Array.isArray(after)) {
    return [at || '(root)']
  }
  const a = before as Record<string, unknown>
  const b = after as Record<string, unknown>
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((name) => !(at === '' && name === 'updatedAt'))
    .flatMap((name) => differences(a[name], b[name], at ? `${at}.${name}` : name))
}

/**
 * Applies each change with patchBlock, then reads the work back and checks it
 * equals the work as it was with only those themes moved.
 */
async function apply(work: Work, changes: Change[], draft: boolean): Promise<boolean> {
  for (const { blockId, to } of changes) {
    await callTool('patchBlock', {
      collection: 'works',
      id: work.id,
      blockId,
      patch: { theme: to },
      draft,
    })
  }
  const themes = new Map(changes.map((change) => [change.blockId, change.to]))
  const expected = {
    ...work,
    layout: (work.layout ?? []).map((block) =>
      themes.has(block.id) ? { ...block, theme: themes.get(block.id) } : block,
    ),
  }
  const changed = differences(expected, await readWork(work.id, true))
  if (changed.length)
    console.error(`  ✗ ${label(work)}: unexpected change at ${changed.join(', ')}`)
  return changed.length === 0
}

async function restore(file: string) {
  const entries = JSON.parse(fs.readFileSync(file, 'utf8')) as SnapshotEntry[]
  let failed = 0
  for (const entry of entries) {
    const work = await readWork(entry.id, true)
    const back = entry.changes.map(({ blockId, from, to }) => ({ blockId, from: to, to: from }))
    const ok = await apply(work, back, entry.draft)
    console.log(`${ok ? '✓' : '✗'} restored ${label(entry)}`)
    if (!ok) failed += 1
  }
  if (failed) fail(`${failed} did not restore cleanly`)
}

type Planned = { work: Work; draft: boolean; changes: Change[] }

/** What a work needs, or null when it has nothing inverted or must be skipped. */
async function plan(latest: Work): Promise<Planned | null> {
  const sections = inverted(latest.layout)
  const stored = latest._status === 'draft' && (await readWork(latest.id, false))
  const live = stored ? inverted(stored.layout) : sections
  if (!sections.length && !live.length) return null
  if (stored && stored._status === 'published') {
    console.log(
      `skip ${label(latest)}: unpublished draft on top (live ${live.length}, draft ${sections.length} inverted)`,
    )
    return null
  }
  const hidden = sections.filter((block) => !block.customize).length
  console.log(
    `${label(latest)}: ${sections.length} inverted` +
      `${hidden ? ` (${hidden} with Customize off)` : ''}${stored ? ' [draft]' : ''}`,
  )
  return {
    work: latest,
    draft: Boolean(stored),
    changes: sections.map((block) => ({ blockId: block.id, from: 'inverted', to: 'neutral' })),
  }
}

async function run() {
  console.log(`Target: ${server}${dryRun ? ' (dry run)' : ''}`)
  const planned: Planned[] = []
  for (const work of await listWorks()) {
    const entry = await plan(work)
    if (entry) planned.push(entry)
  }
  if (!planned.length) return console.log('Nothing to change.')
  if (dryRun) return

  const snapshot: SnapshotEntry[] = planned.map(({ work, draft, changes }) => ({
    id: work.id,
    slug: work.slug ?? null,
    draft,
    changes,
    before: work,
  }))
  const dir = path.join(process.cwd(), 'scripts/snapshots')
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.relative(process.cwd(), path.join(dir, `neutralize-inverted-${stamp}.json`))
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2))
  console.log(`Snapshot: ${file}`)

  let failed = 0
  for (const { work, draft, changes } of planned) {
    const ok = await apply(work, changes, draft)
    if (ok) console.log(`✓ ${label(work)}: ${changes.length} → neutral`)
    else failed += 1
  }
  if (failed) fail(`${failed} work(s) changed beyond the themes: --restore ${file}`)
}

await (restoreFile ? restore(restoreFile) : run()).catch((error: Error) => fail(error.message))
