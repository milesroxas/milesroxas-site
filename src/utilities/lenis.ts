'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type LenisLike = {
  on: (event: 'scroll', cb: () => void) => void
  off?: (event: 'scroll', cb?: () => void) => void
  raf: (time: number) => void
}

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
export const createLenisScrollTriggerIntegration = (lenis: LenisLike) => {
  const instance = lenis
  if (typeof window === 'undefined') return

  gsap.registerPlugin(ScrollTrigger)

  instance.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    instance.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)
}
