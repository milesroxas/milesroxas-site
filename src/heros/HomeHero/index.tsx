'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import styles from './homeHero.module.css'
import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const HomeHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

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
  })

  return (
    <div className="relative w-full overflow-hidden">
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
        {media && typeof media === 'object' && (
          <Media
            className="w-[30vh] overflow-hidden rounded-sm object-cover"
            priority
            resource={media}
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
