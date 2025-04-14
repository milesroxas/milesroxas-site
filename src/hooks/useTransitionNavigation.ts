'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to handle navigation transitions for page content fades
 * Compatible with Next.js 15.3's navigation features
 */
export function useTransitionNavigation() {
  const [isNavigating, setIsNavigating] = useState(true)
  const router = useRouter()

  // Set isNavigating to false after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // This function can be passed to Link's onNavigate prop
  const handleNavigate = useCallback((e: any) => {
    // Don't prevent default - let Next.js continue with the navigation
    setIsNavigating(true)
  }, [])

  // Listen for the end of navigation to update state
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      // Keep this short but non-zero to ensure React has time to render the new page
      setTimeout(() => {
        setIsNavigating(false)
      }, 50)
    }

    // In Next.js 15.3, we need to use the router events API
    // Simulating this with a timeout for now
    const originalPush = router.push
    router.push = (href: string, options?: any) => {
      handleNavigate({})
      const result = originalPush(href, options)
      // Increase this timeout to ensure the new page content is ready before fading in
      setTimeout(handleRouteChangeComplete, 600)
      return result
    }

    return () => {
      router.push = originalPush
    }
  }, [router, handleNavigate])

  // For programmatic navigation (e.g., button clicks)
  const navigate = useCallback(
    (href: string) => {
      setIsNavigating(true)
      // Navigate to new page
      router.push(href)
    },
    [router],
  )

  return { isNavigating, navigate, handleNavigate }
}

export default useTransitionNavigation
