'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './homeHero.module.css'
import type { Page, Media as MediaType } from '@/payload-types'
import { gsap } from 'gsap'

import { useAnimationStore } from '@/stores/animationStore'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaURL'

type HeroProps = Page['hero']

function isMediaVideo(m: unknown): m is MediaType {
  return !!m && typeof m === 'object' && !!(m as MediaType).mimeType?.includes('video')
}

export const HomeHero: React.FC<HeroProps> = ({ media }) => {
  const setHeroAnimationComplete = useAnimationStore((s) => s.setHeroAnimationComplete)

  const containerRef = useRef<HTMLDivElement>(null)
  const mediaMaskRef = useRef<HTMLDivElement>(null)
  const topMarqueeRef = useRef<HTMLDivElement>(null)
  const bottomMarqueeRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isMediaLoaded, setIsMediaLoaded] = useState(false)
  const [isMediaError, setIsMediaError] = useState(false)

  // prevent duplicate animation triggers
  const animationTriggeredRef = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Probe cached video quickly, then fall back to a short timeout
  useEffect(() => {
    let mounted = true
    let timeoutId: number | undefined
    let tempVideo: HTMLVideoElement | undefined

    if (!media) {
      setIsMediaLoaded(true)
    } else if (isMediaVideo(media)) {
      tempVideo = document.createElement('video')
      tempVideo.muted = true
      tempVideo.preload = 'auto'
      tempVideo.src = getMediaUrl(media) || ''

      const onLoaded = () => mounted && setIsMediaLoaded(true)
      const onError = () => mounted && setIsMediaError(true)

      // if already cached
      if (tempVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        onLoaded()
      } else {
        tempVideo.addEventListener('loadeddata', onLoaded, { once: true })
        tempVideo.addEventListener('error', onError, { once: true })
        tempVideo.load()
      }

      // fallback so UX is not blocked
      timeoutId = window.setTimeout(() => {
        if (mounted) setIsMediaLoaded(true)
      }, 2000)
    } else {
      // image or other non-video media will call onLoad, but also set a fallback
      timeoutId = window.setTimeout(() => {
        if (mounted) setIsMediaLoaded(true)
      }, 2000)
    }

    return () => {
      mounted = false
      if (timeoutId) window.clearTimeout(timeoutId)
      if (tempVideo) {
        tempVideo.removeAttribute('src')
        tempVideo.load()
      }
    }
  }, [media])

  // Build GSAP timeline once
  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      // Skip the animation entirely
      setHeroAnimationComplete(true)
      animationTriggeredRef.current = true
      return
    }

    const ctx = gsap.context(() => {
      // initial states
      gsap.set(mediaMaskRef.current, { clipPath: 'inset(0 0 100% 0)' })
      gsap.set([topMarqueeRef.current, bottomMarqueeRef.current], { autoAlpha: 0 })

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => setHeroAnimationComplete(true),
      })

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

      tlRef.current = tl
    }, containerRef)

    return () => {
      tlRef.current?.kill()
      tlRef.current = null
      ctx.revert()
    }
    // dependencies are DOM refs which are stable, and reduced motion which we checked above
  }, [prefersReducedMotion, setHeroAnimationComplete])

  // Start the animation once media is ready or errored
  useEffect(() => {
    if ((isMediaLoaded || isMediaError) && !animationTriggeredRef.current) {
      animationTriggeredRef.current = true
      tlRef.current?.play(0)
    }
  }, [isMediaLoaded, isMediaError])

  const handleMediaLoad = () => setIsMediaLoaded(true)
  const handleMediaError = () => setIsMediaError(true)

  const handleVideoRef = (el: HTMLVideoElement | null) => {
    if (!el) return
    if (videoRef.current === el) return
    videoRef.current = el
    // if video already has data, mark as loaded
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleMediaLoad()
    }
  }

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
    'Product Strategy',
    'Product Design',
    'Design Engineer',
    '3D Modeling & Rendering',
  ]

  return (
    <div
      data-theme="light"
      ref={containerRef}
      className="bg-background relative flex h-[90vh] w-full flex-col items-center overflow-hidden md:h-screen"
    >
      {/* Top marquee */}
      <div ref={topMarqueeRef} className="absolute top-[40vh] z-0 w-full opacity-0">
        <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono text-black')}>
          {[...skillsText, ...skillsText].map((text, idx) => (
            <div key={idx} className={cn(styles.marqueeItem, 'whitespace-nowrap')}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Media with mask animation */}
      <div className="relative z-10 flex h-[90vh] items-center justify-center md:h-screen">
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
                src={getMediaUrl(media) || ''}
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
                onError={handleMediaError}
                resource={media}
              />
            )
          ) : (
            <div className="h-[30vh] w-full bg-gray-200" aria-hidden />
          )}
        </div>
      </div>

      {/* Bottom marquee */}
      <div ref={bottomMarqueeRef} className="absolute top-[50vh] z-20 w-full opacity-0">
        <div
          className={cn(styles.marquee, 'flex flex-row items-center gap-12 font-mono text-black')}
        >
          {[...experienceText, ...experienceText].map((text, idx) => (
            <div key={idx} className={cn(styles.marqueeItem, 'whitespace-nowrap text-black')}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
