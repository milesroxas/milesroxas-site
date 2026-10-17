/**
 * Server-side Cloudflare Images + Stream API utilities.
 * Used in Payload hooks and jobs — never imported on the client.
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4/accounts'

/** Attempts per API call. Network errors, 429 and 5xx retry; any other answer is final. */
const ATTEMPTS = 3
const BACKOFF_MS = 400

function getAccountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!id) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
  return id
}

function getApiToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN is not set')
  return token
}

function getImagesAccountHash(): string {
  const hash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
  if (!hash) throw new Error('CLOUDFLARE_IMAGES_ACCOUNT_HASH is not set')
  return hash
}

function getStreamCustomerSubdomain(): string {
  let subdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
  if (!subdomain) throw new Error('CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN is not set')
  // Normalize: accept full hostname (customer-xxx.cloudflarestream.com) and extract subdomain
  subdomain = subdomain.replace(/^customer-/, '').replace(/\.cloudflarestream\.com.*$/, '')
  return subdomain
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiToken()}`,
  }
}

/** A failure Cloudflare may answer differently next time: no answer at all, rate limit, or its own error. */
export const isTransientStatus = (status: number): boolean => status === 429 || status >= 500

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * `fetch` against the Cloudflare API with bounded retries. `init` is rebuilt
 * per attempt so a `FormData` body is serialized fresh each time.
 */
export async function cloudflareFetch(
  url: string,
  init: () => RequestInit,
  attempts = ATTEMPTS,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, init())
      if (!isTransientStatus(res.status) || attempt === attempts) return res
      lastError = new Error(`Cloudflare answered ${res.status}`)
    } catch (err) {
      lastError = err
      if (attempt === attempts) throw err
    }
    await sleep(BACKOFF_MS * attempt)
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// Cloudflare Images
// ---------------------------------------------------------------------------

interface CloudflareImageResult {
  id: string
  variants: string[]
}

/**
 * Upload an image to Cloudflare Images via URL.
 */
export async function uploadImageToCloudflare(
  imageUrl: string,
  metadata?: Record<string, string>,
): Promise<CloudflareImageResult> {
  const body = () => {
    const formData = new FormData()
    formData.append('url', imageUrl)
    if (metadata) formData.append('metadata', JSON.stringify(metadata))
    return formData
  }

  const res = await cloudflareFetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/images/v1`, () => ({
    method: 'POST',
    headers: authHeaders(),
    body: body(),
  }))

  const json = await res.json()
  if (!json.success) {
    throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(json.errors)}`)
  }

  return {
    id: json.result.id,
    variants: json.result.variants,
  }
}

/**
 * Delete an image from Cloudflare Images. Throws on failure; callers log.
 */
export async function deleteCloudflareImage(imageId: string): Promise<void> {
  const res = await cloudflareFetch(
    `${CLOUDFLARE_API_BASE}/${getAccountId()}/images/v1/${imageId}`,
    () => ({ method: 'DELETE', headers: authHeaders() }),
  )

  const json = await res.json()
  if (!json.success) {
    throw new Error(
      `Cloudflare Images delete failed for ${imageId}: ${JSON.stringify(json.errors)}`,
    )
  }
}

/**
 * Construct a Cloudflare Images delivery URL for a named variant. `public` is
 * the stored one; `cloudflareImageLoader` rewrites it to a flexible variant.
 */
export function getImageDeliveryUrl(imageId: string, variant = 'public'): string {
  return `https://imagedelivery.net/${getImagesAccountHash()}/${imageId}/${variant}`
}

// ---------------------------------------------------------------------------
// Cloudflare Stream
// ---------------------------------------------------------------------------

interface CloudflareStreamResult {
  uid: string
  playbackUrl: string
}

/**
 * Upload a video to Cloudflare Stream via URL (copy).
 */
export async function uploadVideoToStream(
  videoUrl: string,
  metadata?: Record<string, string>,
): Promise<CloudflareStreamResult> {
  const body: Record<string, unknown> = { url: videoUrl }
  if (metadata) {
    body.meta = metadata
  }

  const res = await cloudflareFetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/copy`, () => ({
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }))

  const json = await res.json()
  if (!json.success) {
    throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(json.errors)}`)
  }

  const uid = json.result.uid as string
  return {
    uid,
    playbackUrl: getStreamPlaybackUrl(uid),
  }
}

export interface CloudflareStreamStatus {
  /** Stream has finished encoding and the manifest plays. */
  ready: boolean
  /** Seconds, known once the upload is inspected; `null` while Stream reports -1. */
  duration: number | null
  /** The source's pixel size, known with the duration. */
  width: number | null
  height: number | null
  /** Stream gave up on the file: its own reason, or `null` while it is still working or done. */
  error: string | null
}

/** A Stream `duration`: seconds once known, `-1` or absent before that. */
export function streamDuration(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

/**
 * Whether Stream has finished encoding a video, how long it runs and how big
 * it is, or why Stream gave up on it. Throws when the lookup fails; callers
 * decide whether that is fatal.
 */
export async function getStreamVideoStatus(uid: string): Promise<CloudflareStreamStatus> {
  const res = await cloudflareFetch(
    `${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/${uid}`,
    () => ({
      method: 'GET',
      headers: authHeaders(),
    }),
  )
  const json = await res.json()
  if (!json.success) {
    throw new Error(`Cloudflare Stream lookup failed for ${uid}: ${JSON.stringify(json.errors)}`)
  }
  const result = json.result ?? {}
  const pixels = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
  return {
    ready: result.readyToStream === true,
    duration: streamDuration(result.duration),
    width: pixels(result.input?.width),
    height: pixels(result.input?.height),
    error:
      result.status?.state === 'error'
        ? String(result.status.errorReasonText || result.status.errorReasonCode || 'Stream error')
        : null,
  }
}

/**
 * Cut a new Stream video out of an encoded one, from `startTimeSeconds` to
 * `endTimeSeconds` of the source. Stream encodes the clip like an upload and
 * answers its uid at once; it is ready when the webhook or a status lookup
 * says so. The source has to be ready first.
 */
export async function clipStreamVideo(
  sourceUid: string,
  startTimeSeconds: number,
  endTimeSeconds: number,
  meta?: Record<string, string>,
): Promise<{ uid: string }> {
  const body: Record<string, unknown> = {
    clippedFromVideoUID: sourceUid,
    startTimeSeconds,
    endTimeSeconds,
  }
  if (meta) body.meta = meta

  const res = await cloudflareFetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/clip`, () => ({
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }))

  const json = await res.json()
  if (!json.success) {
    throw new Error(
      `Cloudflare Stream clip failed for ${sourceUid}: ${JSON.stringify(json.errors)}`,
    )
  }
  return { uid: json.result.uid as string }
}

/**
 * Delete a video from Cloudflare Stream. Throws on failure; callers log.
 */
export async function deleteStreamVideo(uid: string): Promise<void> {
  const res = await cloudflareFetch(
    `${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/${uid}`,
    () => ({
      method: 'DELETE',
      headers: authHeaders(),
    }),
  )

  if (!res.ok) {
    throw new Error(`Cloudflare Stream delete failed for ${uid}: ${res.statusText}`)
  }
}

/**
 * Construct the HLS playback URL for a Stream video.
 */
export function getStreamPlaybackUrl(uid: string): string {
  return `https://customer-${getStreamCustomerSubdomain()}.cloudflarestream.com/${uid}/manifest/video.m3u8`
}

/**
 * Construct the thumbnail URL for a Stream video (for poster/placeholder).
 */
export function getStreamThumbnailUrl(uid: string): string {
  return `https://customer-${getStreamCustomerSubdomain()}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`
}
