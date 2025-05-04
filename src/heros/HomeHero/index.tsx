'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState } from 'react'
import styles from './homeHero.module.css'
import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const HomeHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [isLoaded, setIsLoaded] = useState(false)

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

    // Force a minimum loading time to ensure smooth animation
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [setHeaderTheme])

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  // Create a serializable media object by ensuring we only pass plain object properties
  const safeMedia =
    media && typeof media === 'object'
      ? {
          ...media,
          // Convert any potential complex objects to simple serializable values
          error: undefined, // Remove error property as it might contain non-serializable data
          metadata: undefined, // Remove metadata property as it might contain non-serializable data
        }
      : media

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden transition-opacity duration-700 ease-in-out',
        isLoaded ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="absolute top-[40vh] z-0 w-full">
        <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono text-black')}>
          {[...skillsText, ...skillsText].map((text, index) => (
            <div key={index} className={cn(styles.marqueeItem, 'whitespace-nowrap')}>
              {text}
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex justify-center py-24">
        {safeMedia && typeof safeMedia === 'object' && (
          <Media
            className="w-[30vh] overflow-hidden rounded-sm object-cover"
            priority
            resource={safeMedia}
            onLoad={handleImageLoad}
          />
        )}
      </div>
      <div className="absolute top-[50vh] z-20 w-full">
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
