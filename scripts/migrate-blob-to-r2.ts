import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { list } from '@vercel/blob'

/**
 * Copies every object in the Vercel Blob store into the R2 media bucket under
 * the same key, so no Media row changes: `url` is computed from `prefix`,
 * `_objectKey` and `filename` on every read (docs/media.md). Idempotent: an
 * object already in R2 with the same size is skipped. Cloudflare Images and
 * Stream already hold their copies, so nothing is re-synced.
 *
 *   pnpm exec tsx --env-file=.env scripts/migrate-blob-to-r2.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/migrate-blob-to-r2.ts
 *
 * Needs BLOB_READ_WRITE_TOKEN (the old store) and the R2_* variables.
 */

const ONE_YEAR = 'public, max-age=31536000, immutable'

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

const dryRun = process.argv.includes('--dry-run')
const token = required('BLOB_READ_WRITE_TOKEN')
const bucket = required('R2_BUCKET')
const s3 = new S3Client({
  endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
  },
})

async function sizeInR2(key: string): Promise<number | null> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return head.ContentLength ?? null
  } catch (err) {
    if ((err as { name?: string }).name === 'NotFound') return null
    throw err
  }
}

let copied = 0
let skipped = 0
let failed = 0
let cursor: string | undefined
do {
  const page = await list({ token, cursor, limit: 1000 })
  for (const blob of page.blobs) {
    const key = blob.pathname.replace(/^\/+/, '')
    try {
      if ((await sizeInR2(key)) === blob.size) {
        skipped += 1
        continue
      }
      if (dryRun) {
        console.log(`would copy ${key} (${blob.size} bytes)`)
        copied += 1
        continue
      }
      const res = await fetch(blob.url)
      if (!res.ok) throw new Error(`Blob answered ${res.status}`)
      const body = Buffer.from(await res.arrayBuffer())
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: res.headers.get('content-type') ?? undefined,
          CacheControl: ONE_YEAR,
        }),
      )
      copied += 1
      console.log(`copied ${key} (${body.length} bytes)`)
    } catch (err) {
      failed += 1
      console.error(`failed ${key}: ${(err as Error).message}`)
    }
  }
  cursor = page.hasMore ? page.cursor : undefined
} while (cursor)

console.log(`${dryRun ? 'would copy' : 'copied'} ${copied}, skipped ${skipped}, failed ${failed}`)
if (failed > 0) process.exit(1)
