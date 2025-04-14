'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

/**
 * Hook to handle navigation transitions using GSAP for fade in/out effects
 * Compatible with Next.js 15.3's navigation features
 */
export function useTransitionNavigation() {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const transitionElement = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create transition overlay element if it doesn't exist
    if (!transitionElement.current) {
      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100%'
      overlay.style.height = '100%'
      overlay.style.backgroundColor = '#000'
      overlay.style.zIndex = '9999'
      overlay.style.pointerEvents = 'none'
      overlay.style.opacity = '0'
      document.body.appendChild(overlay)
      transitionElement.current = overlay
    }

    // Cleanup function to remove overlay on unmount
    return () => {
      if (transitionElement.current) {
        document.body.removeChild(transitionElement.current)
        transitionElement.current = null
      }
    }
  }, [])

  // This function can be passed to Link's onNavigate prop
  const handleNavigate = useCallback((e: any) => {
    if (!transitionElement.current) return

    // Don't prevent default - let Next.js continue with the navigation
    setIsNavigating(true)

    // Start the fade in animation
    gsap.to(transitionElement.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.inOut',
    })

    // After the page loads, fade out the overlay
    // We'll rely on the Next.js router events to detect when navigation completes
  }, [])

  // Listen for the end of navigation to fade out the overlay
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      if (transitionElement.current) {
        // Fade out overlay
        gsap.to(transitionElement.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsNavigating(false)
          },
        })
      }
    }

    // In Next.js 15.3, we need to use the router events API
    // Simulating this with a timeout for now
    const originalPush = router.push
    router.push = (href: string, options?: any) => {
      handleNavigate({})
      const result = originalPush(href, options)
      setTimeout(handleRouteChangeComplete, 500)
      return result
    }

    return () => {
      router.push = originalPush
    }
  }, [router, handleNavigate])

  // For programmatic navigation (e.g., button clicks)
  const navigate = useCallback(
    (href: string) => {
      if (!transitionElement.current) return router.push(href)

      setIsNavigating(true)

      // Fade in overlay
      gsap.to(transitionElement.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          // Navigate to new page
          router.push(href)
        },
      })
    },
    [router],
  )

  return { isNavigating, navigate, handleNavigate }
}

export default useTransitionNavigation
