import type { Payload, PayloadRequest } from 'payload'
import { hasStaleAssets, originUrl } from '@/collections/Media/cloudflare'
import type { Video } from '@/payload-types'
import * as cf from '@/utilities/cloudflare'
import { loopRange, sameLoopRange, stageOf, type VideoDoc } from './stage'

/**
 * The Cloudflare Stream side of a Video document (docs/media.md, "Videos").
 * One pipeline, `advanceVideo`, takes a document as far as Stream lets it
 * in one pass: the file is copied to Stream, Stream is asked whether it has
 * finished, the loop is cut once it has, and the loop is asked after in
 * turn. Every caller runs the same pass: the save hook in its own request,
 * the admin's status poll (which is what carries a video to ready while the
 * editor watches; the Stream webhook is behind Vercel's bot protection in
 * production), the webhook when it does land, and the resync script run by
 * hand. Nothing runs on a schedule.
 */

/** The fields one pass may write, all derived from Stream. */
export type VideoStreamFields = Pick<
  Video,
  | 'cloudflareStreamUid'
  | 'cloudflareStreamReady'
  | 'duration'
  | 'width'
  | 'height'
  | 'loopUid'
  | 'loopReady'
  | 'streamError'
>

type Logger = Pick<Payload['logger'], 'error' | 'info' | 'warn'>

const cleared: VideoStreamFields = {
  cloudflareStreamUid: null,
  cloudflareStreamReady: false,
  duration: null,
  width: null,
  height: null,
  loopUid: null,
  loopReady: false,
  streamError: null,
}

/**
 * Writes Stream fields straight to the row, as Media's `writeCloudflareFields`
 * does and for the same reasons: derived data, no hook needs to see it, and a
 * `payload.update` would run the storage adapter again. With `req` the write
 * joins the caller's transaction.
 */
export async function writeVideoFields(
  payload: Payload,
  id: Video['id'],
  fields: Partial<VideoStreamFields>,
  req?: PayloadRequest,
): Promise<void> {
  await payload.db.updateOne({ collection: 'videos', id, data: fields, req, returning: false })
}

/** Deletes a Stream video. A failed delete is logged, never fatal: the asset is orphaned, nothing else. */
async function deleteQuietly(uid: string | null | undefined, what: string, logger: Logger) {
  if (!uid) return
  try {
    await cf.deleteStreamVideo(uid)
  } catch (err) {
    logger.warn({ msg: `[Stream] ${what} delete failed`, err, uid })
  }
}

/** Removes the source and its loop from Stream: a deleted document, or a replaced file. */
export async function purgeVideoStream(doc: VideoDoc, logger: Logger): Promise<void> {
  await deleteQuietly(doc.loopUid, 'Loop', logger)
  await deleteQuietly(doc.cloudflareStreamUid, 'Video', logger)
}

const streamMeta = (doc: VideoDoc, suffix = '') => ({
  name: `${doc.title ?? doc.filename ?? doc.id}${suffix}`,
  payloadId: String(doc.id),
})

type Pass = { doc: VideoDoc; fields: Partial<VideoStreamFields> }

const learn = (pass: Pass, next: Partial<VideoStreamFields>) => {
  Object.assign(pass.fields, next)
  pass.doc = { ...pass.doc, ...next }
}

/** A replaced file starts over on Stream; a moved loop is recut from the same source. */
async function restartIfChanged(pass: Pass, previousDoc: VideoDoc | undefined, logger: Logger) {
  if (!previousDoc) return
  if (hasStaleAssets(pass.doc, previousDoc)) {
    await purgeVideoStream(pass.doc, logger)
    learn(pass, cleared)
    return
  }
  const moved = !sameLoopRange(
    loopRange(pass.doc),
    loopRange({ ...pass.doc, loop: previousDoc.loop }),
  )
  if (pass.doc.loopUid && moved) {
    await deleteQuietly(pass.doc.loopUid, 'Loop', logger)
    learn(pass, { loopUid: null, loopReady: false })
  }
}

async function copyToStream(pass: Pass, logger: Logger) {
  const fileUrl = originUrl(pass.doc)
  if (!fileUrl) {
    logger.warn({ msg: '[Stream] No origin URL to copy from', id: pass.doc.id })
    return
  }
  const { uid } = await cf.uploadVideoToStream(fileUrl, streamMeta(pass.doc))
  learn(pass, {
    cloudflareStreamUid: uid,
    cloudflareStreamReady: false,
    loopUid: null,
    loopReady: false,
  })
}

/** Stream's word on a video. Throws when Stream gave up on it, so the caller records why. */
async function inspect(uid: string) {
  const status = await cf.getStreamVideoStatus(uid)
  if (status.error) throw new Error(status.error)
  return status
}

/** Cuts the loop from the encoded source, or marks a source short enough to be its own loop. */
async function cutLoop(pass: Pass) {
  const range = loopRange(pass.doc)
  if (!range) {
    learn(pass, { loopReady: true })
    return
  }
  const { uid } = await cf.clipStreamVideo(
    pass.doc.cloudflareStreamUid as string,
    range.start,
    range.end,
    streamMeta(pass.doc, ' (loop)'),
  )
  learn(pass, { loopUid: uid, loopReady: false })
}

/**
 * Takes the document one pass further and answers the fields to store, or
 * `null` when nothing moved. With `previousDoc` (the save hook), a replaced
 * file starts over and a moved loop is recut. Stops after any step that
 * leaves Stream work to do, since the next poll will ask again. Throws when a
 * request fails after the retries in `utilities/cloudflare`, and when Stream
 * reports it gave up; the caller records that as `streamError`, which the
 * next pass that gets through clears.
 */
export async function advanceVideo(
  doc: VideoDoc,
  { previousDoc, logger }: { previousDoc?: VideoDoc; logger: Logger },
): Promise<Partial<VideoStreamFields> | null> {
  const pass: Pass = { doc, fields: {} }
  const answer = () =>
    Object.keys(pass.fields).length || doc.streamError
      ? { ...pass.fields, streamError: null }
      : null
  await restartIfChanged(pass, previousDoc, logger)

  if (!pass.doc.cloudflareStreamUid) {
    await copyToStream(pass, logger)
    return answer()
  }
  if (!pass.doc.cloudflareStreamReady) {
    const status = await inspect(pass.doc.cloudflareStreamUid)
    if (!status.ready) return answer()
    learn(pass, {
      cloudflareStreamReady: true,
      duration: status.duration,
      width: status.width,
      height: status.height,
    })
  }
  if (!pass.doc.loopUid && !pass.doc.loopReady) {
    await cutLoop(pass)
    return answer()
  }
  if (pass.doc.loopUid && !pass.doc.loopReady && (await inspect(pass.doc.loopUid)).ready) {
    learn(pass, { loopReady: true })
  }
  return answer()
}

/**
 * Runs a pass and stores what it learned, recording a failure on the row
 * instead of throwing: the admin panel shows it and the next pass retries.
 * Answers the document as it now stands.
 */
export async function advanceAndStore(
  payload: Payload,
  doc: VideoDoc,
  options: { previousDoc?: VideoDoc; logger?: Logger; req?: PayloadRequest } = {},
): Promise<VideoDoc> {
  const logger = options.logger ?? payload.logger
  let fields: Partial<VideoStreamFields> | null
  try {
    fields = await advanceVideo(doc, { previousDoc: options.previousDoc, logger })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error({ msg: '[Stream] Video pass failed', err, id: doc.id })
    fields = { streamError: message.slice(0, 500) }
  }
  if (!fields) return doc
  await writeVideoFields(payload, doc.id, fields, options.req)
  return { ...doc, ...fields }
}

export type VideoSweepResult = { advanced: number; failed: number }

/**
 * Every video not yet ready, taken one pass further each, when someone runs
 * `scripts/resync-cloudflare-media.ts`: for a video nobody polled to the end
 * (the editor closed the tab) and no webhook reached. Never scheduled. One
 * document at a time, so a Cloudflare rate limit never turns into a burst.
 */
export async function sweepVideos(
  payload: Payload,
  { dryRun = false, logger = payload.logger }: { dryRun?: boolean; logger?: Logger } = {},
): Promise<VideoSweepResult> {
  const result: VideoSweepResult = { advanced: 0, failed: 0 }
  const { docs } = await payload.find({
    collection: 'videos',
    depth: 0,
    limit: 0,
    pagination: false,
    where: { loopReady: { not_equals: true } },
  })
  logger.info({ msg: `[Stream] Video sweep: ${docs.length} in progress`, dryRun })
  for (const doc of docs) {
    const label = `${doc.title ?? doc.filename ?? doc.id} (#${doc.id})`
    if (dryRun) {
      logger.info({ msg: `[Stream] Would advance ${label}, now ${stageOf(doc)}` })
      continue
    }
    const before = stageOf(doc)
    const after = stageOf(await advanceAndStore(payload, doc, { logger }))
    if (after === 'failed') result.failed += 1
    else if (after !== before) result.advanced += 1
    logger.info({ msg: `[Stream] ${label}: ${before} to ${after}` })
  }
  return result
}
