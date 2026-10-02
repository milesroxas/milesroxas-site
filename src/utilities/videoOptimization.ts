/**
 * Video optimization utilities for progressive loading
 */

interface VideoLoadingStrategy {
  preload: 'none' | 'metadata' | 'auto'
  shouldAutoplay: boolean
  shouldLoadSource: boolean
}

/**
 * Determines optimal video loading strategy based on:
 * - Position in page (priority videos)
 * - File size estimates
 * - Device capabilities (connection speed, device memory)
 */
export const getVideoLoadingStrategy = (
  priority: boolean,
  _fileSize?: number,
): VideoLoadingStrategy => {
  // Priority videos load immediately
  if (priority) {
    return {
      preload: 'auto',
      shouldAutoplay: true,
      shouldLoadSource: true,
    }
  }

  // Check device capabilities if available
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } })
    .connection
  const isSlow2G = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'

  // Check if device has limited memory
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const hasLimitedMemory = deviceMemory ? deviceMemory < 4 : false

  // Conservative loading for slow connections or limited memory
  if (isSlow2G || hasLimitedMemory) {
    return {
      preload: 'none',
      shouldAutoplay: false,
      shouldLoadSource: false, // Wait for intersection
    }
  }

  // Standard lazy loading for non-priority videos
  return {
    preload: 'metadata',
    shouldAutoplay: false,
    shouldLoadSource: false, // Wait for intersection
  }
}
