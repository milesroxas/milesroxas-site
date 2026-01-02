'use client'

import { useEffect, useState } from 'react'
import { useLenis } from './useLenis'

/**
 * Coordinates media loading with scroll state
 * Prevents loading media during fast scrolling for better performance
 */
export const useMediaLoadingCoordination = () => {
  const lenis = useLenis()
  const [isScrolling, setIsScrolling] = useState(false)
  const [shouldDelayLoading, setShouldDelayLoading] = useState(false)

  useEffect(() => {
    if (!lenis) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = (data: { velocity: number }) => {
      setIsScrolling(true)

      // If scrolling fast, delay media loading
      const velocity = Math.abs(data.velocity)
      if (velocity > 2) {
        setShouldDelayLoading(true)
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
        setShouldDelayLoading(false)
      }, 150)
    }

    lenis.on('scroll', handleScroll)

    return () => {
      lenis.off('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [lenis])

  return {
    isScrolling,
    shouldDelayLoading,
  }
}
