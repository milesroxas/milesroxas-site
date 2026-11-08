import crypto from 'node:crypto'
import { parse } from 'node:path'
import {
  APIError,
  addDataAndFileToRequest,
  type Endpoint,
  type PayloadHandler,
  type PayloadRequest,
} from 'payload'
import sharp from 'sharp'
import { videoStatus } from '@/collections/Videos/status'
import { advanceAndStore } from '@/collections/Videos/stream'
import type { User } from '@/payload-types'
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  paragraph,
  parseSignRequest,
  parseVideoData,
  type VideoCollection,
  videoCollectionOf,
} from './agentMedia.shared'

/**
 * `/api/agent/media`: the one way an agent adds media, and the one place that
 * decides what an agent upload becomes. Ported from sas-site; docs/mcp.md and
 * `scripts/cms-upload.ts` point here instead of restating it.
 *
 * MCP tools cannot carry a binary, and an MCP key fails every team-only REST
 * rule by design (`access/authenticated.ts`), so plain `POST /api/media` is
 * closed to it. These endpoints are the narrow door instead of a wider rule.
 *
 * They authenticate the way `/api/mcp` does: `Authorization: Bearer <key>`,
 * looked up by its HMAC index, then act as the team member the key is linked
 * to with access control on. They also need their own capability on the key,
 * `uploadMedia`, off by default like every other capability: a key that can
 * read media cannot add it until a team member says so.
 *
 * Images: `POST /agent/media`, multipart. Everything that matters is decided
 * here, not in the client: alt text is required, the bytes must decode as an
 * allowed image type whatever the request claims, and the image is stored as
 * WebP (which compresses it and drops EXIF, GPS and every other metadata
 * block). The Media hooks then sync it to Cloudflare like any upload from the
 * admin.
 *
 * Videos: too big for a function body (4.5 MB on Vercel), so they take the
 * admin's own road, a presigned PUT straight to the bucket (docs/media.md).
 * `POST /agent/media/:collection/sign` mints the URL through the storage
 * adapter's handler, the client PUTs the bytes, and `POST
 * /agent/media/:collection` creates the row from the signed receipt, which
 * Payload verifies and whose bytes it streams back to check the type. The
 * `videos` collection is the full-length video that plays on click; `media`
 * holds the short muted loop. `GET /agent/media/videos/:id/status` runs one
 * pass of the Stream pipeline, so an agent can carry a video to ready the way
 * the admin's status poll does.
 */

/** The key collection the MCP plugin creates (`plugins/mcp.ts`). */
const API_KEYS = 'payload-mcp-api-keys'

/** Screenshots and figures. Anything heavier is a video, which has its own road below. */
const MAX_BYTES = 8 * 1024 * 1024
const MAX_ALT = 300
const MAX_CAPTION = 300

/** What the bytes may decode as. Every one is stored as WebP. */
const ACCEPTED = ['jpeg', 'png', 'webp'] as const

/**
 * sas-site's setting, measured on its Lab screenshots (2026-09-21): 86%
 * smaller than the PNG and JPEG sources, and small grey UI text still matches
 * the source at 2x zoom. `smartSubsample` keeps coloured text and hairlines sharp.
 */
const WEBP = { quality: 85, smartSubsample: true } as const

/** The storage adapter's own signed-URL endpoint (`@payloadcms/storage-s3`). */
const SIGNED_URL_PATH = '/storage-s3-generate-signed-url'

/**
 * The team member a key acts as, if the key exists and may upload. Same lookup
 * as the MCP plugin's own (`resolveAccessSettings`): the key is never stored
 * in the clear, only its HMAC under the Payload secret.
 */
async function uploaderFor(req: PayloadRequest): Promise<User> {
  const header = req.headers.get('Authorization')
  const key = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!key) throw new APIError('Send the MCP API key as "Authorization: Bearer <key>".', 401)

  const apiKeyIndex = crypto.createHmac('sha256', req.payload.secret).update(key).digest('hex')
  const { docs } = await req.payload.find({
    collection: API_KEYS,
    depth: 1,
    limit: 1,
    pagination: false,
    where: { apiKeyIndex: { equals: apiKeyIndex } },
  })
  const [apiKey] = docs
  const user = apiKey?.user
  if (!apiKey || !user || typeof user !== 'object') throw new APIError('Unknown API key.', 401)
  if (apiKey.uploadMedia !== true)
    throw new APIError(
      'This key may not upload media. A team member can allow it on the key: System, API Keys, "Upload media".',
      403,
    )
  return { ...user, collection: 'users' }
}

/**
 * From here on the request is the linked team member's, as it is at
 * `/api/mcp`: access control, the hooks and validation all apply, and a
 * client-upload receipt is bound to this user.
 */
async function actAsUploader(req: PayloadRequest): Promise<void> {
  req.user = await uploaderFor(req)
}

/** A short plain-text input, trimmed; empty when absent or not a string. */
const text = (value: unknown, max: number, name: string): string => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (trimmed.length > max) throw new APIError(`${name} is limited to ${max} characters.`, 400)
  return trimmed
}

/** The media fields an agent may set: alt text, required, and one plain paragraph of caption. */
function mediaData(data: Record<string, unknown>, what: string) {
  const altText = text(data.alt, MAX_ALT, 'alt')
  if (!altText)
    throw new APIError(
      `alt is required: say what the ${what} shows, for someone who cannot see it.`,
      400,
    )
  const captionText = text(data.caption, MAX_CAPTION, 'caption')
  return { alt: altText, ...(captionText ? { caption: paragraph(captionText) } : {}) }
}

/**
 * The upload as clean WebP. Whether it is an image at all comes from decoding
 * the bytes, never from the filename or the declared mimetype. Re-encoding is
 * what compresses it and what strips the metadata: sharp writes none unless
 * asked to keep it.
 */
async function cleanImage(file: {
  data: Buffer
  name: string
}): Promise<{ data: Buffer; mimetype: string; name: string }> {
  if (file.data.length > MAX_BYTES)
    throw new APIError(`The file is ${file.data.length} bytes; the ceiling is ${MAX_BYTES}.`, 413)
  const { format } = await sharp(file.data)
    .metadata()
    .catch(() => ({ format: undefined }))
  if (!ACCEPTED.some((accepted) => accepted === format))
    throw new APIError(
      `Upload a ${ACCEPTED.join(', ')} image. A video goes through the sign step (docs/mcp.md).`,
      415,
    )
  // `rotate()` bakes the EXIF orientation in before the tag is dropped.
  const data = await sharp(file.data).rotate().webp(WEBP).toBuffer()
  return { data, mimetype: 'image/webp', name: `${parse(file.name).name || 'upload'}.webp` }
}

const imageUpload: PayloadHandler = async (req) => {
  await actAsUploader(req)
  await addDataAndFileToRequest(req)

  const data = mediaData((req.data ?? {}) as Record<string, unknown>, 'image')
  if (!req.file) throw new APIError('Send the image as the multipart field "file".', 400)

  const clean = await cleanImage(req.file)
  const media = await req.payload.create({
    collection: 'media',
    // Only the fields named here are ever read from the request.
    data,
    // Built from the clean bytes alone: a spread `tempFilePath` would make
    // Payload read the original upload from disk instead.
    file: { ...clean, size: clean.data.length },
    overrideAccess: false,
    req,
  })
  // Null when the Cloudflare sync failed; the server log has the reason.
  return Response.json(
    { id: media.id, cloudflareImageId: media.cloudflareImageId ?? null },
    { status: 201 },
  )
}

/** The collection a video route names, or a 404 for anything else. */
const collectionParam = (req: PayloadRequest): VideoCollection => {
  const collection = videoCollectionOf(req.routeParams?.collection)
  if (!collection)
    throw new APIError('Videos go to /agent/media/videos or /agent/media/media.', 404)
  return collection
}

/**
 * A presigned PUT for one video, from the storage adapter's own handler so
 * the key, the deduplicated filename and the signed receipt are the ones the
 * admin's uploads get. The handler reads the body itself, so the validated
 * one is handed back to it; the collection is checked against the route
 * before anything is signed, and the receipt it signs names the key's user.
 */
const signVideoUpload: PayloadHandler = async (req) => {
  const collection = collectionParam(req)
  await actAsUploader(req)
  const body = parseSignRequest(await req.json?.().catch(() => null), collection)
  const signer = req.payload.config.endpoints.find(
    (endpoint) => endpoint.method === 'post' && endpoint.path === SIGNED_URL_PATH,
  )
  if (!signer)
    throw new APIError('The storage adapter has no client-upload endpoint registered.', 500)
  req.json = async () => body
  return signer.handler(req)
}

/**
 * The row for a video the client has put in the bucket. Payload reads the
 * `file` field as a client upload: it verifies the receipt against this user
 * and collection, streams the object back to check its type against the
 * collection's MIME list, and the storage adapter leaves the bytes where they
 * are. The after-change hooks then start the Stream pipeline.
 */
const commitVideoUpload: PayloadHandler = async (req) => {
  const collection = collectionParam(req)
  await actAsUploader(req)
  await addDataAndFileToRequest(req)

  const file = req.file
  if (!file?.clientUploadContext)
    throw new APIError(
      'Send the signed upload as the multipart field "file": a JSON string with filename, mimeType, size and the clientUploadContext the sign step answered.',
      400,
    )
  if (!ACCEPTED_VIDEO_TYPES.includes(file.mimetype as (typeof ACCEPTED_VIDEO_TYPES)[number]))
    throw new APIError(`Upload a ${ACCEPTED_VIDEO_TYPES.join(', ')} video.`, 415)
  if (file.size > MAX_VIDEO_BYTES)
    throw new APIError(`The file is ${file.size} bytes; the ceiling is ${MAX_VIDEO_BYTES}.`, 413)

  const fields = (req.data ?? {}) as Record<string, unknown>
  if (collection === 'videos') {
    const video = await req.payload.create({
      collection: 'videos',
      // A blank title takes the filename in `defaultTitle`, as it does in the admin.
      data: { title: '', ...parseVideoData(fields) },
      file,
      overrideAccess: false,
      req,
    })
    return Response.json({ id: video.id, collection, ...videoStatus(video) }, { status: 201 })
  }
  const media = await req.payload.create({
    collection: 'media',
    data: mediaData(fields, 'video'),
    file,
    overrideAccess: false,
    req,
  })
  // Null when the Stream copy failed; the server log has the reason.
  return Response.json(
    { id: media.id, collection, cloudflareStreamUid: media.cloudflareStreamUid ?? null },
    { status: 201 },
  )
}

/**
 * One pass of the Stream pipeline for an agent's video, the way the admin's
 * status poll (`videos/:id/status`, team members only) is for the editor's.
 * The agent that uploaded a video is the one waiting on it, so its polling is
 * what carries the video to ready where no webhook lands.
 */
const videoUploadStatus: PayloadHandler = async (req) => {
  await actAsUploader(req)
  const id = Number(req.routeParams?.id)
  if (!Number.isInteger(id)) throw new APIError('Not found.', 404)
  const doc = await req.payload.findByID({
    collection: 'videos',
    id,
    depth: 0,
    disableErrors: true,
    overrideAccess: false,
    req,
  })
  if (!doc) throw new APIError('Not found.', 404)
  return Response.json(videoStatus(await advanceAndStore(req.payload, doc)))
}

export const agentMediaEndpoints: Endpoint[] = [
  { path: '/agent/media', method: 'post', handler: imageUpload },
  { path: '/agent/media/:collection/sign', method: 'post', handler: signVideoUpload },
  { path: '/agent/media/:collection', method: 'post', handler: commitVideoUpload },
  { path: '/agent/media/videos/:id/status', method: 'get', handler: videoUploadStatus },
]
