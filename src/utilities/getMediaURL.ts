import type { Media } from '@/payload-types'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (
  url: string | null | undefined | Media | Record<string, unknown>,
  cacheTag?: string | null,
): string | null => {
  // Handle null/undefined
  if (!url) return null

  // Extract URL from Media object if needed
  let urlStr: string
  let cacheSuffix: string | null = cacheTag || null

  if (typeof url === 'object') {
    // Extract URL and use object's updatedAt as cache tag if not provided
    urlStr = (url as { url?: string }).url || ''
    cacheSuffix = cacheSuffix || (url as { updatedAt?: string }).updatedAt || null
  } else {
    urlStr = url
  }

  if (!urlStr) return null

  // Decide whether to preserve absolute URLs (e.g., Vercel Blob public URLs)
  // If the URL is an absolute URL and points to a known external host, keep it as-is
  // Otherwise, normalize to a relative path for same-origin Payload-served media
  let isAbsolute = false
  try {
    const test = new URL(urlStr)
    isAbsolute = !!test.protocol
    // Preserve Vercel Blob public URLs and any non-current-origin absolute URLs
    // We only strip origin for our own domain to avoid mixed-origin issues
    const knownExternalHost = test.hostname.endsWith('public.blob.vercel-storage.com')
    if (!knownExternalHost) {
      // For non-external absolute URLs, convert to relative to be origin-agnostic
      urlStr = test.pathname + test.search + test.hash
      isAbsolute = false
    }
  } catch (_) {
    // not a valid absolute URL; treat as relative
  }

  // Ensure relative URLs start with /
  if (!isAbsolute && !urlStr.startsWith('/')) {
    urlStr = '/' + urlStr
  }

  // Append cache tag if provided
  if (cacheSuffix) {
    // Respect existing query parameters
    const hasQuery = urlStr.includes('?')
    const separator = hasQuery ? '&' : '?'
    return `${urlStr}${separator}v=${encodeURIComponent(cacheSuffix)}`
  }
  return urlStr
}
