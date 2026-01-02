/**
 * Smart media preloading utilities for performance optimization
 */

import type { Media } from '@/payload-types'

/**
 * Preloads critical images using link preload
 * Should be called for above-the-fold content
 */
export const preloadCriticalImage = (media: Media | string | number | null) => {
  if (typeof window === 'undefined') return
  if (!media || typeof media !== 'object') return

  const { url, mimeType } = media

  if (!url || mimeType?.includes('video')) return

  // Check if already preloaded
  const existingLink = document.querySelector(`link[href="${url}"]`)
  if (existingLink) return

  // Create preload link
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = url
  link.fetchPriority = 'high'

  document.head.appendChild(link)
}

/**
 * Preloads multiple media resources in order of priority
 */
export const preloadMediaBatch = (mediaItems: Array<Media | null>, maxPreloads: number = 3) => {
  const validMedia = mediaItems.filter(
    (item): item is Media => item !== null && typeof item === 'object',
  )
  const toPreload = validMedia.slice(0, maxPreloads)

  for (const media of toPreload) {
    preloadCriticalImage(media)
  }
}

/**
 * Generates optimized srcset for responsive images
 */
export const generateOptimizedSrcSet = (media: Media): string => {
  if (!media.sizes) return media.url || ''

  const sizes = Object.entries(media.sizes)
    .filter(
      ([_, value]) => value && typeof value === 'object' && 'url' in value && 'width' in value,
    )
    .map(([_, value]) => {
      const sizeValue = value as { url?: string | null; width?: number | null }
      return sizeValue.url && sizeValue.width ? `${sizeValue.url} ${sizeValue.width}w` : null
    })
    .filter((item): item is string => item !== null)

  return sizes.join(', ')
}

/**
 * Estimates time to load media based on connection and file size
 */
export const estimateLoadTime = (fileSize: number): number => {
  const connection = (navigator as Navigator & { connection?: { downlink?: number } }).connection
  const downlink = connection?.downlink || 10 // Default to 10 Mbps

  // Convert Mbps to bytes per second, then calculate time
  const bytesPerSecond = (downlink * 1000000) / 8
  const estimatedSeconds = fileSize / bytesPerSecond

  return Math.ceil(estimatedSeconds)
}

/**
 * Check if user prefers reduced data
 */
export const prefersReducedData = (): boolean => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}
