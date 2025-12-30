'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { type ReactNode, useEffect, useRef } from 'react'
import { useAnimationStore } from '@/stores/animationStore'
import { cn } from '@/utilities/ui'

interface AnimatedBlocksContainerProps {
  children: ReactNode
}

const animateBlock = (block: Element) => {
  gsap.to(block, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    clearProps: 'transform',
  })
}

const isBlockInViewport = (block: Element) => {
  const rect = block.getBoundingClientRect()
  return rect.top < window.innerHeight * 0.85
}

export const AnimatedBlocksContainer: React.FC<AnimatedBlocksContainerProps> = ({ children }) => {
  const blocksContainerRef = useRef<HTMLDivElement>(null)
  const isHeroAnimationComplete = useAnimationStore((state) => state.isHeroAnimationComplete)
  const scrollTriggersRef = useRef<ScrollTrigger[]>([])
  const animatedBlocksRef = useRef<Set<Element>>(new Set())
  const pathname = usePathname()

  // Determine if we're on homepage
  const isHomepage = pathname === '/'

  // Handle animations with ScrollTrigger
  useEffect(() => {
    if (!blocksContainerRef.current || !isHomepage) return

    gsap.registerPlugin(ScrollTrigger)

    const blockElements = Array.from(blocksContainerRef.current.children)

    // Set initial state - hide all blocks that haven't been animated
    gsap.set(blockElements, {
      y: 20,
      opacity: 0,
    })

    // Check if user is scrolled past the hero
    const isScrolledPastHero = window.scrollY > window.innerHeight * 0.5
    const shouldInitializeImmediately = isScrolledPastHero || isHeroAnimationComplete

    const animateBlockOnce = (block: Element) => {
      if (animatedBlocksRef.current.has(block)) return
      animatedBlocksRef.current.add(block)
      animateBlock(block)
    }

    const initializeAnimations = () => {
      if (!blocksContainerRef.current) return

      const elements = Array.from(blocksContainerRef.current.children)

      // Animate visible blocks and create ScrollTriggers for others
      for (const block of elements) {
        if (isBlockInViewport(block)) {
          animateBlockOnce(block)
        } else {
          const trigger = ScrollTrigger.create({
            trigger: block,
            start: 'top 85%',
            end: 'top 30%',
            scrub: false,
            once: true,
            onEnter: () => animateBlockOnce(block),
          })

          scrollTriggersRef.current.push(trigger)
        }
      }
    }

    if (shouldInitializeImmediately) {
      initializeAnimations()
    }

    // Safety timeout - ensure blocks are visible after delay
    const safetyTimeout = setTimeout(() => {
      if (blocksContainerRef.current) {
        const allBlocks = Array.from(blocksContainerRef.current.children)
        gsap.to(allBlocks, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          overwrite: true,
          clearProps: 'transform',
        })
      }
    }, 5000)

    return () => {
      clearTimeout(safetyTimeout)
      for (const trigger of scrollTriggersRef.current) {
        trigger.kill()
      }
      scrollTriggersRef.current = []
    }
  }, [isHomepage, isHeroAnimationComplete])

  return (
    <div ref={blocksContainerRef} className={cn('blocks-container w-full')}>
      {children}
    </div>
  )
}
