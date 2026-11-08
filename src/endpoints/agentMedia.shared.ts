import { APIError } from 'payload'
import { LOOP } from '@/collections/Videos/stage'

/**
 * The pure half of `/api/agent/media` (`agentMedia.ts`): what an agent's
 * request may say, checked before anything is signed or saved. Kept apart from
 * the handlers so it can be tested without Payload, sharp or a database.
 */

/** Media captions are rich text; an uploaded caption is one plain paragraph of it. */
export const paragraph = (value: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: value,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * Where a video may go: `videos` is the full-length video that plays on click
 * (docs/media.md, "Videos"), `media` the short loop that plays whole and muted.
 */
export type VideoCollection = 'media' | 'videos'

export const videoCollectionOf = (value: unknown): VideoCollection | null =>
  value === 'media' || value === 'videos' ? value : null

/**
 * The containers Stream encodes and browsers record: MP4 and M4V, QuickTime,
 * WebM. Checked against the declared type at the sign step and against the
 * bytes once Payload has streamed them back.
 */
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const

/**
 * Payload streams a client upload back into the function's temp directory to
 * check its type against the collection's MIME list (`getFileContentRequirement`
 * answers `full` for any collection with one), and Vercel's `/tmp` holds 500 MB.
 * The admin's uploads have the same ceiling; this one is said out loud.
 */
export const MAX_VIDEO_BYTES = 400 * 1024 * 1024

export const MAX_TITLE = 200

export type SignRequest = {
  collectionSlug: VideoCollection
  filename: string
  filesize: number
  mimeType: (typeof ACCEPTED_VIDEO_TYPES)[number]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * The body of `POST /agent/media/:collection/sign`, checked before the storage
 * adapter signs anything: a filename, a size under the ceiling and one of the
 * accepted video types. The collection comes from the route, never the body.
 */
export function parseSignRequest(body: unknown, collection: VideoCollection): SignRequest {
  if (!isRecord(body))
    throw new APIError('Send JSON with filename, filesize (bytes) and mimeType.', 400)
  const filename = typeof body.filename === 'string' ? body.filename.trim() : ''
  if (!filename) throw new APIError('filename is required.', 400)
  const filesize = body.filesize
  if (typeof filesize !== 'number' || !Number.isInteger(filesize) || filesize <= 0)
    throw new APIError('filesize must be the file size in bytes.', 400)
  if (filesize > MAX_VIDEO_BYTES)
    throw new APIError(`The file is ${filesize} bytes; the ceiling is ${MAX_VIDEO_BYTES}.`, 413)
  const mimeType = ACCEPTED_VIDEO_TYPES.find((type) => type === body.mimeType)
  if (!mimeType)
    throw new APIError(
      `Upload a ${ACCEPTED_VIDEO_TYPES.join(', ')} video. Images go to POST /agent/media.`,
      415,
    )
  return { collectionSlug: collection, filename, filesize, mimeType }
}

/** A loop bound an agent sent, or `undefined` when it sent none. */
function seconds(value: unknown, name: string, min: number, max?: number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const number = typeof value === 'string' ? Number(value) : value
  if (typeof number !== 'number' || !Number.isFinite(number) || number < min)
    throw new APIError(`${name} must be a number of seconds, at least ${min}.`, 400)
  if (max !== undefined && number > max)
    throw new APIError(`${name} must be at most ${max} seconds.`, 400)
  return number
}

export type VideoData = { title?: string; loop?: { start?: number; length?: number } }

/**
 * The Videos fields an agent may set: the title the play button reads out
 * (blank takes the filename, as in the admin) and where the muted loop is cut.
 */
export function parseVideoData(fields: Record<string, unknown>): VideoData {
  if (fields.alt !== undefined)
    throw new APIError(
      'A full-length video has a title, not alt text: send `title`. A muted loop with alt text goes to /agent/media/media.',
      400,
    )
  const title = typeof fields.title === 'string' ? fields.title.trim() : ''
  if (title.length > MAX_TITLE)
    throw new APIError(`title is limited to ${MAX_TITLE} characters.`, 400)
  const loop = isRecord(fields.loop) ? fields.loop : {}
  const start = seconds(loop.start, 'loop.start', 0)
  const length = seconds(loop.length, 'loop.length', LOOP.min, LOOP.max)
  return {
    ...(title ? { title } : {}),
    ...(start !== undefined || length !== undefined
      ? {
          loop: {
            ...(start !== undefined ? { start } : {}),
            ...(length !== undefined ? { length } : {}),
          },
        }
      : {}),
  }
}
