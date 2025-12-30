'use client'

import { useEffect } from 'react'
import { ensureAnimationsComplete, useAnimationStore } from '@/stores/animationStore'

const HomeTemplateClient = () => {
  const resetAnimations = useAnimationStore((state) => state.resetAnimations)

  // Reset animation state when navigating away from the page
  useEffect(() => {
    // Ensure animations complete after a reasonable timeout
    ensureAnimationsComplete(2500)

    return () => {
      // Clean up animations when page is unmounted
      resetAnimations()
    }
  }, [resetAnimations])

  return null
}

export default HomeTemplateClient
