/**
 * One-time migration script to upload existing media from Vercel Blob to Cloudflare.
 *
 * Images  → Cloudflare Images
 * Videos  → Cloudflare Stream
 *
 * Usage:
 *   npx tsx scripts/migrate-to-cloudflare.ts
 *
 * Options:
 *   --dry-run   Preview what would be migrated without making changes
 *   --images    Only migrate images
 *   --videos    Only migrate videos
 */
import { resolve } from 'node:path'
import { config } from 'dotenv'
import postgres from 'postgres'

config({ path: resolve(process.cwd(), '.env.local') })

// Validate required env vars
const required = [
  'POSTGRES_URL',
  'BLOB_READ_WRITE_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_IMAGES_ACCOUNT_HASH',
  'CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN',
]
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    process.exit(1)
  }
}

// Derive Vercel Blob base URL from token (format: vercel_blob_rw_<storeId>_...)
// biome-ignore lint/style/noNonNullAssertion: validated above
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN!.split('_')[3]
const blobBaseUrl = `https://${blobStoreId}.public.blob.vercel-storage.com`

/**
 * Resolve the publicly-accessible Blob URL for a media row.
 * The `url` column is often empty (Vercel Blob + clientUploads),
 * so we reconstruct it from the filename.
 */
function resolveBlobUrl(row: { url?: string; filename?: string }): string | null {
  if (row.url?.startsWith('http')) return row.url
  if (!row.filename) return null
  return `${blobBaseUrl}/${encodeURIComponent(row.filename)}`
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const imagesOnly = args.includes('--images')
const videosOnly = args.includes('--videos')

const CLOUDFLARE_API = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}`
const authHeaders = { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` }

// biome-ignore lint/style/noNonNullAssertion: validated above
const sql = postgres(process.env.POSTGRES_URL!)

// Rate limiting: 1 request per 200ms to avoid hitting CF API limits
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function uploadImageToCF(imageUrl: string, payloadId: number, filename: string) {
  const formData = new FormData()
  formData.append('url', imageUrl)
  formData.append('metadata', JSON.stringify({ payloadId: String(payloadId), filename }))

  const res = await fetch(`${CLOUDFLARE_API}/images/v1`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  })

  const json = await res.json()
  if (!json.success) {
    throw new Error(`CF Images upload failed: ${JSON.stringify(json.errors)}`)
  }

  const cfImageId = json.result.id as string
  const cfImageUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${cfImageId}/public`

  return { cfImageId, cfImageUrl }
}

async function uploadVideoToCF(videoUrl: string, payloadId: number, filename: string) {
  const res = await fetch(`${CLOUDFLARE_API}/stream/copy`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: videoUrl,
      meta: { payloadId: String(payloadId), filename },
    }),
  })

  const json = await res.json()
  if (!json.success) {
    throw new Error(`CF Stream upload failed: ${JSON.stringify(json.errors)}`)
  }

  const uid = json.result.uid as string
  const playbackUrl = `https://customer-${process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${uid}/manifest/video.m3u8`

  return { uid, playbackUrl }
}

interface MigrateResult {
  success: number
  errors: number
}

async function migrateImages(images: postgres.Row[]): Promise<MigrateResult> {
  let success = 0
  let errors = 0

  console.log(`--- Migrating ${images.length} images ---`)
  for (const img of images) {
    try {
      console.log(`  [${img.id}] ${img.filename}...`)

      const imageUrl = resolveBlobUrl(img)
      if (!imageUrl) {
        console.log('    ⊘ Skipped (no URL or filename)')
        continue
      }

      if (dryRun) {
        console.log(`    [dry-run] Would upload ${imageUrl} to CF Images`)
      } else {
        const { cfImageId, cfImageUrl } = await uploadImageToCF(
          imageUrl,
          img.id,
          img.filename ?? '',
        )

        await sql`
          UPDATE media
          SET cloudflare_image_id = ${cfImageId},
              cloudflare_image_url = ${cfImageUrl}
          WHERE id = ${img.id}
        `

        console.log(`    ✓ Uploaded → ${cfImageId}`)
        await delay(200)
      }

      success++
    } catch (error) {
      errors++
      console.error(`    ✗ Failed: ${error instanceof Error ? error.message : error}`)
    }
  }
  console.log()

  return { success, errors }
}

async function migrateVideos(videos: postgres.Row[]): Promise<MigrateResult> {
  let success = 0
  let errors = 0

  console.log(`--- Migrating ${videos.length} videos ---`)
  for (const vid of videos) {
    try {
      console.log(`  [${vid.id}] ${vid.filename}...`)

      const videoUrl = resolveBlobUrl(vid)
      if (!videoUrl) {
        console.log('    ⊘ Skipped (no URL or filename)')
        continue
      }

      if (dryRun) {
        console.log(`    [dry-run] Would upload ${videoUrl} to CF Stream`)
      } else {
        const { uid, playbackUrl } = await uploadVideoToCF(videoUrl, vid.id, vid.filename ?? '')

        await sql`
          UPDATE media
          SET cloudflare_stream_uid = ${uid},
              cloudflare_stream_playback_url = ${playbackUrl},
              cloudflare_stream_ready = false
          WHERE id = ${vid.id}
        `

        console.log(`    ✓ Uploaded → ${uid} (processing...)`)
        await delay(200)
      }

      success++
    } catch (error) {
      errors++
      console.error(`    ✗ Failed: ${error instanceof Error ? error.message : error}`)
    }
  }
  console.log()

  return { success, errors }
}

async function main() {
  console.log(dryRun ? '=== DRY RUN ===' : '=== MIGRATING MEDIA TO CLOUDFLARE ===')
  console.log()

  const allMedia = await sql`
    SELECT id, filename, mime_type, url,
           cloudflare_image_id as cf_image_id,
           cloudflare_stream_uid as cf_stream_uid
    FROM media
    WHERE filename IS NOT NULL
    ORDER BY id ASC
  `

  const images = allMedia.filter((m) => m.mime_type?.startsWith('image/') && !m.cf_image_id)
  const videos = allMedia.filter((m) => m.mime_type?.startsWith('video/') && !m.cf_stream_uid)

  console.log(`Found ${images.length} images and ${videos.length} videos to migrate`)
  console.log()

  let successCount = 0
  let errorCount = 0

  if (!videosOnly) {
    const result = await migrateImages(images)
    successCount += result.success
    errorCount += result.errors
  }

  if (!imagesOnly) {
    const result = await migrateVideos(videos)
    successCount += result.success
    errorCount += result.errors
  }

  console.log('=== COMPLETE ===')
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors:  ${errorCount}`)

  if (!dryRun && videos.length > 0 && !imagesOnly) {
    console.log()
    console.log('Note: Videos are processing on Cloudflare Stream. The webhook will update')
    console.log('cloudflareStreamReady to true once each video is ready for playback.')
  }

  await sql.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
