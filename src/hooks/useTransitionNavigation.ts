'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLenis } from '@studio-freight/react-lenis'
import gsap from 'gsap'

// Define the type again
type TransitionConfig = {
  duration?: number
  exitAnimation?: (element: HTMLElement, done: () => void) => void
  enterAnimation?: (element: HTMLElement, done: () => void) => void
  scrollTo?: 'top' | 'maintain' | number
  preventDuplicateTransitions?: boolean
}

/**
 * Hook to handle navigation transitions with GSAP animations
 * Compatible with Next.js 15.3's navigation features and Lenis
 */
export function useTransitionNavigation({
  duration = 0.5,
  exitAnimation,
  enterAnimation,
  scrollTo = 'top',
  preventDuplicateTransitions = true,
}: TransitionConfig = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const lenis = useLenis()

  const [isNavigating, setIsNavigating] = useState(true)
  const containerRef = useRef<HTMLElement | null>(null)
  const isTransitioningRef = useRef(false)
  const scrollPositions = useRef<Record<string, number>>({})
  const gsapContextRef = useRef<gsap.Context | null>(null)
  const justNavigatedProgrammaticallyRef = useRef(false)

  // Initialize GSAP context
  useEffect(() => {
    gsapContextRef.current = gsap.context(() => {})

    return () => {
      // Clean up GSAP context
      if (gsapContextRef.current) {
        gsapContextRef.current.clear()
        gsapContextRef.current.revert()
        gsapContextRef.current = null
      }
    }
  }, [])

  // Store the current scroll position
  useEffect(() => {
    if (lenis && pathname) {
      // Store current scroll position when pathname changes
      scrollPositions.current[pathname] = lenis.scroll
    }
  }, [lenis, pathname])

  // Default GSAP exit animation with performance optimizations
  const defaultExitAnimation = useCallback(
    (element: HTMLElement, done: () => void) => {
      if (gsapContextRef.current) {
        gsapContextRef.current.add(() => {
          gsap.to(element, {
            opacity: 0,
            y: -20,
            duration,
            clearProps: 'all', // Important for performance
            onComplete: () => {
              done()
            },
          })
        })
      } else {
        // Fallback if context is not available
        gsap.to(element, {
          opacity: 0,
          y: -20,
          duration,
          clearProps: 'all',
          onComplete: done,
        })
      }
    },
    [duration],
  )

  // Default GSAP enter animation with performance optimizations
  const defaultEnterAnimation = useCallback(
    (element: HTMLElement, done: () => void) => {
      if (gsapContextRef.current) {
        gsapContextRef.current.add(() => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration,
              clearProps: 'all',
              onComplete: () => {
                done()
              },
            },
          )
        })
      } else {
        // Fallback if context is not available
        gsap.fromTo(
          element,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration,
            clearProps: 'all',
            onComplete: done,
          },
        )
      }
    },
    [duration],
  )

  // Use provided animations or defaults
  const runExitAnimation = exitAnimation || defaultExitAnimation
  const runEnterAnimation = enterAnimation || defaultEnterAnimation

  // Function to set container reference
  const setContainerRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node
  }, [])

  // Handle initial page load animation
  useEffect(() => {
    if (containerRef.current && isNavigating) {
      const element = containerRef.current

      // Run enter animation after initial load
      runEnterAnimation(element, () => {
        setIsNavigating(false)
      })
    }
  }, [containerRef, isNavigating, runEnterAnimation])

  // Handle URL changes and trigger enter animations
  useEffect(() => {
    // Check if navigation was triggered programmatically by this hook
    if (justNavigatedProgrammaticallyRef.current) {
      justNavigatedProgrammaticallyRef.current = false // Reset the flag
      return // Skip enter animation for this render
    }

    // Only run enter animation if container is available and NOT the initial load
    // The initial load animation is handled by the previous useEffect
    if (containerRef.current && !isNavigating) {
      const element = containerRef.current

      // Run enter animation and explicitly set isNavigating to false on completion
      runEnterAnimation(element, () => {
        setIsNavigating(false)
      })

      // Handle scroll restoration based on config
      if (lenis) {
        if (scrollTo === 'top') {
          lenis.scrollTo(0, { immediate: true })
        } else if (scrollTo === 'maintain') {
          const savedPosition = scrollPositions.current[pathname]
          if (savedPosition !== undefined) {
            lenis.scrollTo(savedPosition, { immediate: true })
          }
        } else if (typeof scrollTo === 'number') {
          lenis.scrollTo(scrollTo, { immediate: true })
        }
      }
    }
  }, [pathname, runEnterAnimation, lenis, scrollTo, isNavigating])

  // Handle navigation via Link's onNavigate
  const handleNavigate = useCallback(
    (e: React.MouseEvent) => {
      if (preventDuplicateTransitions && isTransitioningRef.current) {
        // Prevent parallel transitions
        e.preventDefault()
        return
      }

      if (containerRef.current) {
        const element = containerRef.current
        isTransitioningRef.current = true

        // Store current scroll position before leaving
        if (lenis) {
          scrollPositions.current[pathname] = lenis.scroll
        }

        // Prevent immediate navigation to ensure exit animation completes
        e.preventDefault()

        // Run exit animation then navigate
        runExitAnimation(element, () => {
          // Get the path from the event target
          const target = e.currentTarget as HTMLAnchorElement
          const href = target.getAttribute('href') || '/'

          // Set navigating state TRUE right before push
          setIsNavigating(true)

          // Navigate after the exit animation completes
          justNavigatedProgrammaticallyRef.current = true // Set flag before programmatic navigation
          router.push(href)
        })
      }
    },
    [router, runExitAnimation, lenis, pathname, preventDuplicateTransitions],
  )

  // For programmatic navigation
  const navigate = useCallback(
    (href: string) => {
      if (preventDuplicateTransitions && isTransitioningRef.current) return

      if (containerRef.current) {
        const element = containerRef.current
        isTransitioningRef.current = true

        // Store current scroll position before leaving
        if (lenis) {
          scrollPositions.current[pathname] = lenis.scroll
        }

        // Run exit animation then navigate
        runExitAnimation(element, () => {
          // Set navigating state TRUE right before push
          setIsNavigating(true)
          justNavigatedProgrammaticallyRef.current = true // Set flag before programmatic navigation
          router.push(href)
        })
      } else {
        // If no container ref, just navigate
        router.push(href)
      }
    },
    [router, runExitAnimation, lenis, pathname, preventDuplicateTransitions],
  )

  return {
    isNavigating,
    navigate,
    handleNavigate,
    setContainerRef,
  }
}

export default useTransitionNavigation
