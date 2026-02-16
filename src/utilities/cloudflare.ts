/**
 * Server-side Cloudflare Images + Stream API utilities.
 * Used in Payload hooks — never imported on the client.
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4/accounts'

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
  const subdomain = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
  if (!subdomain) throw new Error('CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN is not set')
  return subdomain
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiToken()}`,
  }
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
  const formData = new FormData()
  formData.append('url', imageUrl)
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const res = await fetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/images/v1`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })

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
 * Delete an image from Cloudflare Images.
 */
export async function deleteCloudflareImage(imageId: string): Promise<void> {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/images/v1/${imageId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  const json = await res.json()
  if (!json.success) {
    console.error(`Cloudflare Images delete failed for ${imageId}:`, json.errors)
  }
}

/**
 * Construct a Cloudflare Images delivery URL with flexible variants.
 * @param imageId - The Cloudflare image ID
 * @param variant - Variant string like "w=1920,q=85,f=auto" or a named variant
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

  const res = await fetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/copy`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

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

/**
 * Check the processing status of a Stream video.
 */
export async function getVideoStatus(
  uid: string,
): Promise<{ ready: boolean; duration: number; thumbnail: string }> {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/${uid}`, {
    method: 'GET',
    headers: authHeaders(),
  })

  const json = await res.json()
  if (!json.success) {
    throw new Error(`Cloudflare Stream status check failed: ${JSON.stringify(json.errors)}`)
  }

  return {
    ready: json.result.readyToStream === true,
    duration: json.result.duration ?? 0,
    thumbnail: json.result.thumbnail ?? '',
  }
}

/**
 * Delete a video from Cloudflare Stream.
 */
export async function deleteStreamVideo(uid: string): Promise<void> {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/${getAccountId()}/stream/${uid}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!res.ok) {
    console.error(`Cloudflare Stream delete failed for ${uid}: ${res.statusText}`)
  }
}

/**
 * Construct the HLS playback URL for a Stream video.
 */
export function getStreamPlaybackUrl(uid: string): string {
  return `https://customer-${getStreamCustomerSubdomain()}.cloudflarestream.com/${uid}/manifest/video.m3u8`
}
