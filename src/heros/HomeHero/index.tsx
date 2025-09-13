'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import styles from './homeHero.module.css'
import type { Page, Media as MediaType } from '@/payload-types'
import { gsap } from 'gsap'
import { useAnimationStore } from '@/stores/animationStore'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaURL'

export const HomeHero: React.FC<Page['hero']> = ({ media }) => {
  const setHeroAnimationComplete = useAnimationStore((state) => state.setHeroAnimationComplete)

  // Create refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const mediaMaskRef = useRef<HTMLDivElement>(null)
  const topMarqueeRef = useRef<HTMLDivElement>(null)
  const bottomMarqueeRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Track media loading state
  const [isMediaLoaded, setIsMediaLoaded] = useState(false)
  const [isMediaError, setIsMediaError] = useState(false)
  const [animationTriggered, setAnimationTriggered] = useState(false)

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

  // Immediately check for cached video on component mount
  useEffect(() => {
    // If no media, consider it loaded
    if (!media) {
      setIsMediaLoaded(true)
      return
    }

    // For videos, check if already cached
    if (media && typeof media === 'object' && (media as MediaType)?.mimeType?.includes('video')) {
      // Create a video element to check cache status
      const tempVideo = document.createElement('video')
      tempVideo.muted = true
      tempVideo.src = getMediaUrl(media as MediaType) || ''
      tempVideo.preload = 'auto'

      // Listen for immediate ready state
      if (tempVideo.readyState >= 3) {
        // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        setIsMediaLoaded(true)
      }

      // Also listen for loaded data event
      tempVideo.addEventListener('loadeddata', () => {
        setIsMediaLoaded(true)
      })

      // Force a load attempt
      tempVideo.load()
    }

    // Set a timeout as fallback to ensure animation proceeds
    const timeoutId = setTimeout(() => {
      if (!isMediaLoaded) {
        setIsMediaLoaded(true)
      }
    }, 2000) // Reduced to 2 seconds for better UX

    return () => clearTimeout(timeoutId)
  }, [media, isMediaLoaded])

  // Function to run the animation manually
  const runAnimation = useCallback(() => {
    // Set initial states
    gsap.set(mediaMaskRef.current, { clipPath: 'inset(0 0 100% 0)' })
    gsap.set(topMarqueeRef.current, { autoAlpha: 0 })
    gsap.set(bottomMarqueeRef.current, { autoAlpha: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
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
  }, [setHeroAnimationComplete])

  // Separate effect to trigger animation once media is loaded
  useEffect(() => {
    if ((isMediaLoaded || isMediaError) && !animationTriggered) {
      setAnimationTriggered(true)

      // Force animation to run by manually triggering GSAP timeline
      if (
        containerRef.current &&
        mediaMaskRef.current &&
        topMarqueeRef.current &&
        bottomMarqueeRef.current
      ) {
        runAnimation()
      }
    }
  }, [isMediaLoaded, isMediaError, animationTriggered, runAnimation])

  // Handle media load
  const handleMediaLoad = () => {
    setIsMediaLoaded(true)
  }

  // Handle media error
  const handleMediaError = () => {
    setIsMediaError(true)
  }

  // Save video reference for cached video checking
  const handleVideoRef = (element: HTMLVideoElement | null) => {
    if (element && element !== videoRef.current) {
      videoRef.current = element

      // Check if video is already ready
      if (element.readyState >= 3) {
        handleMediaLoad()
      }
    }
  }

  // Helper to check if media is a video
  const isMediaVideo = (mediaItem: unknown): mediaItem is MediaType => {
    return (
      !!mediaItem &&
      typeof mediaItem === 'object' &&
      'mimeType' in mediaItem &&
      typeof (mediaItem as { mimeType?: string }).mimeType === 'string' &&
      ((mediaItem as { mimeType?: string }).mimeType ?? '').includes('video')
    )
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
            isMediaVideo(media) ? (
              <video
                ref={handleVideoRef}
                className="h-full w-full object-cover"
                src={getMediaUrl(media as MediaType) || ''}
                preload="auto"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={handleMediaLoad}
                onError={handleMediaError}
              />
            ) : (
              <Media
                className="h-full w-full object-cover"
                priority
                onLoad={handleMediaLoad}
                onLoadedData={handleMediaLoad}
                onError={handleMediaError}
                resource={media}
              />
            )
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
