import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState, type ViewTransitionInstance } from 'react'
import { exitPageAround } from './pageExit'

/**
 * The work card → case study opening (`.work-morph` in globals.css), in three
 * beats. The page fades away around the clicked picture (`pageExit.ts`). The
 * picture, which the card and the hero frame share by view-transition name,
 * scales down and fades out last, where it stands. It then comes straight
 * back in at the hero frame, and the case study's copy and body follow.
 */
export const workMorphName = (slug: string) => `work-media-${slug}`

let opening: string | null = null

/**
 * Marks the work a card is opening, so its hero frame lets the picture arrive
 * by morph instead of playing its own wipe. Only where the browser can morph:
 * elsewhere the frame wipes in as on a fresh load.
 */
function markWorkMorph(slug: string) {
  opening = 'startViewTransition' in document ? slug : null
}

export const isWorkMorph = (slug: string) => opening === slug

export function clearWorkMorph() {
  opening = null
}

let exiting = false
let exitEnds: number | null = null
let restore: (() => void) | null = null

/** Puts back the page the exit cleared, once the old snapshot no longer needs it. */
function restorePage() {
  restore?.()
  restore = null
  exiting = false
  exitEnds = null
}

/**
 * A work card's side of the opening. The card takes its name only once
 * clicked: a list can hold cards for works the next page also lists (related
 * works), and every named pair would morph, not just the one opened. A
 * modified click opens a new tab, so it leaves the card as it is. Reduced
 * motion skips the exit and lets the link navigate at once. `onOpen` hears
 * the moment the card takes its name, for a picture that lives outside it.
 */
export function useWorkCardMorph(
  slug: string | null | undefined,
  href: string,
  imageRef: React.RefObject<HTMLElement | null>,
  onOpen?: () => void,
) {
  const router = useRouter()
  const [named, setNamed] = useState(false)
  const onClick = (event: React.MouseEvent) => {
    if (!slug || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (exiting) {
      event.preventDefault()
      return
    }
    markWorkMorph(slug)
    setNamed(true)
    onOpen?.()
    const picture = imageRef.current
    if (!opening || !picture || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // The exit plays while the case study loads. If it arrives first, the old
    // page's fade (globals.css) finishes what the exit started.
    event.preventDefault()
    exiting = true
    const exit = exitPageAround(picture)
    restore = exit.restore
    exitEnds = exit.ends
    router.push(href, { transitionTypes: ['work-open'] })
    // The navigation never came, or came without the morph: give the page back.
    setTimeout(() => restore === exit.restore && restorePage(), 4000)
  }
  return {
    name: named && slug ? workMorphName(slug) : undefined,
    onClick,
    onShare: choreographWorkMorph,
  }
}

/** The card's picture starts to recede as the nearest pieces of the page finish leaving. */
const EXIT_OVERLAP = 100
/** The empty beat between the card's picture leaving and the hero's arriving. */
const PAUSE = 80
/** The hero copy follows the picture in by this much. */
const COPY_LAG = 120
/** The page around the picture never clears faster than this. */
const PAGE_OUT_MIN = 120

type Pseudo = { getAnimations(): Animation[] }
type MorphInstance = ViewTransitionInstance & Record<'group' | 'old' | 'new', Pseudo>

/** Durations stay in globals.css; only the start moves. */
const retime = (pseudo: Pseudo, timing: OptionalEffectTiming) => {
  for (const animation of pseudo.getAnimations()) {
    animation.effect?.updateTiming({ fill: 'both', ...timing })
    // This can run a few frames into the transition: start from its first frame.
    animation.currentTime = 0
  }
}

const longest = (pseudo: Pseudo) =>
  Math.max(0, ...pseudo.getAnimations().map((a) => Number(a.effect?.getTiming().duration) || 0))

/**
 * Times the picture's handoff from the exit's end. Whatever the exit had left
 * when the navigation landed fades first, then the card's picture recedes
 * where it stands, and after a beat the hero's picture comes into focus at
 * the frame. The group holds the card's box until the swap (`step-end` in
 * globals.css), so the picture never travels. A slow page leaves the picture
 * waiting alone.
 */
export function choreographWorkMorph(instance: ViewTransitionInstance) {
  const lag = Math.max((exitEnds ?? 0) - EXIT_OVERLAP - performance.now(), 0)
  // The old snapshot is taken: the page the exit cleared can come back.
  restorePage()
  const { group, old, new: next } = instance as MorphInstance
  const swap = lag + longest(old)
  const arrive = swap + PAUSE

  retime(group, { delay: 0, duration: swap })
  retime(old, { delay: lag })
  retime(next, { delay: arrive })
  for (const animation of document.documentElement.getAnimations({ subtree: true })) {
    const { effect } = animation
    if (
      effect instanceof KeyframeEffect &&
      effect.pseudoElement === '::view-transition-old(root)'
    ) {
      effect.updateTiming({ delay: 0, duration: Math.max(lag, PAGE_OUT_MIN) })
      animation.currentTime = 0
    }
  }

  // The hero copy and the body after it follow the picture in (`--morph-hold`).
  document
    .querySelector<HTMLElement>('[data-slot="work-hero"]')
    ?.parentElement?.style.setProperty('--morph-hold', `${arrive + COPY_LAG}ms`)
}
