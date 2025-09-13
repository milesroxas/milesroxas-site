'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTransitionStore } from '@/stores/transitionStore'

export interface TransitionOptions {
  duration?: number
  ease?: string
  onStart?: () => void
  onComplete?: () => void
}

const supportsViewTransitions = () => typeof (document as any).startViewTransition === 'function'
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const usePageTransition = (options?: TransitionOptions) => {
  const router = useRouter()
  const setPhase = useTransitionStore((s) => s.setPhase)

  const navigate = useCallback(
    async (href: string) => {
      const start = options?.onStart
      const complete = options?.onComplete

      if (prefersReducedMotion()) {
        start?.()
        router.push(href)
        complete?.()
        return
      }

      if (supportsViewTransitions()) {
        setPhase('preparing')
        start?.()
        // @ts-expect-error startViewTransition is experimental
        await (document as any).startViewTransition(() => {
          setPhase('animating')
          router.push(href)
        })
        setPhase('complete')
        complete?.()
      } else {
        // Fallback: immediate navigation (could be extended with a simple fade)
        start?.()
        router.push(href)
        complete?.()
      }
    },
    [options?.onStart, options?.onComplete, router, setPhase],
  )

  return {
    navigate,
  }
}

export default usePageTransition

