'use client'

import { useGSAP } from '@gsap/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { CallOutBlock as CallOutBlockProps } from '@/payload-types'
import { observeRevealGate, SCROLL_REVEAL_INTRO } from '@/shared/ui/scroll-reveal'

gsap.registerPlugin(SplitText, useGSAP)

// Past the shared 0.25 gate: the bottom veil hides the copy's first stretch
// above the fold, and the rise has to play where it can be seen.
const ENTER_OFFSET = 0.4

export const CallOutBlock: React.FC<CallOutBlockProps> = ({ richText }) => {
  const textRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const text = textRef.current
      if (!text || prefersReducedMotion) return

      // Each line rises out of its mask once the copy is well clear of the
      // veil, played once. autoSplit re-splits on resize and font load,
      // keeping the rise's progress.
      let played = false
      let rise: gsap.core.Tween | undefined
      SplitText.create(text.querySelectorAll('p, h1, h2, h3, h4'), {
        type: 'lines',
        mask: 'lines',
        aria: 'none',
        autoSplit: true,
        onSplit: ({ lines }) => {
          rise = gsap.from(lines, {
            yPercent: 105,
            ease: 'power4.out',
            duration: 1.1,
            stagger: SCROLL_REVEAL_INTRO.stagger,
            paused: !played,
          })
          return rise
        },
      })

      return observeRevealGate(text, ENTER_OFFSET, () => {
        played = true
        rise?.play()
      })
    },
    { scope: textRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  return (
    // Type on the page, not a painted band: a `data-theme` pin would make the
    // dock swap material while it floats over this scroll. The veil fades the
    // words out through the dock's band so they don't show through the glass;
    // the bottom padding matches it so copy at rest never sits underneath.
    <div className="relative">
      <div className="container flex min-h-[50dvh] items-center justify-center pt-16 pb-36">
        <div
          className="w-full max-w-[46ch] text-balance text-center font-light text-heading-2/snug"
          ref={textRef}
        >
          {richText && <RichText className="mb-0" data={richText} />}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none sticky bottom-0 z-10 -mt-36 h-36 bg-gradient-to-t from-background from-65% to-transparent"
      />
    </div>
  )
}
