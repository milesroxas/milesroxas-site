import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
} from 'payload'

/**
 * Resolve the publicly-accessible URL for a media document.
 *
 * With Vercel Blob + clientUploads the `url` column in the DB is empty —
 * the storage adapter generates URLs at read-time via an `afterRead` hook
 * that hasn't run when our `afterChange` fires.
 *
 * We reconstruct the Blob URL from the filename, which is always present.
 */
function resolveMediaUrl(doc: Record<string, unknown>): string | null {
  // Prefer an already-populated URL (e.g. non-client-upload flows)
  const existing = doc.url as string | undefined
  if (existing?.startsWith('http')) return existing

  const filename = doc.filename as string | undefined
  if (!filename) return null

  // Derive Vercel Blob store URL from the token (format: vercel_blob_rw_<storeId>_...)
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  const storeId = token.split('_')[3]
  if (!storeId) return null

  return `https://${storeId}.public.blob.vercel-storage.com/${encodeURIComponent(filename)}`
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
      const { getStreamThumbnailUrl } = await import('../../../utilities/cloudflare')
      doc.cloudflareStreamThumbnailUrl = getStreamThumbnailUrl(uid)
    } catch {
      // Env missing or cloudflare util failed; skip thumbnail, doc still valid
    }
  }

  return doc
}

export const syncCloudflareUpload: CollectionAfterChangeHook = async ({ doc, req, context }) => {
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
  const { uploadImageToCloudflare, uploadVideoToStream, getImageDeliveryUrl } = await import(
    '../../../utilities/cloudflare'
  )

  try {
    if (isImage && !doc.cloudflareImageId) {
      const result = await uploadImageToCloudflare(fileUrl, {
        payloadId: String(doc.id),
        filename: doc.filename ?? '',
      })

      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          cloudflareImageId: result.id,
          cloudflareImageUrl: getImageDeliveryUrl(result.id),
        },
        context: { skipCloudflareSync: true },
      })

      doc.cloudflareImageId = result.id
      doc.cloudflareImageUrl = getImageDeliveryUrl(result.id)
    }

    if (isVideo && !doc.cloudflareStreamUid) {
      const result = await uploadVideoToStream(fileUrl, {
        payloadId: String(doc.id),
        filename: doc.filename ?? '',
      })

      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          cloudflareStreamUid: result.uid,
          cloudflareStreamPlaybackUrl: result.playbackUrl,
          cloudflareStreamReady: false,
        },
        context: { skipCloudflareSync: true },
      })

      doc.cloudflareStreamUid = result.uid
      doc.cloudflareStreamPlaybackUrl = result.playbackUrl
      doc.cloudflareStreamReady = false
    }
  } catch (error) {
    console.error('[Cloudflare] Upload failed:', error)
    // Don't throw — the file is still on Vercel Blob as fallback
  }

  return doc
}

export const syncCloudflareDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const { deleteCloudflareImage, deleteStreamVideo } = await import('../../../utilities/cloudflare')

  try {
    if (doc.cloudflareImageId) {
      await deleteCloudflareImage(doc.cloudflareImageId as string)
    }
    if (doc.cloudflareStreamUid) {
      await deleteStreamVideo(doc.cloudflareStreamUid as string)
    }
  } catch (error) {
    console.error('[Cloudflare] Delete failed:', error)
  }
}
