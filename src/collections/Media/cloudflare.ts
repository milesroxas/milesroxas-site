import type { Payload, PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'
import * as cf from '@/utilities/cloudflare'

/**
 * The Cloudflare side of a Media document, shared by the upload hook, the
 * Stream webhook, the daily sweep job and the resync script (docs/media.md).
 * The hook syncs a file in the request that saved it; the sweep catches
 * whatever that missed and marks the videos Stream has finished encoding.
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

/**
 * Writes Cloudflare fields straight to the row. They are derived data the
 * site owns, so no hook needs to see the write: going through `payload.update`
 * would run the storage adapter again (it re-uploads the file it kept on the
 * request) and leave a skip flag on `req.context` that the next create in the
 * same request would inherit. With `req` the write joins the caller's
 * transaction.
 */
export async function writeCloudflareFields(
  payload: Payload,
  id: Media['id'],
  fields: Partial<CloudflareFields>,
  req?: PayloadRequest,
): Promise<void> {
  await payload.db.updateOne({ collection: 'media', id, data: fields, req, returning: false })
}

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
 * The file's public URL on the origin bucket. The storage adapter's `url`
 * field hook writes it (`generateFileURL` in `payload.config.ts`) from the
 * object's own folder, `_objectKey/filename`, which a browser upload always
 * has; it runs in the read phase, before `afterChange`, so the hook sees the
 * final URL. Cloudflare fetches the file from here.
 */
export function originUrl(doc: MediaDoc): string | null {
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

  const fileUrl = originUrl(doc)
  if (!fileUrl) {
    logger.warn({ msg: '[Cloudflare] No origin URL to sync from', id: doc.id })
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

/** Every video on Stream that the site still plays from the origin bucket. */
export async function findUnready(payload: Payload): Promise<Media[]> {
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
    where: {
      and: [
        { cloudflareStreamUid: { exists: true } },
        { cloudflareStreamReady: { not_equals: true } },
      ],
    },
  })
  return docs
}

export type SweepResult = { failed: number; ready: number; synced: number }

type SweepOptions = { dryRun?: boolean; logger?: Logger }

const label = (doc: Media) => `${doc.id} ${doc.filename ?? ''} (${doc.mimeType ?? 'unknown'})`

/** Uploads each unsynced image or video and stores its ids. */
async function syncUnsynced(
  payload: Payload,
  docs: Media[],
  result: SweepResult,
  { dryRun, logger }: Required<SweepOptions>,
): Promise<void> {
  for (const doc of docs) {
    if (dryRun) {
      logger.info({ msg: `[Cloudflare] Would sync ${label(doc)}` })
      continue
    }
    try {
      const fields = await syncMediaToCloudflare(doc, undefined, logger)
      if (!fields) continue
      await writeCloudflareFields(payload, doc.id, fields)
      result.synced += 1
      logger.info({ msg: `[Cloudflare] Synced ${label(doc)}` })
    } catch (err) {
      result.failed += 1
      logger.error({ msg: `[Cloudflare] Sync failed for ${label(doc)}`, err })
    }
  }
}

/** Marks each video Stream has finished encoding. */
async function markReady(
  payload: Payload,
  docs: Media[],
  result: SweepResult,
  { dryRun, logger }: Required<SweepOptions>,
): Promise<void> {
  for (const doc of docs) {
    if (!doc.cloudflareStreamUid) continue
    if (dryRun) {
      logger.info({ msg: `[Cloudflare] Would check Stream for ${label(doc)}` })
      continue
    }
    try {
      if (!(await cf.getStreamVideoReady(doc.cloudflareStreamUid))) continue
      await writeCloudflareFields(payload, doc.id, { cloudflareStreamReady: true })
      result.ready += 1
      logger.info({ msg: `[Cloudflare] Stream ready for ${label(doc)}` })
    } catch (err) {
      result.failed += 1
      logger.error({ msg: `[Cloudflare] Stream check failed for ${label(doc)}`, err })
    }
  }
}

/**
 * Brings every Media document in step with Cloudflare: uploads each image or
 * video still without its asset, then marks each video Stream has finished
 * encoding. One document at a time, so a Cloudflare rate limit never turns
 * into a burst. The Stream webhook marks a video ready sooner when it can
 * reach the site; this is the path that does not depend on it.
 */
export async function sweepMedia(
  payload: Payload,
  { dryRun = false, logger = payload.logger }: SweepOptions = {},
): Promise<SweepResult> {
  const result: SweepResult = { failed: 0, ready: 0, synced: 0 }
  const unsynced = await findUnsynced(payload)
  const unready = await findUnready(payload)
  logger.info({
    msg: '[Cloudflare] Sweep',
    unsynced: unsynced.length,
    unready: unready.length,
    dryRun,
  })
  await syncUnsynced(payload, unsynced, result, { dryRun, logger })
  await markReady(payload, unready, result, { dryRun, logger })
  return result
}
