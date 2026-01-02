'use client'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Debounced ScrollTrigger refresh utility
 * Prevents excessive refreshes when multiple media items load
 */
let refreshTimeout: NodeJS.Timeout | null = null
let _refreshCount = 0
const _MAX_REFRESHES_PER_BATCH = 5

/**
 * Request a ScrollTrigger refresh with debouncing
 * Multiple calls within a short time will be batched
 */
export const requestScrollTriggerRefresh = (delay: number = 100) => {
  if (typeof window === 'undefined') return

  // Clear existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
  }

  _refreshCount++

  // Batch refreshes
  refreshTimeout = setTimeout(() => {
    ScrollTrigger.refresh()
    _refreshCount = 0
    refreshTimeout = null
  }, delay)
}

/**
 * Force immediate ScrollTrigger refresh
 * Use sparingly - prefer requestScrollTriggerRefresh for better performance
 */
export const forceScrollTriggerRefresh = () => {
  if (typeof window === 'undefined') return
  ScrollTrigger.refresh()
}

/**
 * Refresh ScrollTrigger after all images in container have loaded
 */
export const refreshAfterImagesLoad = (container: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = container.querySelectorAll('img')

    if (images.length === 0) {
      resolve()
      return
    }

    let loadedCount = 0
    const totalImages = images.length

    const checkComplete = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        requestScrollTriggerRefresh()
        resolve()
      }
    }

    for (const img of Array.from(images)) {
      if (img.complete) {
        checkComplete()
      } else {
        img.addEventListener('load', checkComplete)
        img.addEventListener('error', checkComplete) // Also count errors
      }
    }
  })
}
