import { MEDIA_OPTIMIZATION_CONFIG } from '@/config/mediaOptimization'

/**
 * Determines loading strategy for media blocks based on position
 * First N media blocks get priority loading (configured), rest are lazy loaded
 */
export const getMediaLoadingStrategy = (index: number, _totalBlocks?: number) => {
  const { PRIORITY_THRESHOLD } = MEDIA_OPTIMIZATION_CONFIG

  // If block is within first few, load with priority
  if (index < PRIORITY_THRESHOLD) {
    return {
      priority: true,
      loading: 'eager' as const,
      enableAnimation: false, // Skip animation for priority content
    }
  }

  // All other blocks use lazy loading with animations
  return {
    priority: false,
    loading: 'lazy' as const,
    enableAnimation: true,
  }
}

/**
 * Determines if a media file is considered "large" based on mime type
 * Large files get extra optimization treatment
 */
export const isLargeMediaFile = (mimeType?: string | null, fileSize?: number | null): boolean => {
  const { LARGE_FILE_THRESHOLD } = MEDIA_OPTIMIZATION_CONFIG

  // Video files are always considered large
  if (mimeType?.includes('video')) {
    return true
  }

  // Files over threshold are considered large
  if (fileSize && fileSize > LARGE_FILE_THRESHOLD) {
    return true
  }

  return false
}

/**
 * Get optimal image sizes based on aspect ratio and container width
 */
export const getOptimalImageSizes = (fullWidth: boolean | null, _aspectRatio?: string | null) => {
  if (fullWidth === true) {
    return '100vw'
  }

  // For contained images, use responsive sizing
  return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
}
