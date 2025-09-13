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

type StartViewTransition = (cb: () => void | Promise<void>) => Promise<void>
const getDocWithViewTransitions = () =>
  document as Document & { startViewTransition?: StartViewTransition }

const supportsViewTransitions = () =>
  typeof getDocWithViewTransitions().startViewTransition === 'function'
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
        await getDocWithViewTransitions().startViewTransition!(
          () => {
          setPhase('animating')
          router.push(href)
          },
        )
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
