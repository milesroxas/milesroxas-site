'use client'

import { useLenis as useReactLenis } from '@studio-freight/react-lenis'

/**
 * Hook to access the Lenis instance for smooth scrolling operations
 * @example
 * const lenis = useLenis()
 *
 * // Scroll to a specific element
 * const handleClick = () => {
 *   lenis?.scrollTo('#section-2')
 * }
 *
 * // Scroll to top
 * const scrollToTop = () => {
 *   lenis?.scrollTo(0)
 * }
 */
export const useLenis = () => {
  return useReactLenis()
}
