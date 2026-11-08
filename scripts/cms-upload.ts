import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { cmsTarget } from './cms-target'

/**
 * Uploads one image or video to the CMS for an agent (docs/mcp.md). MCP
 * cannot carry a binary, so this is the one way an agent adds media. Ported
 * from sas-site; videos added here.
 *
 * It sends the MCP API key the agent already has to `/api/agent/media`
 * (`src/endpoints/agentMedia.ts`), which decides everything about the stored
 * file and needs the key's "Upload media" capability ticked (System, API
 * Keys). This script only reads the flags and the file.
 *
 *   pnpm cms:upload <image> --alt "<text>" [--caption "<text>"] [--local]
 *   pnpm cms:upload <video> [--title "<text>"] [--loop-start <s>] [--loop-length <s>] [--no-wait] [--local]
 *   pnpm cms:upload <video> --loop --alt "<text>" [--caption "<text>"] [--local]
 *
 * An image goes up in the request. A video is too big for a function body, so
 * it takes the admin's road: the server signs a PUT straight to the bucket,
 * the bytes go there, and the row is created from the signed receipt. By
 * default a video becomes a Videos document (full length, plays on click,
 * with a muted loop a block shows under `playVideo: true` and `video: <id>`),
 * and the script polls the Stream pipeline until it is ready, for up to ten
 * minutes, so a page published afterwards shows the loop and not a poster.
 * `--loop` makes it a Media document instead: a short clip that loops whole
 * and muted wherever a `media` field takes it.
 *
 * Env and the site it uploads to: `cms-target.ts`. A local site needs
 * `--local`, because a media id only means something in the database the MCP
 * client is drafting in. Prints the new document id on stdout and nothing
 * else, so it can be captured; the site it went to and the encoding stages
 * are on stderr.
 */

/** Only to label the multipart part or the signed PUT. The server decides the type from the bytes. */
const IMAGE_TYPES: Record<string, string> = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}
const VIDEO_TYPES: Record<string, string> = {
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

/** How long to wait on Stream, and how often to ask (the admin asks every 4 s at first). */
const WAIT_MS = 10 * 60 * 1000
const POLL_MS = 5000

type ErrorBody = { errors?: { message: string }[] } | null

// A declaration, not an arrow: TypeScript only narrows after a `never` call it can resolve by name.
function fail(message: string): never {
  console.error(`cms:upload: ${message}`)
  process.exit(1)
}

const [file, ...rest] = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const index = rest.indexOf(`--${name}`)
  return index === -1 ? undefined : rest[index + 1]
}
const has = (name: string) => rest.includes(`--${name}`)

const USAGE = [
  'usage:',
  '  pnpm cms:upload <image> --alt "<text>" [--caption "<text>"] [--local]',
  '  pnpm cms:upload <video> [--title "<text>"] [--loop-start <s>] [--loop-length <s>] [--no-wait] [--local]',
  '  pnpm cms:upload <video> --loop --alt "<text>" [--caption "<text>"] [--local]',
].join('\n')

if (!file || file.startsWith('--')) fail(USAGE)
const extension = extname(file).toLowerCase()
const imageType = IMAGE_TYPES[extension]
const videoType = VIDEO_TYPES[extension]
if (!imageType && !videoType)
  fail(
    `unsupported file type. Use one of: ${[...Object.keys(IMAGE_TYPES), ...Object.keys(VIDEO_TYPES)].join(', ')}`,
  )

const target = cmsTarget({ local: has('local') })
if (typeof target === 'string') fail(target)
const { headers, key, server } = target
const authorized = { ...headers, Authorization: `Bearer ${key}` }

const bytes = await readFile(file).catch(() => fail(`cannot read ${file}`))
const name = basename(file)

/** The server's error messages, or the status line when it sent none. */
const reason = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as ErrorBody
  return (
    body?.errors?.map((error) => error.message).join('; ') ||
    `${response.status} ${response.statusText}`
  )
}

const post = (path: string, body: BodyInit, extra: Record<string, string> = {}) =>
  fetch(`${server}${path}`, {
    body,
    headers: { ...authorized, ...extra },
    method: 'POST',
  }).catch((error: Error) => fail(`cannot reach ${server}: ${error.message}`))

/** The multipart body the agent endpoint reads: the fields as `_payload`, the file beside them. */
const multipart = (fields: Record<string, unknown>, part?: Blob) => {
  const form = new FormData()
  if (part) form.set('file', part, name)
  form.set('_payload', JSON.stringify(fields))
  return form
}

/** `alt` and `caption` for a Media document: an image, or a muted loop. */
const mediaFields = (what: string) => {
  const alt = flag('alt')?.trim()
  const caption = flag('caption')?.trim()
  if (!alt) fail(`--alt is required: say what the ${what} shows, for someone who cannot see it.`)
  return { alt, ...(caption ? { caption } : {}) }
}

console.error(`cms:upload: to ${server}`)

if (imageType) {
  const response = await post(
    '/api/agent/media',
    multipart(mediaFields('image'), new Blob([new Uint8Array(bytes)], { type: imageType })),
  )
  if (!response.ok) fail(await reason(response))
  const body = (await response.json().catch(() => null)) as {
    cloudflareImageId?: string | null
    id?: number
  } | null
  if (!body?.id) fail('the server accepted the upload but answered without a media id.')
  if (!body.cloudflareImageId)
    console.error(
      `cms:upload: media ${body.id} is in the bucket but did not sync to Cloudflare Images; check the server log for "[Cloudflare] Upload failed".`,
    )
  console.log(body.id)
  process.exit(0)
}

// A video: sign, PUT to the bucket, then create the row from the receipt.
const collection = has('loop') ? 'media' : 'videos'
const fields: Record<string, unknown> =
  collection === 'media'
    ? mediaFields('video')
    : {
        ...(flag('title')?.trim() ? { title: flag('title')?.trim() } : {}),
        loop: {
          ...(flag('loop-start') !== undefined ? { start: Number(flag('loop-start')) } : {}),
          ...(flag('loop-length') !== undefined ? { length: Number(flag('loop-length')) } : {}),
        },
      }
if (collection === 'videos' && flag('alt') !== undefined)
  fail(
    'a full-length video has a title, not alt text: use --title, or --loop --alt for a muted loop.',
  )

const signed = await post(
  `/api/agent/media/${collection}/sign`,
  JSON.stringify({ filename: name, filesize: bytes.length, mimeType: videoType }),
  { 'Content-Type': 'application/json' },
)
if (!signed.ok) fail(await reason(signed))
const ticket = (await signed.json().catch(() => null)) as {
  clientUploadContext?: unknown
  filename?: string
  headers?: Record<string, string>
  url?: string
} | null
if (!ticket?.url || !ticket.clientUploadContext || !ticket.filename)
  fail('the server did not answer with a signed upload URL.')

console.error(`cms:upload: ${bytes.length} bytes to the bucket`)
const put = await fetch(ticket.url, {
  body: new Uint8Array(bytes),
  headers: ticket.headers ?? {},
  method: 'PUT',
}).catch((error: Error) => fail(`cannot reach the bucket: ${error.message}`))
if (!put.ok) fail(`the bucket refused the upload: ${put.status} ${put.statusText}`)

const form = multipart(fields)
form.set(
  'file',
  JSON.stringify({
    clientUploadContext: ticket.clientUploadContext,
    filename: ticket.filename,
    mimeType: videoType,
    size: bytes.length,
  }),
)
const created = await post(`/api/agent/media/${collection}`, form)
if (!created.ok) fail(await reason(created))
const doc = (await created.json().catch(() => null)) as {
  cloudflareStreamUid?: string | null
  id?: number
  label?: string
  stage?: string
} | null
if (!doc?.id) fail('the server accepted the upload but answered without a document id.')

if (collection === 'media') {
  if (!doc.cloudflareStreamUid)
    console.error(
      `cms:upload: media ${doc.id} is in the bucket but did not reach Stream; check the server log for "[Cloudflare] Upload failed".`,
    )
  console.log(doc.id)
  process.exit(0)
}

/**
 * Stream encodes the source, cuts the loop and encodes that in turn, and
 * every status call is one pass along that road (docs/media.md, "Videos").
 * The agent that uploaded the video is the one waiting on it.
 */
let stage = doc.stage ?? 'pending'
console.error(`cms:upload: video ${doc.id}: ${doc.label ?? stage}`)
if (!has('no-wait')) {
  const deadline = Date.now() + WAIT_MS
  while (stage !== 'ready' && stage !== 'failed' && Date.now() < deadline) {
    await sleep(POLL_MS)
    const response = await fetch(`${server}/api/agent/media/videos/${doc.id}/status`, {
      headers: authorized,
    }).catch(() => null)
    const status = (await response?.json().catch(() => null)) as {
      error?: string | null
      label?: string
      stage?: string
    } | null
    if (!status?.stage) continue
    if (status.stage !== stage) console.error(`cms:upload: video ${doc.id}: ${status.label}`)
    stage = status.stage
    if (stage === 'failed')
      fail(`Stream failed on video ${doc.id}: ${status.error ?? 'no reason given'}`)
  }
  if (stage !== 'ready')
    console.error(
      `cms:upload: video ${doc.id} is still encoding after ${WAIT_MS / 60000} minutes; the admin's panel and the Stream webhook finish it. Publish once it reads Ready.`,
    )
}

console.log(doc.id)
