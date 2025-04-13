'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { cn } from '@/utilities/ui'
import { useLoading } from '@/providers/LoadingProvider'

export const SiteLoader: React.FC = () => {
  const { progress, active } = useProgress()
  const { isLoading } = useLoading()
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [smoothProgress, setSmoothProgress] = useState(0)
  const animationRef = useRef<number | undefined>(undefined)

  // Smoothly animate progress bar
  useEffect(() => {
    // Gradually animate progress to match actual progress
    if (progress > smoothProgress) {
      const animate = () => {
        setSmoothProgress((prev) => {
          // Get closer to actual progress value with easing
          const diff = progress - prev
          const increment = Math.max(0.5, diff * 0.05)
          const newValue = Math.min(progress, prev + increment)

          if (Math.abs(newValue - progress) < 0.5) {
            return progress // Snap to exact value when close enough
          }

          // Continue animation
          animationRef.current = requestAnimationFrame(animate)
          return newValue
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [progress, smoothProgress])

  // Handle fade-out animation when loading completes
  useEffect(() => {
    if (!isLoading && visible) {
      // Make sure progress shows 100% before fading out
      setSmoothProgress(100)

      // Start fade out animation after a short delay
      const prepareTimer = setTimeout(() => {
        setFadeOut(true)
      }, 200)

      // Remove from DOM after animation completes
      const removeTimer = setTimeout(() => {
        setVisible(false)
      }, 1000) // Slightly longer for smoother transition

      return () => {
        clearTimeout(prepareTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [isLoading, visible])

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-1000 ease-in-out',
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100',
      )}
    >
      <div className="flex flex-col items-center">
        <div className="mb-6 w-16 h-16 rounded-full border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent animate-spin" />
        <div className="relative w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${smoothProgress}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 font-mono">{Math.round(smoothProgress)}%</div>
      </div>
    </div>
  )
}

export default SiteLoader
