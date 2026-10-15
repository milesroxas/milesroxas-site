import { parse } from 'node:path'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

/**
 * Re-encodes every AVIF in Media as WebP and replaces the file, so Cloudflare
 * Images takes it: the Images API refuses AVIF input (code 5455), and an
 * upload it refuses stays on the origin bucket for good, served through
 * Vercel's optimizer instead of imagedelivery.net. The Media hooks then do
 * the rest of a normal replacement: the storage adapter writes the WebP and
 * its thumbnail into the document's folder and drops the AVIF, and the
 * Cloudflare sync uploads the new file.
 *
 *   pnpm exec tsx --env-file=.env scripts/replace-avif-media.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/replace-avif-media.ts [--id <media id>]
 *
 * Against production, override POSTGRES_URL from the pulled prod env and keep
 * schema push off, as for `resync-cloudflare-media.ts`. The R2 and Cloudflare
 * variables in `.env` must be the deployed ones.
 */

/** `agentMedia.ts`'s setting: the one every agent upload is already stored with. */
const WEBP = { quality: 85, smartSubsample: true } as const

const dryRun = process.argv.includes('--dry-run')
const onlyId = (() => {
  const index = process.argv.indexOf('--id')
  return index === -1 ? null : Number(process.argv[index + 1])
})()

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
})

/** The object's key: the folder a browser upload landed in, then the filename. */
const objectKey = (doc: { _objectKey?: string | null; filename?: string | null }) =>
  [doc._objectKey, doc.filename].filter(Boolean).join('/')

async function download(key: string): Promise<Buffer> {
  const object = await s3.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }))
  if (!object.Body) throw new Error(`empty body for ${key}`)
  return Buffer.from(await object.Body.transformToByteArray())
}

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 200,
  pagination: false,
  select: { _objectKey: true, cloudflareImageId: true, filename: true, mimeType: true },
  where: {
    and: [
      { mimeType: { equals: 'image/avif' } },
      { cloudflareImageId: { exists: false } },
      ...(onlyId ? [{ id: { equals: onlyId } }] : []),
    ],
  },
})

payload.logger.info(`[AVIF] ${docs.length} to replace${dryRun ? ' (dry run)' : ''}`)
let failed = 0
for (const doc of docs) {
  const key = objectKey(doc)
  const name = `${parse(doc.filename ?? 'image').name}.webp`
  if (dryRun) {
    payload.logger.info(`[AVIF] Would replace ${doc.id} ${key} with ${name}`)
    continue
  }
  try {
    const avif = await download(key)
    const data = await sharp(avif).rotate().webp(WEBP).toBuffer()
    const updated = await payload.update({
      collection: 'media',
      id: doc.id,
      data: {},
      file: { data, mimetype: 'image/webp', name, size: data.length },
      overrideAccess: true,
    })
    payload.logger.info(
      `[AVIF] Replaced ${doc.id} ${key}: ${avif.length} -> ${data.length} bytes, ${updated.url}, Cloudflare ${updated.cloudflareImageId ?? 'NOT SYNCED'}`,
    )
    if (!updated.cloudflareImageId) failed += 1
  } catch (err) {
    failed += 1
    payload.logger.error({ msg: `[AVIF] Failed ${doc.id} ${key}`, err })
  }
}
console.info(`replaced ${docs.length - failed}, failed ${failed}`)
process.exit(failed > 0 ? 1 : 0)
