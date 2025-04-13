'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import SiteLoader from '@/components/SiteLoader'

// Create context
type LoadingContextType = {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  progress: number
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
  progress: 0,
})

// Export hook as a function to be called inside components
export const useLoading = () => useContext(LoadingContext)

// Provide context
export const LoadingProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const { progress, active } = useProgress()

  // Track loading from multiple sources with a single useEffect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    // Handler for site:loaded event
    const handleSiteLoaded = () => {
      // Wait a short delay for visual smoothness
      timeoutId = setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    // Listen for custom loaded event
    window.addEventListener('site:loaded', handleSiteLoaded)

    // Set maximum loading time failsafe
    const maxLoadingTimeout = setTimeout(() => {
      console.log('Maximum loading time reached, forcing load completion')
      setIsLoading(false)
    }, 8000) // 8 seconds maximum

    // When Three.js reports 100% progress, set loading to complete
    if (progress >= 100 && !active) {
      timeoutId = setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      clearTimeout(maxLoadingTimeout)
      window.removeEventListener('site:loaded', handleSiteLoaded)
    }
  }, [progress, active])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, progress }}>
      {isLoading && <SiteLoader />}
      {children}
    </LoadingContext.Provider>
  )
}

export default LoadingProvider
