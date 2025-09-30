'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Creates a scroll integration between Lenis and GSAP ScrollTrigger
 * Call this in a component using useEffect when you want to integrate both libraries
 *
 * @example
 * // In a component:
 * const lenis = useLenis()
 *
 * useEffect(() => {
 *   if (!lenis) return
 *
 *   createLenisScrollTriggerIntegration(lenis)
 *
 *   // Cleanup when component unmounts
 *   return () => {
 *     lenis.off('scroll')
 *   }
 * }, [lenis])
 */
type LenisLike = {
  on: (event: string, cb: (...args: unknown[]) => void) => void
  raf: (time: number) => void
}

const isLenisLike = (value: unknown): value is LenisLike => {
  return (
    !!value &&
    typeof (value as { on?: unknown }).on === 'function' &&
    typeof (value as { raf?: unknown }).raf === 'function'
  )
}

export const createLenisScrollTriggerIntegration = (lenis: unknown): void => {
  if (typeof window === 'undefined') return
  if (!isLenisLike(lenis)) return

  gsap.registerPlugin(ScrollTrigger)

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)
}
