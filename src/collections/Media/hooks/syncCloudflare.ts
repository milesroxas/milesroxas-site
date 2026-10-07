import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook,
  Plugin,
} from 'payload'
import {
  deleteCloudflareImage,
  deleteStreamVideo,
  getStreamPlaybackUrl,
  getStreamThumbnailUrl,
} from '@/utilities/cloudflare'
import { syncMediaToCloudflare } from '../cloudflare'

/**
 * Cloudflare Stream URLs for the video poster and player, computed at read time.
 * Wrapped in try-catch: the helpers throw when CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
 * is missing (a Vercel preview, say). Never let this break the read.
 */
export const resolveStreamUrls: CollectionAfterReadHook = ({ doc }) => {
  const uid = doc.cloudflareStreamUid as string | undefined
  if (!uid) return doc
  try {
    doc.cloudflareStreamPlaybackUrl = getStreamPlaybackUrl(uid)
    doc.cloudflareStreamThumbnailUrl = getStreamThumbnailUrl(uid)
  } catch {
    // Env missing; the stored playback URL stands and the poster is skipped.
  }
  return doc
}

/**
 * Syncs the saved file to Cloudflare in the same request, so the admin and
 * `cms:upload` see the asset at once. A failed upload is logged and the save
 * still succeeds: the site falls back to the Blob URL and the daily sweep
 * (`jobs/cloudflareMediaSweep`) retries the document.
 */
export const syncCloudflareUpload: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Skip our own field writes, and the storage plugin's nested metadata update:
  // the outer save syncs once the file is on Blob.
  if (context?.skipCloudflareSync || context?.skipCloudStorage) return doc

  try {
    const fields = await syncMediaToCloudflare(doc, previousDoc, req.payload.logger)
    if (!fields) return doc
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: fields,
      context: { skipCloudflareSync: true },
      req, // Keep the write in the same transaction as the triggering change
    })
    Object.assign(doc, fields)
  } catch (err) {
    req.payload.logger.error({ msg: '[Cloudflare] Upload failed', err, id: doc.id })
  }

  return doc
}

export const syncCloudflareDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
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
