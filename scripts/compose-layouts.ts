/**
 * Phase 6 of docs/composer-roadmap.md: move every legacy block onto the
 * sas-site run, grouped into Sections, with no re-authoring in admin (D15).
 * Rules live in `scripts/composer/rules.ts`, per-block exceptions in
 * `scripts/composer/overrides.ts`.
 *
 * Works and Pages: `layout` is transformed. Posts: `content` is split into
 * Sections at every h2 and written to `layout`; `content` is untouched and
 * the route renders `layout` after it (hide the body by clearing it later).
 *
 * Usage (local Docker DB):
 *   pnpm exec tsx --env-file=.env scripts/compose-layouts.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/compose-layouts.ts            # drafts
 *   pnpm exec tsx --env-file=.env scripts/compose-layouts.ts --publish  # publish those drafts
 *   pnpm exec tsx --env-file=.env scripts/compose-layouts.ts --restore scripts/snapshots/<file>.json
 *   ... --only works/<slug>
 *
 * Against production: take a Neon backup first, then run with
 * `--env-file=.env.production.pulled`, `PAYLOAD_DB_PUSH=false` and
 * `--production`, and only once Phases 3 and 4 are deployed there (the target
 * tables must exist). Against the Neon preview branch: pull the Preview env
 * for `dev` (`vercel env pull <file> --environment=preview --git-branch=dev`)
 * and pass `--preview`. Without either flag the script refuses any database
 * but the local Docker one.
 *
 * A write run converts the latest version of each document (a pending draft
 * included, which the report flags) and saves the result as a draft, so the
 * site keeps rendering the published legacy layout until `--publish`.
 * Revalidation is skipped: redeploy after publishing.
 */
import fs from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { OVERRIDES } from './composer/overrides'
import { checkPreservation } from './composer/preserve'
import { type Block, isConvertible, type MediaInfo } from './composer/rules'
import { describeLayout, transformLayout, transformPostContent } from './composer/transform'

type Collection = 'works' | 'pages' | 'posts'

const COLLECTIONS: Collection[] = ['works', 'pages', 'posts']

type Doc = {
  id: number
  slug?: string | null
  _status?: 'draft' | 'published' | null
  layout?: Block[] | null
  content?: unknown
  updatedAt?: string
}

/**
 * What a document was before the run, whole: the published version as the
 * site served it, and the latest draft when it differs (a pending draft, or a
 * document never published). `--publish` can ship a pending draft, so the
 * layout alone could not put a document back.
 */
type SnapshotEntry = {
  collection: Collection
  id: number
  slug: string | null
  published: Record<string, unknown> | null
  draft: Record<string, unknown> | null
}

/** A read document as update data: no id, no timestamps. */
const writable = (doc: Record<string, unknown>) => {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = doc
  return data
}

/** The ids of a layout's blocks, top level and nested, for comparing two reads. */
const blockIds = (layout: unknown): string =>
  JSON.stringify(
    ((layout as Block[] | null | undefined) ?? []).map((block) => [
      block.id,
      ((block.blocks as Block[] | undefined) ?? []).map((child) => child.id),
    ]),
  )

const context = { disableRevalidate: true }

const arg = (name: string): string | null => {
  const index = process.argv.indexOf(name)
  if (index === -1) return null
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} needs a value`)
  return value
}

const label = (collection: string, doc: Pick<Doc, 'id' | 'slug'>) =>
  `${collection}/${doc.slug || doc.id}`

/** Width and height of every media document a layout points at. */
async function mediaInfo(payload: Payload): Promise<MediaInfo> {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 2000,
    pagination: false,
    select: { width: true, height: true },
  })
  return new Map(docs.map((doc) => [doc.id, { width: doc.width, height: doc.height }]))
}

const hasLegacy = (layout: Block[] | null | undefined) => (layout ?? []).some(isConvertible)

const sectionCount = (layout: Block[] | null | undefined) =>
  (layout ?? []).filter((block) => block.blockType === 'section').length

/**
 * Reads the document back and says whether the write landed. A save can
 * resolve and still roll back: a hook that fails inside the transaction (the
 * search sync did, for posts with categories) aborts it, the error is only
 * logged, and the commit quietly does nothing.
 */
async function landed(
  payload: Payload,
  collection: Collection,
  id: number,
  expected: number,
  draft: boolean,
): Promise<boolean> {
  const doc = (await payload.findByID({
    collection,
    id,
    depth: 0,
    draft,
    disableErrors: true,
  })) as Doc | null
  return Boolean(doc) && sectionCount(doc?.layout) === expected && !hasLegacy(doc?.layout)
}

/** The published version, or null when the document was never published. */
async function publishedOf(
  payload: Payload,
  collection: Collection,
  id: number,
): Promise<Doc | null> {
  const doc = (await payload.findByID({
    collection,
    id,
    depth: 0,
    draft: false,
    disableErrors: true,
  })) as Doc | null
  return doc && doc._status === 'published' ? doc : null
}

async function restore(payload: Payload, file: string) {
  const snapshot: SnapshotEntry[] = JSON.parse(fs.readFileSync(file, 'utf8'))
  const failed: string[] = []
  for (const entry of snapshot) {
    const name = `${entry.collection}/${entry.slug ?? entry.id}`
    // The published version first, whole; then the pending draft on top of
    // it, so the document ends where it was: live as it was, draft as it was.
    if (entry.published) {
      await payload.update({
        collection: entry.collection,
        id: entry.id,
        data: { ...writable(entry.published), _status: 'published' } as never,
        draft: false,
        depth: 0,
        context,
      })
      const live = await publishedOf(payload, entry.collection, entry.id)
      if (blockIds(live?.layout) !== blockIds(entry.published.layout))
        failed.push(`${name} (published)`)
    }
    if (entry.draft) {
      await payload.update({
        collection: entry.collection,
        id: entry.id,
        data: writable(entry.draft) as never,
        draft: true,
        depth: 0,
        context,
      })
      const latest = (await payload.findByID({
        collection: entry.collection,
        id: entry.id,
        depth: 0,
        draft: true,
      })) as Doc
      if (blockIds(latest.layout) !== blockIds(entry.draft.layout)) failed.push(`${name} (draft)`)
    }
    payload.logger.info(`restored ${name}`)
  }
  payload.logger.info(`Restored ${snapshot.length} documents from ${file}`)
  if (failed.length) throw new Error(`Not restored exactly: ${failed.join(', ')}`)
}

async function publish(payload: Payload, only: string | null) {
  let published = 0
  const failed: string[] = []
  for (const collection of COLLECTIONS) {
    const { docs } = await payload.find({
      collection,
      draft: true,
      depth: 0,
      limit: 500,
      pagination: false,
    })
    for (const draft of docs as Doc[]) {
      if (only && only !== label(collection, draft)) continue
      const layout = draft.layout ?? []
      const composed = layout.some((block) => block.blockType === 'section') && !hasLegacy(layout)
      if (!composed || draft._status === 'published') continue
      const live = await publishedOf(payload, collection, draft.id)
      if (!live) {
        payload.logger.info(`skip ${label(collection, draft)}: never published, stays a draft`)
        continue
      }
      // Publish the latest draft as it stands: every field of it, not just
      // the layout, so what goes live is exactly what live preview showed.
      const { id: _id, updatedAt: _updatedAt, ...data } = draft as Doc & Record<string, unknown>
      delete (data as Record<string, unknown>).createdAt
      await payload.update({
        collection,
        id: draft.id,
        data: { ...data, _status: 'published' } as never,
        draft: false,
        depth: 0,
        context,
      })
      if (!(await landed(payload, collection, draft.id, sectionCount(layout), false))) {
        failed.push(label(collection, draft))
        payload.logger.error(`NOT published ${label(collection, draft)}: the save rolled back`)
        continue
      }
      published += 1
      payload.logger.info(`published ${label(collection, draft)}`)
    }
  }
  payload.logger.info(`Published ${published} documents. Redeploy to refresh cached pages.`)
  if (failed.length) throw new Error(`${failed.length} did not publish: ${failed.join(', ')}`)
}

/**
 * Refuses any database but the local Docker one unless the run names its
 * remote target, so a stray env file or shell export cannot aim it at Neon.
 * `--preview` also refuses the production endpoint (`PRODUCTION_DB_ENDPOINT`,
 * as in `scripts/guard-preview-db.ts`); `--production` is the only way there.
 */
function assertTarget() {
  let host = ''
  try {
    host = new URL(process.env.POSTGRES_URL ?? '').hostname
  } catch {
    throw new Error('POSTGRES_URL is missing or not a URL')
  }
  if (host === '127.0.0.1' || host === 'localhost') {
    console.log(`Target database: ${host} (local)`)
    return
  }
  if (process.argv.includes('--production')) {
    console.log(`Target database: ${host} (PRODUCTION)`)
    return
  }
  if (!process.argv.includes('--preview')) {
    throw new Error(`Refusing to run against ${host}: pass --preview or --production`)
  }
  const productionEndpoint = process.env.PRODUCTION_DB_ENDPOINT
  if (!productionEndpoint) {
    throw new Error('--preview needs PRODUCTION_DB_ENDPOINT to rule out the production database')
  }
  if (host.startsWith(`${productionEndpoint}.`) || host.startsWith(`${productionEndpoint}-`)) {
    throw new Error(`Refusing --preview: ${host} is the production endpoint`)
  }
  console.log(`Target database: ${host} (preview, not ${productionEndpoint})`)
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const only = arg('--only')
  const restoreFile = arg('--restore')

  assertTarget()
  const payload = await getPayload({ config })
  if (restoreFile) return restore(payload, restoreFile)
  if (process.argv.includes('--publish')) return publish(payload, only)

  const media = await mediaInfo(payload)
  const snapshot: SnapshotEntry[] = []
  const writes: { collection: Collection; doc: Doc; layout: Block[] }[] = []
  const failures: string[] = []

  for (const collection of COLLECTIONS) {
    const { docs } = await payload.find({
      collection,
      draft: true,
      depth: 0,
      limit: 500,
      pagination: false,
    })
    for (const doc of docs as Doc[]) {
      const name = label(collection, doc)
      if (only && only !== name) continue

      const layout = doc.layout ?? []
      const result =
        collection === 'posts'
          ? layout.length
            ? { layout, changed: false, report: [] }
            : transformPostContent(doc.content)
          : transformLayout(layout, media, OVERRIDES)

      if (!result.changed) {
        payload.logger.info(`unchanged ${name}`)
        continue
      }

      const legacy =
        collection === 'posts' ? [{ blockType: 'post', content: doc.content } as Block] : layout
      const preservation = checkPreservation(legacy, result.layout)
      const live = await publishedOf(payload, collection, doc.id)
      const pending = doc._status === 'draft' && live !== null
      const lines = [
        `${dryRun ? '[dry-run] ' : ''}${name}${pending ? '  ⚠ has an unpublished draft: --publish would ship it too' : ''}${live ? '' : '  (never published)'}`,
        `  before: ${collection === 'posts' ? 'content (Lexical body)' : describeLayout(layout)}`,
        `  after:  ${describeLayout(result.layout)}`,
        ...result.report.map(
          (line) => `    ${line.rule.padEnd(4)} ${line.source} → ${line.produced.join(', ')}`,
        ),
      ]
      if (!preservation.ok) {
        lines.push(
          `  ✗ preservation failed: skipped. Missing media ${JSON.stringify(preservation.missingMedia)}, text ${JSON.stringify(preservation.missingText.slice(0, 5))}`,
        )
        failures.push(name)
      }
      payload.logger.info(lines.join('\n'))
      if (!preservation.ok) continue

      snapshot.push({
        collection,
        id: doc.id,
        slug: doc.slug ?? null,
        published: live as Record<string, unknown> | null,
        draft: doc._status === 'draft' ? (doc as Record<string, unknown>) : null,
      })
      writes.push({ collection, doc, layout: result.layout })
    }
  }

  if (dryRun) {
    payload.logger.info(
      `Dry run: ${writes.length} documents would be written as drafts; ${failures.length} failed preservation${failures.length ? ` (${failures.join(', ')})` : ''}.`,
    )
    return
  }

  // Every input goes to disk before the first write, so --restore can undo all of it.
  const dir = path.resolve('scripts/snapshots')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(
    dir,
    `compose-layouts-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  )
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2))
  payload.logger.info(
    `Snapshot of ${snapshot.length} layouts: ${path.relative(process.cwd(), file)}`,
  )

  const unsaved: string[] = []
  for (const { collection, doc, layout } of writes) {
    await payload.update({
      collection,
      id: doc.id,
      data: { layout: layout as never },
      draft: true,
      depth: 0,
      context,
    })
    if (!(await landed(payload, collection, doc.id, sectionCount(layout), true))) {
      unsaved.push(label(collection, doc))
      payload.logger.error(`NOT drafted ${label(collection, doc)}: the save rolled back`)
      continue
    }
    payload.logger.info(`drafted ${label(collection, doc)}`)
  }
  if (unsaved.length)
    throw new Error(`${unsaved.length} drafts did not save: ${unsaved.join(', ')}`)
  payload.logger.info(
    `Wrote ${writes.length} drafts. Check them in live preview, then run --publish. ${failures.length} skipped on preservation.`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
