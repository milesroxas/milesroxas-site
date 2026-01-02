'use client'

import { useEffect } from 'react'
import type { Media } from '@/payload-types'
import { prefersReducedData, preloadMediaBatch } from '@/utilities/mediaPreloading'

interface MediaPreloaderProps {
  mediaItems: Array<Media | null>
  maxPreloads?: number
}

/**
 * Client component that preloads critical media in the background
 * Respects user preferences for reduced data
 */
export const MediaPreloader: React.FC<MediaPreloaderProps> = ({ mediaItems, maxPreloads = 2 }) => {
  useEffect(() => {
    // Respect data saver mode
    if (prefersReducedData()) {
      return
    }

    // Preload critical media after a short delay to not block initial render
    const timeoutId = setTimeout(() => {
      preloadMediaBatch(mediaItems, maxPreloads)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [mediaItems, maxPreloads])

  return null
}
