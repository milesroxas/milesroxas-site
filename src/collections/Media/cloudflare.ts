import type { Payload } from 'payload'
import type { Media } from '@/payload-types'
import * as cf from '@/utilities/cloudflare'

/**
 * The Cloudflare side of a Media document, shared by the upload hook, the
 * daily sweep job and the resync script (docs/media.md). The hook syncs a
 * file in the request that saved it; the sweep catches whatever that missed.
 */

/** A Media document as the hooks and the Local API hand it over. */
export type MediaDoc = Partial<Media> & { id: Media['id'] }

/** The Cloudflare fields one sync writes, all at once. */
export type CloudflareFields = Pick<
  Media,
  | 'cloudflareImageId'
  | 'cloudflareImageUrl'
  | 'cloudflareStreamUid'
  | 'cloudflareStreamPlaybackUrl'
  | 'cloudflareStreamReady'
>

type Logger = Pick<Payload['logger'], 'error' | 'info' | 'warn'>

const cleared: CloudflareFields = {
  cloudflareImageId: null,
  cloudflareImageUrl: null,
  cloudflareStreamUid: null,
  cloudflareStreamPlaybackUrl: null,
  cloudflareStreamReady: false,
}

/** Which Cloudflare product a file syncs to, by MIME type: Images, Stream, or neither. */
export function syncKind(mimeType: string | null | undefined): 'image' | 'video' | null {
  if (mimeType?.startsWith('image/')) return 'image'
  if (mimeType?.startsWith('video/')) return 'video'
  return null
}

/**
 * The file's public Blob URL. The storage adapter's `url` field hook writes it
 * (`disablePayloadAccessControl` in `payload.config.ts`) from the object's own
 * folder, `_objectKey/filename`, which a browser upload always has; it runs in
 * the read phase, before `afterChange`, so the hook sees the final URL.
 */
export function blobUrl(doc: MediaDoc): string | null {
  const url = doc.url
  return typeof url === 'string' && url.startsWith('http') ? url : null
}

/** The document already has the asset its kind needs. */
export const isSynced = (doc: MediaDoc): boolean => {
  const kind = syncKind(doc.mimeType)
  if (kind === 'image') return Boolean(doc.cloudflareImageId)
  if (kind === 'video') return Boolean(doc.cloudflareStreamUid)
  return true
}

/**
 * The file was replaced while Cloudflare still holds assets made from the old
 * one. A browser upload lands in a new `_objectKey` folder even when it keeps
 * the filename, so the key is compared as well.
 */
export function hasStaleAssets(doc: MediaDoc, previousDoc: MediaDoc | undefined): boolean {
  if (!previousDoc?.filename || !doc.filename) return false
  const replaced =
    previousDoc.filename !== doc.filename ||
    (previousDoc._objectKey ?? null) !== (doc._objectKey ?? null)
  return replaced && Boolean(doc.cloudflareImageId || doc.cloudflareStreamUid)
}

/** Deletes the assets a replaced file left behind. A failed delete is logged, never fatal. */
async function purgeAssets(doc: MediaDoc, logger: Logger): Promise<void> {
  if (doc.cloudflareImageId) {
    try {
      await cf.deleteCloudflareImage(doc.cloudflareImageId)
    } catch (err) {
      logger.warn({ msg: '[Cloudflare] Stale image delete failed', err, id: doc.id })
    }
  }
  if (doc.cloudflareStreamUid) {
    try {
      await cf.deleteStreamVideo(doc.cloudflareStreamUid)
    } catch (err) {
      logger.warn({ msg: '[Cloudflare] Stale stream delete failed', err, id: doc.id })
    }
  }
}

/**
 * Brings Cloudflare in step with the document and answers the fields to
 * store, or `null` when nothing needs writing. Throws when the upload itself
 * fails, after the retries in `utilities/cloudflare`; the caller decides
 * whether that blocks the save (it does not) and the sweep retries later.
 */
export async function syncMediaToCloudflare(
  doc: MediaDoc,
  previousDoc: MediaDoc | undefined,
  logger: Logger,
): Promise<CloudflareFields | null> {
  const kind = syncKind(doc.mimeType)
  if (!kind) return null

  const stale = hasStaleAssets(doc, previousDoc)
  const current: MediaDoc = stale ? { ...doc, ...cleared } : doc
  if (stale) await purgeAssets(doc, logger)
  if (isSynced(current)) return stale ? cleared : null

  const fileUrl = blobUrl(doc)
  if (!fileUrl) {
    logger.warn({ msg: '[Cloudflare] No Blob URL to sync from', id: doc.id })
    return stale ? cleared : null
  }

  const metadata = { payloadId: String(doc.id), filename: doc.filename ?? '' }
  if (kind === 'image') {
    const { id } = await cf.uploadImageToCloudflare(fileUrl, metadata)
    return { ...cleared, cloudflareImageId: id, cloudflareImageUrl: cf.getImageDeliveryUrl(id) }
  }
  const { uid, playbackUrl } = await cf.uploadVideoToStream(fileUrl, metadata)
  return { ...cleared, cloudflareStreamUid: uid, cloudflareStreamPlaybackUrl: playbackUrl }
}

/** Every image or video without its Cloudflare asset. */
export async function findUnsynced(payload: Payload): Promise<Media[]> {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
    where: {
      or: [
        { and: [{ mimeType: { like: 'image/' } }, { cloudflareImageId: { exists: false } }] },
        { and: [{ mimeType: { like: 'video/' } }, { cloudflareStreamUid: { exists: false } }] },
      ],
    },
  })
  return docs
}

export type SweepResult = { failed: number; synced: number }

/**
 * Syncs every unsynced image and video, one at a time so a Cloudflare rate
 * limit never turns into a burst. Each document is written with the sync
 * skipped (`skipCloudflareSync`), so the hook does not run a second time.
 */
export async function sweepUnsynced(
  payload: Payload,
  { dryRun = false, logger = payload.logger }: { dryRun?: boolean; logger?: Logger } = {},
): Promise<SweepResult> {
  const docs = await findUnsynced(payload)
  logger.info({ msg: '[Cloudflare] Sweep', unsynced: docs.length, dryRun })
  const result: SweepResult = { failed: 0, synced: 0 }
  for (const doc of docs) {
    const label = `${doc.id} ${doc.filename ?? ''} (${doc.mimeType ?? 'unknown'})`
    if (dryRun) {
      logger.info({ msg: `[Cloudflare] Would sync ${label}` })
      continue
    }
    try {
      const fields = await syncMediaToCloudflare(doc, undefined, logger)
      if (!fields) continue
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: fields,
        context: { skipCloudflareSync: true },
      })
      result.synced += 1
      logger.info({ msg: `[Cloudflare] Synced ${label}` })
    } catch (err) {
      result.failed += 1
      logger.error({ msg: `[Cloudflare] Sync failed for ${label}`, err })
    }
  }
  return result
}
