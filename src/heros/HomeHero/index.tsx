'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './homeHero.module.css'
import type { Page } from '@/payload-types'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAnimationStore } from '@/stores/animationStore'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const HomeHero: React.FC<Page['hero']> = ({ media }) => {
  const setHeroAnimationComplete = useAnimationStore((state) => state.setHeroAnimationComplete)

  // Create refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const mediaMaskRef = useRef<HTMLDivElement>(null)
  const topMarqueeRef = useRef<HTMLDivElement>(null)
  const bottomMarqueeRef = useRef<HTMLDivElement>(null)

  // Track media loading state
  const [isMediaLoaded, setIsMediaLoaded] = useState(!media)

  const experienceText = [
    'Co-Founder',
    'Creative Director',
    'Web Designer',
    'Brand Designer',
    'Product Design',
    'Design Engineer',
  ]

  const skillsText = [
    'Brand Identity Development',
    'Visual Identity Design',
    'Web Design',
    'Web Development',
    'Product Stategy',
    'Product Design',
    'Design Engineer',
    '3D Modeling & Rendering',
  ]

  // Use useGSAP for animations
  useGSAP(
    () => {
      // Only run animations if media is loaded
      if (!isMediaLoaded) return

      // Set initial states
      gsap.set(mediaMaskRef.current, { clipPath: 'inset(0 0 100% 0)' })
      gsap.set(topMarqueeRef.current, { autoAlpha: 0 })
      gsap.set(bottomMarqueeRef.current, { autoAlpha: 0 })

      const tl = gsap.timeline({
        onComplete: () => {
          console.log('Animation timeline complete')
          setHeroAnimationComplete(true)
        },
      })

      // Animation sequence
      tl.to(mediaMaskRef.current, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        ease: 'power2.inOut',
      })
        .to(
          topMarqueeRef.current,
          {
            autoAlpha: 1,
            duration: 0.8,
          },
          '-=0.3',
        )
        .to(
          bottomMarqueeRef.current,
          {
            autoAlpha: 1,
            duration: 0.8,
          },
          '-=0.5',
        )

      // Cleanup function
      return () => {
        setHeroAnimationComplete(false)
      }
    },
    {
      scope: containerRef,
      dependencies: [isMediaLoaded, setHeroAnimationComplete],
    },
  )

  // Handle media load
  const handleMediaLoad = () => {
    console.log('Media loaded event triggered!')
    setIsMediaLoaded(true)
  }

  return (
    <div
      data-theme="light"
      ref={containerRef}
      className="bg-background relative h-[90vh] w-full flex-col items-center overflow-hidden md:h-[screen] md:items-center"
    >
      {/* Top marquee */}
      <div ref={topMarqueeRef} className="absolute top-[40vh] z-0 w-full opacity-0">
        <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono text-black')}>
          {[...skillsText, ...skillsText].map((text, index) => (
            <div key={index} className={cn(styles.marqueeItem, 'whitespace-nowrap')}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Media with mask animation */}
      <div className="relative z-10 flex h-[90vh] items-center justify-center md:h-[100vh]">
        <div
          ref={mediaMaskRef}
          className="w-[30vh] overflow-hidden rounded-sm"
          style={{ clipPath: 'inset(0 0 100% 0)' }}
        >
          {media ? (
            <Media
              className="h-full w-full object-cover"
              priority
              onLoad={() => {
                console.log('onLoad callback triggered')
                handleMediaLoad()
              }}
              onLoadedData={() => {
                console.log('onLoadedData callback triggered')
                handleMediaLoad()
              }}
              resource={media}
            />
          ) : (
            <div className="h-[30vh] w-full bg-gray-200" />
          )}
        </div>
      </div>

      {/* Bottom marquee */}
      <div ref={bottomMarqueeRef} className="absolute top-[50vh] z-20 w-full opacity-0">
        <div
          className={cn(styles.marquee, 'flex flex-row items-center gap-12 font-mono text-black')}
        >
          {[...experienceText, ...experienceText].map((text, index) => (
            <div key={index} className={cn(styles.marqueeItem, 'whitespace-nowrap text-black')}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
