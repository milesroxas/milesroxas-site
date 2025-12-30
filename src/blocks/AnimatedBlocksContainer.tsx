'use client'

import { gsap } from 'gsap'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { type ReactNode, useEffect, useRef } from 'react'
import { useAnimationStore } from '@/stores/animationStore'
import { cn } from '@/utilities/ui'

interface AnimatedBlocksContainerProps {
  children: ReactNode
}

export const AnimatedBlocksContainer: React.FC<AnimatedBlocksContainerProps> = ({ children }) => {
  const blocksContainerRef = useRef<HTMLDivElement>(null)
  const isHeroAnimationComplete = useAnimationStore((state) => state.isHeroAnimationComplete)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const pathname = usePathname()

  // Determine if we're on homepage
  const isHomepage = pathname === '/'

  // Handle animations
  useEffect(() => {
    if (!blocksContainerRef.current || !isHomepage) return

    // Set initial state - hide all blocks
    const blockElements = blocksContainerRef.current.children
    gsap.set(blockElements, {
      y: 20,
      opacity: 0,
    })

    // Create animation timeline but don't play it yet
    animationRef.current = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.4,
        ease: 'power2.out',
      },
    })

    // Add staggered animations
    animationRef.current.to(blockElements, {
      y: 0,
      opacity: 1,
      stagger: 0.07,
      clearProps: 'transform',
    })

    // Safety timeout - show blocks after 3 seconds regardless
    const safetyTimeout = setTimeout(() => {
      if (blocksContainerRef.current) {
        gsap.to(blockElements, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0,
          overwrite: true,
        })
      }
    }, 3000)

    return () => {
      clearTimeout(safetyTimeout)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [isHomepage])

  // Play animation when hero animation completes
  useEffect(() => {
    if (!animationRef.current || !isHomepage) return

    if (isHeroAnimationComplete && animationRef.current) {
      // Play the animation when hero is complete
      animationRef.current.play()
    }
  }, [isHeroAnimationComplete, isHomepage])

  return (
    <div ref={blocksContainerRef} className={cn('blocks-container w-full')}>
      {children}
    </div>
  )
}
