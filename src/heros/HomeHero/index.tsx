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

/**
 * The opening's load-in, played in CSS from the server markup (the case study
 * hero's `hero-*` utilities) so it starts on first paint and never waits on
 * the bundle, on one 400ms beat: the portrait wipes open and settles, each
 * marquee's words rise out of their line 40ms apart (the case study title's
 * word step), and the chrome locks into place last. The chrome's beat is
 * stated again in globals.css (`body:has([data-slot="home-hero"])`); change
 * the two together.
 */
const BEAT = {
  portrait: 0,
  marqueeTop: 400,
  marqueeBottom: 800,
  word: 40,
  chrome: 1200,
} as const

const enterAt = (ms: number) => ({ '--enter-at': `${ms}ms` }) as React.CSSProperties

/**
 * The items twice over, so the marquee loops without a gap. Each rises out of
 * the strip's clip in turn from `at`, the wave running from the strip's
 * anchored edge along its length: left to right along the back strip, then
 * right to left along the front one (`flex-row-reverse`), as one ribbon
 * wrapping the portrait. `translate` on the item leaves the strip's own
 * `transform` travel alone.
 */
const MarqueeItems = ({
  items,
  keyPrefix,
  at,
}: {
  items: string[]
  keyPrefix: string
  at: number
}) => (
  <>
    {[...items, ...items].map((text, idx) => {
      const copyIndex = Math.floor(idx / items.length)
      const itemIndex = idx % items.length
      return (
        <div
          key={getCompositeKey(keyPrefix, text, copyIndex, itemIndex)}
          className="whitespace-nowrap motion-safe:animate-hero-rise"
          style={enterAt(at + idx * BEAT.word)}
        >
          {text}
        </div>
      )
    })}
  </>
)

/** The strip's line: clips the words' rise; reduced motion fades the strip instead. */
const marqueeLine = 'absolute w-full overflow-hidden motion-reduce:animate-hero-fade'

export const HomeHero: React.FC<HeroProps> = ({ media }) => (
  <div
    className="relative flex h-[90vh] w-full flex-col items-center overflow-hidden bg-background md:h-screen"
    data-slot="home-hero"
  >
    <div className={cn(marqueeLine, 'top-[40vh] z-0')} style={enterAt(BEAT.marqueeTop)}>
      <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono text-foreground')}>
        <MarqueeItems at={BEAT.marqueeTop} items={SKILLS_TEXT} keyPrefix="skill" />
      </div>
    </div>

    <div className="relative z-10 flex h-[90vh] items-center justify-center md:h-screen">
      <div
        className="w-[30vh] overflow-hidden rounded-sm motion-safe:animate-hero-wipe motion-reduce:animate-hero-fade"
        style={enterAt(BEAT.portrait)}
      >
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

    <div className={cn(marqueeLine, 'top-[50vh] z-20')} style={enterAt(BEAT.marqueeBottom)}>
      <div
        className={cn(
          styles.marquee,
          'flex flex-row-reverse items-center gap-12 font-mono text-foreground',
        )}
      >
        <MarqueeItems at={BEAT.marqueeBottom} items={EXPERIENCE_TEXT} keyPrefix="experience" />
      </div>
    </div>
  </div>
)
