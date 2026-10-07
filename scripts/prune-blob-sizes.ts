import config from '@payload-config'
import { del, list } from '@vercel/blob'
import { getPayload } from 'payload'

/**
 * Deletes the image sizes Blob still holds from before Media kept only
 * `thumbnail` (docs/media.md). Payload names a size `<name>-<w>x<h>.<ext>`
 * and keeps it beside the original, so a candidate is any blob with that
 * suffix that no Media document names as its file or its thumbnail. Originals
 * are never candidates, whatever they are called: every stored file is in the
 * keep set first.
 *
 *   pnpm exec tsx --env-file=.env scripts/prune-blob-sizes.ts            # list only
 *   pnpm exec tsx --env-file=.env scripts/prune-blob-sizes.ts --delete
 *
 * Run it against the database the store belongs to (production: override
 * POSTGRES_URL from the pulled prod env with PAYLOAD_DB_PUSH=false), after the
 * migration that dropped the size columns has deployed.
 */

const SIZE_SUFFIX = /-\d+x\d+\.[a-z0-9]+$/i
const BATCH = 100

const act = process.argv.includes('--delete')
const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is not set')
  process.exit(1)
}

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 0,
  pagination: false,
})

const keep = new Set<string>()
for (const doc of docs) {
  const folder = doc._objectKey ? `${doc._objectKey}/` : ''
  if (doc.filename) keep.add(`${folder}${doc.filename}`)
  const thumbnail = doc.sizes?.thumbnail?.filename
  if (thumbnail) keep.add(`${folder}${thumbnail}`)
}

const orphans: string[] = []
let cursor: string | undefined
do {
  const page = await list({ cursor, limit: 1000, token })
  for (const blob of page.blobs) {
    if (SIZE_SUFFIX.test(blob.pathname) && !keep.has(blob.pathname)) orphans.push(blob.url)
  }
  cursor = page.hasMore ? page.cursor : undefined
} while (cursor)

console.info(
  `${docs.length} media documents keep ${keep.size} files; ${orphans.length} size files are orphaned`,
)
for (const url of orphans) console.info(`  ${act ? 'deleting' : 'would delete'} ${url}`)

if (act) {
  for (let i = 0; i < orphans.length; i += BATCH) {
    await del(orphans.slice(i, i + BATCH), { token })
  }
  console.info(`deleted ${orphans.length}`)
}
process.exit(0)
