import type React from 'react'
import { Media } from '@/components/Media'
import type { Page } from '@/payload-types'

import { getCompositeKey } from '@/utilities/reactKeys'
import { cn } from '@/utilities/ui'
import styles from './homeHero.module.css'

type HeroProps = Page['hero'] & {
  /**
   * The page's h1. The opening is a portrait between two word strips with no
   * title of its own, so the heading is for readers and crawlers (the logo in
   * the top bar says the same name); it is kept out of the composition.
   */
  heading?: string
}

const EXPERIENCE_TEXT = [
  'Designer & Builder',
  'Product Designer',
  'Brand Designer',
  'Web Designer',
  'Design Engineer',
  'Co-Founder',
]

const SKILLS_TEXT = [
  'Brand Identity Development',
  'Visual Identity Design',
  'Web Design',
  'Web Development',
  'Product Strategy',
  'Product Design',
  'Design Systems',
  '3D Modeling & Rendering',
]

/**
 * The opening's load-in, played in CSS from the server markup (the case study
 * hero's `hero-*` utilities) so it starts on first paint and never waits on
 * the bundle, on one 320ms beat. The top bar fades in first (globals.css),
 * then the portrait wipes open and settles, the back strip's words start
 * rising while it is half open and the front strip's follow a beat later,
 * each 30ms apart (`marquee-rise`, the title's rise shortened), and the dock
 * locks into place last. The dock's beat is stated again in globals.css
 * (`body:has([data-slot="home-hero"])`); change the two together.
 */
const BEAT = {
  topBar: 0,
  portrait: 320,
  marqueeTop: 480,
  marqueeBottom: 800,
  word: 30,
  dock: 1120,
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
          className="whitespace-nowrap motion-safe:animate-marquee-rise"
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

export const HomeHero: React.FC<HeroProps> = ({ media, heading }) => (
  <div
    className="relative flex h-[90vh] w-full flex-col items-center overflow-hidden bg-background md:h-screen"
    data-slot="home-hero"
  >
    {heading ? <h1 className="sr-only">{heading}</h1> : null}
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
          // The frame is 30vh wide: 640 covers it at 2x on any screen.
          posterWidth={640}
          priority
          size="30vh"
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
