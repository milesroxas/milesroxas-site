'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  observeRevealGate,
  SCROLL_REVEAL_INTRO,
  SCROLL_REVEAL_TRIGGER_DEFAULTS,
} from '@/shared/ui/scroll-reveal'

gsap.registerPlugin(SplitText, useGSAP)

/** The hero title's word rise (`hero-rise`: 105%, ease-out-quint), applied per line. */
const LINE_RISE = {
  yPercent: 105,
  ease: 'power4.out',
  duration: SCROLL_REVEAL_INTRO.textDuration,
  stagger: SCROLL_REVEAL_INTRO.stagger,
} as const

/**
 * The intro statement, line by line: each line rises out of its own mask once
 * the copy reaches the shared reveal gate. Lines re-split on resize and font
 * load, keeping the entrance's progress. Reduced motion leaves the copy as is.
 */
export function IntroStatement({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      let played = false
      let rise: gsap.core.Tween | undefined
      // Paragraphs, not the root: a split wraps block children whole.
      // Whole-word lines stay readable, so no aria-label swap.
      SplitText.create(root.querySelectorAll('p'), {
        type: 'lines',
        mask: 'lines',
        aria: 'none',
        autoSplit: true,
        onSplit: ({ lines }) => {
          rise = gsap.from(lines, { ...LINE_RISE, paused: !played })
          return rise
        },
      })

      return observeRevealGate(root, SCROLL_REVEAL_TRIGGER_DEFAULTS.enterOffset, () => {
        played = true
        rise?.play()
      })
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  return (
    <div className={className} ref={rootRef}>
      {children}
    </div>
  )
}
