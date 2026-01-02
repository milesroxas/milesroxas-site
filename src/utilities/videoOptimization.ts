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

/**
 * Preloads a video element in the background
 */
export const preloadVideo = (videoElement: HTMLVideoElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (videoElement.readyState >= 3) {
      resolve()
      return
    }

    const handleCanPlay = () => {
      cleanup()
      resolve()
    }

    const handleError = () => {
      cleanup()
      reject(new Error('Video preload failed'))
    }

    const cleanup = () => {
      videoElement.removeEventListener('canplaythrough', handleCanPlay)
      videoElement.removeEventListener('error', handleError)
    }

    videoElement.addEventListener('canplaythrough', handleCanPlay)
    videoElement.addEventListener('error', handleError)

    videoElement.load()

    // Timeout after 10 seconds
    setTimeout(() => {
      cleanup()
      reject(new Error('Video preload timeout'))
    }, 10000)
  })
}

/**
 * Checks if video is already cached
 */
export const isVideoCached = async (videoUrl: string): Promise<boolean> => {
  if (!('caches' in window)) return false

  try {
    const cache = await caches.open('video-cache')
    const response = await cache.match(videoUrl)
    return !!response
  } catch {
    return false
  }
}
