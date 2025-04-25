'use client'

import React, { ReactNode } from 'react'
import { useTransitionNavigation } from '@/hooks/useTransitionNavigation'
import gsap from 'gsap'

interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Let the hook handle ALL animations through GSAP
  // Don't use CSS transitions
  const { setContainerRef } = useTransitionNavigation({
    duration: 0.4,
    exitAnimation: (element, done) => {
      // Clear any existing animations first
      gsap.killTweensOf(element)

      gsap.to(element, {
        opacity: 0,
        y: 8,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: done,
      })
    },
    enterAnimation: (element, done) => {
      // Clear any existing animations first
      gsap.killTweensOf(element)

      // Set initial state immediately
      gsap.set(element, { opacity: 0, y: 8 })

      // Then animate in
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: done,
      })
    },
  })

  return (
    <div ref={setContainerRef} className="will-change: opacity, transform">
      {children}
    </div>
  )
}

export default PageTransition
