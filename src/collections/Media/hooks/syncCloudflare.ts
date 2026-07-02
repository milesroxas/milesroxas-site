import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
  PayloadRequest,
} from 'payload'

type MediaDoc = Record<string, unknown>
type CloudflareUtils = typeof import('../../../utilities/cloudflare')

/**
 * Resolve the publicly-accessible URL for a media document.
 *
 * With Vercel Blob + clientUploads the `url` column in the DB is empty —
 * the storage adapter generates URLs at read-time via an `afterRead` hook
 * that hasn't run when our `afterChange` fires.
 *
 * We reconstruct the Blob URL from the filename. The store base URL comes
 * from BLOB_BASE_URL when set, otherwise it is derived from the token
 * (format: vercel_blob_rw_<storeId>_...).
 */
function resolveMediaUrl(doc: MediaDoc): string | null {
  // Prefer an already-populated URL (e.g. non-client-upload flows)
  const existing = doc.url as string | undefined
  if (existing?.startsWith('http')) return existing

  const filename = doc.filename as string | undefined
  if (!filename) return null

  const base = process.env.BLOB_BASE_URL || deriveBlobBaseUrl()
  if (!base) return null

  return `${base.replace(/\/$/, '')}/${encodeURIComponent(filename)}`
}

function deriveBlobBaseUrl(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  const storeId = token.split('_')[3]
  if (!storeId) return null
  return `https://${storeId}.public.blob.vercel-storage.com`
}

/**
 * Replace /api/media/file/ URLs with direct Vercel Blob URLs.
 * Payload's static file handler serves from disk; with Vercel Blob, files live in the cloud
 * so /api/media/file/ requests 404. Use direct Blob URLs instead.
 */
export const resolveBlobUrl: CollectionAfterReadHook = async ({ doc }) => {
  const existing = doc.url as string | undefined
  if (existing?.startsWith('http')) return doc

  const blobUrl = resolveMediaUrl(doc)
  if (blobUrl) doc.url = blobUrl

  // Populate Cloudflare Stream thumbnail URL for video poster (computed at read time).
  // Wrapped in try-catch: getStreamThumbnailUrl throws if CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
  // is missing (e.g. on Vercel preview). Never let this break the read — doc must be returned.
  const uid = doc.cloudflareStreamUid as string | undefined
  if (uid) {
    try {
      const { getStreamPlaybackUrl, getStreamThumbnailUrl } = await import(
        '../../../utilities/cloudflare'
      )
      doc.cloudflareStreamPlaybackUrl = getStreamPlaybackUrl(uid)
      doc.cloudflareStreamThumbnailUrl = getStreamThumbnailUrl(uid)
    } catch {
      // Env missing or cloudflare util failed; skip, doc still valid
    }
  }

  return doc
}

/**
 * When the file was replaced, the existing Cloudflare assets belong to the
 * old file — purge them and clear the fields so the new file re-syncs.
 */
async function purgeStaleAssets(doc: MediaDoc, req: PayloadRequest, cf: CloudflareUtils) {
  if (doc.cloudflareImageId) {
    try {
      await cf.deleteCloudflareImage(doc.cloudflareImageId as string)
    } catch (err) {
      req.payload.logger.warn({ msg: '[Cloudflare] Stale image delete failed', err })
    }
  }

  if (doc.cloudflareStreamUid) {
    try {
      await cf.deleteStreamVideo(doc.cloudflareStreamUid as string)
    } catch (err) {
      req.payload.logger.warn({ msg: '[Cloudflare] Stale stream delete failed', err })
    }
  }

  await req.payload.update({
    collection: 'media',
    id: doc.id as string | number,
    data: {
      cloudflareImageId: null,
      cloudflareImageUrl: null,
      cloudflareStreamUid: null,
      cloudflareStreamPlaybackUrl: null,
      cloudflareStreamReady: false,
    },
    context: { skipCloudflareSync: true },
    req, // Keep the write in the same transaction as the triggering change
  })

  doc.cloudflareImageId = null
  doc.cloudflareImageUrl = null
  doc.cloudflareStreamUid = null
  doc.cloudflareStreamPlaybackUrl = null
  doc.cloudflareStreamReady = false
}

async function syncImage(doc: MediaDoc, fileUrl: string, req: PayloadRequest, cf: CloudflareUtils) {
  const result = await cf.uploadImageToCloudflare(fileUrl, {
    payloadId: String(doc.id),
    filename: (doc.filename as string | undefined) ?? '',
  })

  await req.payload.update({
    collection: 'media',
    id: doc.id as string | number,
    data: {
      cloudflareImageId: result.id,
      cloudflareImageUrl: cf.getImageDeliveryUrl(result.id),
    },
    context: { skipCloudflareSync: true },
    req, // Keep the write in the same transaction as the triggering change
  })

  doc.cloudflareImageId = result.id
  doc.cloudflareImageUrl = cf.getImageDeliveryUrl(result.id)
}

async function syncVideo(doc: MediaDoc, fileUrl: string, req: PayloadRequest, cf: CloudflareUtils) {
  const result = await cf.uploadVideoToStream(fileUrl, {
    payloadId: String(doc.id),
    filename: (doc.filename as string | undefined) ?? '',
  })

  await req.payload.update({
    collection: 'media',
    id: doc.id as string | number,
    data: {
      cloudflareStreamUid: result.uid,
      cloudflareStreamPlaybackUrl: result.playbackUrl,
      cloudflareStreamReady: false,
    },
    context: { skipCloudflareSync: true },
    req, // Keep the write in the same transaction as the triggering change
  })

  doc.cloudflareStreamUid = result.uid
  doc.cloudflareStreamPlaybackUrl = result.playbackUrl
  doc.cloudflareStreamReady = false
}

export const syncCloudflareUpload: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Skip if this update was triggered by the hook itself
  if (context?.skipCloudflareSync) return doc

  const mimeType = doc.mimeType as string | undefined
  if (!mimeType) return doc

  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')

  if (!isImage && !isVideo) return doc

  const fileUrl = resolveMediaUrl(doc)
  if (!fileUrl) return doc

  // Lazily import to keep this server-only and avoid circular deps
  const cf = await import('../../../utilities/cloudflare')

  const fileReplaced = Boolean(
    previousDoc?.filename && doc.filename && previousDoc.filename !== doc.filename,
  )

  try {
    if (fileReplaced && (doc.cloudflareImageId || doc.cloudflareStreamUid)) {
      await purgeStaleAssets(doc, req, cf)
    }

    if (isImage && !doc.cloudflareImageId) {
      await syncImage(doc, fileUrl, req, cf)
    }

    if (isVideo && !doc.cloudflareStreamUid) {
      await syncVideo(doc, fileUrl, req, cf)
    }
  } catch (err) {
    req.payload.logger.error({ msg: '[Cloudflare] Upload failed', err })
    // Don't throw — the file is still on Vercel Blob as fallback
  }

  return doc
}

export const syncCloudflareDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const { deleteCloudflareImage, deleteStreamVideo } = await import('../../../utilities/cloudflare')

  if (doc.cloudflareImageId) {
    try {
      await deleteCloudflareImage(doc.cloudflareImageId as string)
    } catch (err) {
      req.payload.logger.error({ msg: '[Cloudflare] Image delete failed', err })
    }
  }

  if (doc.cloudflareStreamUid) {
    try {
      await deleteStreamVideo(doc.cloudflareStreamUid as string)
    } catch (err) {
      req.payload.logger.error({ msg: '[Cloudflare] Stream delete failed', err })
    }
  }
}
