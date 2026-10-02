'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { themeClasses } from '@/blocks/shared/band-theme'
import { Container } from '@/components/Container'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { Work } from '@/payload-types'
import { observeRevealGate, SCROLL_REVEAL_INTRO } from '@/shared/ui/scroll-reveal'
import { useChromeStore } from '@/stores/chromeStore'
import { cn } from '@/utilities/ui'
import styles from './WorkMasthead.module.css'

gsap.registerPlugin(useGSAP)

/** The title speaks the site's intro language; only the sweep is the masthead's own. */
const {
  textEase: EASE,
  textDuration: TITLE_DURATION,
  textBlurPx: TITLE_BLUR_PX,
} = SCROLL_REVEAL_INTRO

/**
 * What only the masthead owns: when the facts follow the title, their sweep,
 * and how long a card transition may hold the entrance back.
 */
const MASTHEAD = {
  factsAt: 0.2,
  factDuration: 0.8,
  factStagger: 0.08,
  arrivalTimeoutMs: 1500,
} as const

/** The mask edge parked off a part's right side (hidden) or left side (shown). */
const HIDDEN = { '--masthead-sweep': '100%' }
const SHOWN = { '--masthead-sweep': '0%' }

/**
 * Runs `onArrive` once a card → detail transition has landed its clone on the
 * hero (`frame-ready`), so the entrance plays on screen rather than under the
 * clone. Without a transition in flight it runs at once.
 */
function afterArrival(onArrive: () => void) {
  if (useChromeStore.getState().transitionPhase !== 'clone-animating') {
    onArrive()
    return () => {}
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const stop = () => {
    clearTimeout(timer)
    unsubscribe()
  }
  const arrive = () => {
    stop()
    onArrive()
  }
  const unsubscribe = useChromeStore.subscribe((state) => {
    if (state.transitionPhase !== 'clone-animating') arrive()
  })
  timer = setTimeout(arrive, MASTHEAD.arrivalTimeoutMs)
  return stop
}

type Props = Pick<Work, 'title' | 'industry' | 'role' | 'deliverables'>

/**
 * The case study's masthead under its hero: the title, and the project's
 * facts as a ruled spec list. The list sits under the title until `lg`, then
 * beside it. On arrival the title sweeps in left to right out of a soft blur,
 * then each fact row (its rule, label and value) sweeps in, top to bottom.
 * Plays once; reduced motion renders the final state.
 */
export function WorkMasthead({ title, industry, role, deliverables }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const facts = [
    { label: 'Industry', value: industry },
    { label: 'Role', value: role },
    { label: 'Deliverables', value: deliverables },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || 'entered' in root.dataset) return

      const parts = Array.from(root.querySelectorAll<HTMLElement>('[data-masthead-part]'))
      const [heading, ...rows] = parts
      // Nothing is masked under reduced motion, and the failsafe may already
      // have shown the copy on a slow load: either way, keep what is there.
      const masked = heading
        ? getComputedStyle(heading).getPropertyValue('--masthead-sweep').trim() === '100%'
        : false
      if (!heading || !masked || prefersReducedMotion) {
        root.dataset.entered = ''
        return
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: EASE },
        onComplete: () => {
          root.dataset.entered = ''
          gsap.set(parts, { clearProps: 'all' })
        },
      })
      tl.fromTo(
        heading,
        { ...HIDDEN, filter: `blur(${TITLE_BLUR_PX}px)` },
        { ...SHOWN, filter: 'blur(0px)', duration: TITLE_DURATION },
        0,
      )
      if (rows.length) {
        tl.fromTo(
          rows,
          HIDDEN,
          { ...SHOWN, duration: MASTHEAD.factDuration, stagger: MASTHEAD.factStagger },
          MASTHEAD.factsAt,
        )
      }
      // The inline start state now holds every part, so the failsafe stands down.
      root.dataset.armed = ''

      let disconnectGate = () => {}
      const cancelArrival = afterArrival(() => {
        disconnectGate = observeRevealGate(root, 0, () => tl.play())
      })
      return () => {
        cancelArrival()
        disconnectGate()
      }
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  return (
    <header className={cn(styles.root, themeClasses.default)} ref={rootRef}>
      <Container className="grid gap-y-8 py-12 md:gap-y-10 md:py-16 lg:grid-cols-12 lg:items-start lg:gap-x-8">
        {/* The padding gives descenders room inside the mask; the margin cancels it. */}
        <h1
          className={cn(
            styles.part,
            '-my-[0.15em] text-balance break-words py-[0.15em] text-heading-3 lg:col-span-6',
          )}
          data-masthead-part
        >
          {title}
        </h1>
        {facts.length > 0 && (
          // Beside the title, the top rule hangs from the title's cap height (0.327em in IBM Plex).
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 lg:col-span-5 lg:col-start-8 lg:mt-[calc(var(--text-heading-3)*0.327)]">
            {facts.map(({ label, value }) => (
              <div
                className={cn(
                  styles.part,
                  'col-span-2 grid grid-cols-subgrid items-baseline border-border border-t py-3 last:border-b',
                )}
                data-masthead-part
                key={label}
              >
                <dt className="text-muted-foreground text-sm leading-snug">{label}</dt>
                <dd className="text-pretty text-base leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </header>
  )
}
