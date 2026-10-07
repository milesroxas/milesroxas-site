import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Re-runs the Cloudflare sync for every image or video in Media that has no
 * Cloudflare asset yet. Saving a document unchanged runs the Media hooks, and
 * `syncCloudflareUpload` uploads to Cloudflare whenever the id is missing.
 *
 * Needed once after the Blob URL fix: a browser upload lives in its own Blob
 * folder, and the sync used to ask Cloudflare for a URL without the folder.
 *
 *   pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts --dry-run
 *   pnpm exec tsx --env-file=.env scripts/resync-cloudflare-media.ts
 *
 * Against production, override POSTGRES_URL from the pulled prod env and keep
 * schema push off: PAYLOAD_DB_PUSH=false POSTGRES_URL=<prod> pnpm exec tsx ...
 * The Blob and Cloudflare variables in `.env` must be the deployed ones.
 */

const dryRun = process.argv.includes('--dry-run')

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 0,
  pagination: false,
  where: {
    and: [
      { or: [{ mimeType: { like: 'image/' } }, { mimeType: { like: 'video/' } }] },
      { cloudflareImageId: { exists: false } },
      { cloudflareStreamUid: { exists: false } },
    ],
  },
})

console.info(`${docs.length} media document(s) without a Cloudflare asset`)

let failed = 0
for (const doc of docs) {
  const label = `${doc.id} ${doc.filename ?? ''} (${doc.mimeType ?? 'unknown'})`
  if (dryRun) {
    console.info(`  would sync ${label}`)
    continue
  }
  const updated = await payload.update({ collection: 'media', id: doc.id, data: {} })
  const synced = updated.cloudflareImageId || updated.cloudflareStreamUid
  if (synced) {
    console.info(`  synced ${label}`)
  } else {
    failed += 1
    console.error(`  FAILED ${label}: see "[Cloudflare] Upload failed" above`)
  }
}

process.exit(failed > 0 ? 1 : 0)
