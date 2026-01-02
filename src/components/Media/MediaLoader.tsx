'use client'

import { gsap } from 'gsap'
import React, { useEffect, useRef, useState } from 'react'
import { requestScrollTriggerRefresh } from '@/utilities/scrollTriggerRefresh'
import { cn } from '@/utilities/ui'

interface MediaLoaderProps {
  children: React.ReactNode
  priority?: boolean
  onLoad?: () => void
  className?: string
  enableAnimation?: boolean
  fill?: boolean
}

/**
 * Progressive enhancement wrapper for media elements
 * Handles intersection-based loading with GSAP animations
 * Integrates with existing ScrollTrigger/Lenis setup
 */
export const MediaLoader: React.FC<MediaLoaderProps> = ({
  children,
  priority = false,
  onLoad,
  className,
  enableAnimation = true,
  fill = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(priority)
  // Priority images should start as loaded to avoid opacity animation conflicts with page transitions
  const [isLoaded, setIsLoaded] = useState(priority)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  // Handle intersection observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return

    const observerOptions = {
      root: null,
      rootMargin: '50px', // Start loading slightly before element enters viewport
      threshold: 0.01,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && !isIntersecting) {
        setIsIntersecting(true)
        // Disconnect after first intersection
        observerRef.current?.disconnect()
      }
    }, observerOptions)

    observerRef.current.observe(containerRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority, isIntersecting])

  // Handle load completion with GSAP animation
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !enableAnimation) {
      // If no animation, still call onLoad
      if (isLoaded && !enableAnimation) {
        onLoad?.()
      }
      return
    }

    // Skip animation if there's a page transition clone (hero transition in progress)
    const hasTransitionClone = typeof window !== 'undefined' && window.__PAGE_TRANSITION_CLONE
    if (hasTransitionClone && priority) {
      // For priority images during transition, just make visible immediately
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' })
      }
      onLoad?.()
      return
    }

    // Cancel any existing animation
    animationRef.current?.kill()

    // Animate in with subtle fade, scale, and blur
    animationRef.current = gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.02,
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all',
        onComplete: () => {
          onLoad?.()
        },
      },
    )

    return () => {
      animationRef.current?.kill()
    }
  }, [isLoaded, onLoad, enableAnimation, priority])

  const handleMediaLoad = () => {
    setIsLoaded(true)
    // Refresh ScrollTrigger after media loads to recalculate positions
    requestScrollTriggerRefresh(150)
  }

  // Check if there's a page transition happening
  const hasTransitionClone =
    typeof window !== 'undefined' && window.__PAGE_TRANSITION_CLONE !== undefined

  // Don't hide priority images if there's a transition happening
  const shouldHide = enableAnimation && !isLoaded && !(priority && hasTransitionClone)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        {
          'h-full w-full': fill,
        },
        className,
      )}
      style={{
        opacity: shouldHide ? 0 : undefined,
      }}
      data-media-loader
      data-loaded={isLoaded}
    >
      {/* Loading placeholder with blur effect - only for images */}
      {!isLoaded && enableAnimation && !hasTransitionClone && (
        <div className="absolute inset-0 z-10 bg-muted/20 backdrop-blur-sm animate-pulse pointer-events-none" />
      )}

      {/* Render children with load handler injected */}
      {isIntersecting &&
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ onLoad?: () => void }>, {
              onLoad: handleMediaLoad,
            })
          }
          return child
        })}
    </div>
  )
}
