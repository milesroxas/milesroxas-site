import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
  PayloadRequest,
  Plugin,
} from 'payload'

type MediaDoc = Record<string, unknown>
type CloudflareUtils = typeof import('../../../utilities/cloudflare')

/**
 * The file's public Blob URL. The storage adapter's `url` field hook writes it
 * (`disablePayloadAccessControl` in `payload.config.ts`) from the object's own
 * folder, `prefix/_objectKey/filename`, which a browser upload always has; it
 * runs in the read phase, before `afterChange`, so the hook sees the final URL.
 */
function blobUrl(doc: MediaDoc): string | null {
  const url = doc.url
  return typeof url === 'string' && url.startsWith('http') ? url : null
}

/**
 * Cloudflare Stream URLs for the video poster and player, computed at read time.
 * Wrapped in try-catch: the helpers throw when CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
 * is missing (a Vercel preview, say). Never let this break the read.
 */
export const resolveStreamUrls: CollectionAfterReadHook = async ({ doc }) => {
  const uid = doc.cloudflareStreamUid as string | undefined
  if (!uid) return doc
  try {
    const { getStreamPlaybackUrl, getStreamThumbnailUrl } = await import(
      '../../../utilities/cloudflare'
    )
    doc.cloudflareStreamPlaybackUrl = getStreamPlaybackUrl(uid)
    doc.cloudflareStreamThumbnailUrl = getStreamThumbnailUrl(uid)
  } catch {
    // Env missing or cloudflare util failed; skip, doc still valid
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

/** Which Cloudflare product a file syncs to, by MIME type: Images, Stream, or neither. */
function syncKind(mimeType: string | undefined): 'image' | 'video' | null {
  if (mimeType?.startsWith('image/')) return 'image'
  if (mimeType?.startsWith('video/')) return 'video'
  return null
}

/**
 * The file was replaced while Cloudflare still holds assets made from the old
 * one. A browser upload lands in a new `_objectKey` folder even when it keeps
 * the filename, so the key is compared as well.
 */
const hasStaleAssets = (doc: MediaDoc, previousDoc: MediaDoc | undefined) => {
  if (!previousDoc?.filename || !doc.filename) return false
  const replaced =
    previousDoc.filename !== doc.filename ||
    (previousDoc._objectKey ?? null) !== (doc._objectKey ?? null)
  return replaced && Boolean(doc.cloudflareImageId || doc.cloudflareStreamUid)
}

export const syncCloudflareUpload: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Skip our own field writes, and the storage plugin's nested metadata update:
  // the outer save syncs once the file is on Blob.
  if (context?.skipCloudflareSync || context?.skipCloudStorage) return doc

  const kind = syncKind(doc.mimeType as string | undefined)
  if (!kind) return doc

  const fileUrl = blobUrl(doc)
  if (!fileUrl) {
    req.payload.logger.warn({ msg: '[Cloudflare] No Blob URL to sync from', id: doc.id })
    return doc
  }

  // Lazily import to keep this server-only and avoid circular deps
  const cf = await import('../../../utilities/cloudflare')

  try {
    if (hasStaleAssets(doc, previousDoc)) {
      await purgeStaleAssets(doc, req, cf)
    }

    if (kind === 'image' && !doc.cloudflareImageId) {
      await syncImage(doc, fileUrl, req, cf)
    }

    if (kind === 'video' && !doc.cloudflareStreamUid) {
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

/**
 * Registers the upload sync after the storage adapter's `afterChange`, which is
 * what puts a server-side upload (`/api/agent/media`) on Blob. Run before it,
 * Cloudflare is asked to fetch a URL that does not exist yet.
 * List it after `vercelBlobStorage` in `payload.config.ts`.
 */
export const cloudflareMediaSync = (): Plugin => (config) => ({
  ...config,
  collections: (config.collections ?? []).map((collection) =>
    collection.slug === 'media'
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [...(collection.hooks?.afterChange ?? []), syncCloudflareUpload],
          },
        }
      : collection,
  ),
})
