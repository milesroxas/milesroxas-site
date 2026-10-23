import { parse } from 'node:path'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeValidateHook,
  FieldHook,
  Plugin,
} from 'payload'
import { getStreamPlaybackUrl, getStreamThumbnailUrl } from '@/utilities/cloudflare'
import { stageOf } from './stage'
import { advanceAndStore, purgeVideoStream } from './stream'

/** A title the editor left blank reads as the filename, without its extension or dashes. */
export const defaultTitle: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  const filename = typeof data.filename === 'string' ? data.filename : ''
  if (typeof data.title !== 'string' || !data.title.trim()) {
    const fromFile = parse(filename).name.replace(/[-_]+/g, ' ').trim()
    if (fromFile) data.title = fromFile
  }
  return data
}

/**
 * Takes the saved video one pass along the Stream pipeline in the request
 * that saved it (`advanceVideo`): a new or replaced file is copied to Stream,
 * a moved loop is recut, and a video whose encoding finished since the last
 * save gets its loop. The fields are written to the row in the save's own
 * transaction, with no hook in the loop. A failed request is recorded on the
 * row and the save still succeeds; the admin's status poll retries.
 */
const syncVideoStream: CollectionAfterChangeHook = async ({ context, doc, previousDoc, req }) => {
  // The storage plugin's nested metadata update: the outer save syncs once
  // the file is in the bucket.
  if (context?.skipCloudStorage) return doc
  const next = await advanceAndStore(req.payload, doc, { previousDoc, req })
  Object.assign(doc, next)
  return doc
}

export const purgeVideoStreamOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await purgeVideoStream(doc, req.payload.logger)
}

/**
 * Registers the sync after the storage adapter's `afterChange`, which is what
 * puts a server-side upload in the bucket. Run before it, Stream is asked to
 * fetch a URL that does not exist yet. List it after `s3Storage` in
 * `payload.config.ts`, as `cloudflareMediaSync` is.
 */
export const videoStreamSync = (): Plugin => (config) => ({
  ...config,
  collections: (config.collections ?? []).map((collection) =>
    collection.slug === 'videos'
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [...(collection.hooks?.afterChange ?? []), syncVideoStream],
          },
        }
      : collection,
  ),
})

/**
 * A Stream URL computed at read time from the uid beside it. The helpers
 * throw when `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` is missing (a Vercel
 * preview, say); that never breaks the read.
 */
export const streamUrl =
  (source: 'cloudflareStreamUid' | 'loopUid', kind: 'playback' | 'thumbnail'): FieldHook =>
  ({ siblingData }) => {
    const uid = siblingData?.[source]
    if (typeof uid !== 'string' || !uid) return null
    try {
      return kind === 'playback' ? getStreamPlaybackUrl(uid) : getStreamThumbnailUrl(uid)
    } catch {
      return null
    }
  }

/** The pipeline stage, read from the flags beside it. */
export const stageHook: FieldHook = ({ siblingData }) =>
  stageOf({ id: 0, ...(siblingData as Record<string, unknown>) })
