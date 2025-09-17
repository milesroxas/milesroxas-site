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
export const createLenisScrollTriggerIntegration = (lenis: any) => {
  if (typeof window === 'undefined') return

  gsap.registerPlugin(ScrollTrigger)

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)
}
