import type { Media } from '@/payload-types'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (
  url: string | null | undefined | Media | { url?: string; updatedAt?: string },
  cacheTag?: string | null,
): string | null => {
  // Handle null/undefined
  if (!url) return null

  // Extract URL from Media object if needed
  let urlStr: string
  let cacheSuffix: string | null = cacheTag || null

  if (typeof url === 'object') {
    // Extract URL and use object's updatedAt as cache tag if not provided
    urlStr = url.url || ''
    cacheSuffix = cacheSuffix || url.updatedAt || null
  } else {
    urlStr = url
  }

  if (!urlStr) return null

  // Important: Always use relative URLs for consistency between server and client
  // Strip any existing protocol and domain
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    // Extract just the path portion
    try {
      const urlObj = new URL(urlStr)
      urlStr = urlObj.pathname + urlObj.search + urlObj.hash
    } catch (_ignore) {
      // If URL parsing fails, just use the original
    }
  }

  // Ensure URL starts with /
  if (!urlStr.startsWith('/')) {
    urlStr = '/' + urlStr
  }

  // Append cache tag if provided
  return cacheSuffix ? `${urlStr}?${cacheSuffix}` : urlStr
}
