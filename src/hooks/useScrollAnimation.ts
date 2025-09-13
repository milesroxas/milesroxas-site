'use client'

import { useGSAP } from '@gsap/react'
import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap/plugins'

// Small helper to ensure ScrollTriggers are cleaned up when scopes unmount
export const useScrollAnimation = (setup: () => void | (() => void), deps: any[] = []) => {
  useGSAP(() => {
    const cleanup = setup()
    return () => {
      // Kill all ScrollTriggers in this context to avoid leaks
      ScrollTrigger.getAll().forEach((st) => st.kill(true))
      if (typeof cleanup === 'function') cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, { dependencies: deps })

  // Defensive: refresh triggers after mount
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])
}

export default useScrollAnimation

