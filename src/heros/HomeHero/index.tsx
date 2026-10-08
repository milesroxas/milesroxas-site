import type React from 'react'
import { Media } from '@/components/Media'
import type { Page } from '@/payload-types'

import { getCompositeKey } from '@/utilities/reactKeys'
import { cn } from '@/utilities/ui'
import styles from './homeHero.module.css'

type HeroProps = Page['hero']

const EXPERIENCE_TEXT = [
  'Co-Founder',
  'Creative Director',
  'Web Designer',
  'Brand Designer',
  'Product Design',
  'Design Engineer',
]

const SKILLS_TEXT = [
  'Brand Identity Development',
  'Visual Identity Design',
  'Web Design',
  'Web Development',
  'Product Strategy',
  'Product Design',
  'Design Engineer',
  '3D Modeling & Rendering',
]

/** The items twice over, so the marquee loops without a gap. */
const MarqueeItems = ({ items, keyPrefix }: { items: string[]; keyPrefix: string }) => (
  <>
    {[...items, ...items].map((text, idx) => {
      const copyIndex = Math.floor(idx / items.length)
      const itemIndex = idx % items.length
      return (
        <div
          key={getCompositeKey(keyPrefix, text, copyIndex, itemIndex)}
          className={cn(styles.marqueeItem, 'whitespace-nowrap')}
        >
          {text}
        </div>
      )
    })}
  </>
)

/**
 * The opening's load-in, played in CSS from the server markup (the case study
 * hero's `hero-*` utilities) so it starts on first paint and never waits on
 * the bundle: the portrait wipes open and settles, then each marquee fades up,
 * and the chrome arrives last (`data-slot="home-hero"` sets its cue in
 * globals.css).
 */
const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as React.CSSProperties

const marqueeIn = 'motion-safe:animate-hero-in motion-reduce:animate-hero-fade'

export const HomeHero: React.FC<HeroProps> = ({ media }) => (
  <div
    className="relative flex h-[90vh] w-full flex-col items-center overflow-hidden bg-background md:h-screen"
    data-slot="home-hero"
  >
    <div className={cn('absolute top-[40vh] z-0 w-full', marqueeIn)} style={enterAt(800)}>
      <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono text-foreground')}>
        <MarqueeItems items={SKILLS_TEXT} keyPrefix="skill" />
      </div>
    </div>

    <div className="relative z-10 flex h-[90vh] items-center justify-center md:h-screen">
      <div className="w-[30vh] overflow-hidden rounded-sm motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade">
        <Media
          htmlElement={null}
          className="h-full w-full object-cover"
          imgClassName="motion-safe:animate-hero-settle"
          priority
          videoClassName="motion-safe:animate-hero-settle"
          resource={media}
        />
      </div>
    </div>

    <div className={cn('absolute top-[50vh] z-20 w-full', marqueeIn)} style={enterAt(1000)}>
      <div
        className={cn(
          styles.marquee,
          'flex flex-row items-center gap-12 font-mono text-foreground',
        )}
      >
        <MarqueeItems items={EXPERIENCE_TEXT} keyPrefix="experience" />
      </div>
    </div>
  </div>
)
