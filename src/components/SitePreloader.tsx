'use client'

import React, { useEffect } from 'react'
import { useLoading } from '@/providers/LoadingProvider'

// This component ensures initial content gets loaded before showing the page
export const SitePreloader: React.FC = () => {
  const { setIsLoading } = useLoading()

  useEffect(() => {
    // Set initial loading state
    setIsLoading(true)

    // Listen for initial page load
    const handleLoad = () => {
      // If site:loaded hasn't been triggered by the texture loading,
      // we'll trigger it after a timeout
      const initialLoadTimeout = setTimeout(() => {
        // Only dispatch if we're in the browser
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('site:loaded'))
        }
      }, 1000)

      return () => clearTimeout(initialLoadTimeout)
    }

    // Add load event listener
    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [setIsLoading])

  return null
}

export default SitePreloader
