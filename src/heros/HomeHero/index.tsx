'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useRef } from 'react'
import styles from './homeHero.module.css'
import type { Page } from '@/payload-types'
import { gsap } from 'gsap'
import { useAnimationStore } from '@/stores/animationStore'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const HomeHero: React.FC<Page['hero']> = ({ media }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const setHeroAnimationComplete = useAnimationStore((state) => state.setHeroAnimationComplete)

  // Create refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const mediaMaskRef = useRef<HTMLDivElement>(null)
  const topMarqueeRef = useRef<HTMLDivElement>(null)
  const bottomMarqueeRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    setHeaderTheme('light')
    setHeroAnimationComplete(false)

    // Create timeline for animations
    const tl = gsap.timeline({
      onComplete: () => {
        setHeroAnimationComplete(true)
      },
    })

    // Set initial states
    if (mediaMaskRef.current) {
      gsap.set(mediaMaskRef.current, { clipPath: 'inset(0 0 100% 0)' })
    }
    if (topMarqueeRef.current) {
      gsap.set(topMarqueeRef.current, { autoAlpha: 0 })
    }
    if (bottomMarqueeRef.current) {
      gsap.set(bottomMarqueeRef.current, { autoAlpha: 0 })
    }

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

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      setHeroAnimationComplete(true)
    }, 3000)

    return () => {
      clearTimeout(safetyTimeout)
      tl.kill()
      setHeroAnimationComplete(false)
    }
  }, [setHeaderTheme, setHeroAnimationComplete])

  // Create a serializable media object
  const safeMedia =
    media && typeof media === 'object'
      ? {
          ...media,
          error: undefined,
          metadata: undefined,
        }
      : media

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
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
      <div className="relative z-10 flex justify-center py-24">
        <div
          ref={mediaMaskRef}
          className="w-[30vh] overflow-hidden rounded-sm"
          style={{ clipPath: 'inset(0 0 100% 0)' }}
        >
          {safeMedia && typeof safeMedia === 'object' ? (
            <Media className="w-full object-cover" priority resource={safeMedia} />
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
