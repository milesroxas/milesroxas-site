import type React from 'react'
import { useState, type ViewTransitionInstance } from 'react'

/**
 * The work card → case study morph (`.work-morph` in globals.css). The card's
 * picture and the hero frame share one view-transition name per work, so the
 * browser carries the picture from one into the other.
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

/**
 * A work card's side of the morph. The card takes its name only once clicked:
 * a list can hold cards for works the next page also lists (related works),
 * and every named pair would morph, not just the one opened. A modified click
 * opens a new tab, so it leaves the card as it is.
 */
export function useWorkCardMorph(slug: string | null | undefined) {
  const [named, setNamed] = useState(false)
  const onClick = (event: React.MouseEvent) => {
    if (!slug || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    markWorkMorph(slug)
    setNamed(true)
  }
  return {
    name: named && slug ? workMorphName(slug) : undefined,
    onClick,
    onShare: choreographWorkMorph,
  }
}

/** The page around the picture fades out first (`work-page-out` in globals.css). */
const EXIT = 200
/** Each leg of the picture's travel: across to center, then down or up into place. */
const LEG = 420
const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)'

type Pseudo = { getAnimations(): Animation[] }
type MorphInstance = ViewTransitionInstance & Record<'group' | 'imagePair' | 'old' | 'new', Pseudo>

/**
 * Retimes the browser's straight-line morph into three beats: the picture
 * holds while the page fades, travels along one axis at a time (across to the
 * hero's center, then vertically into the frame while it resizes), and lands
 * as the hero's copy starts its load-in. A leg with nothing to cover drops out.
 * Reduced motion leaves no group animation, so nothing is retimed.
 */
function choreographWorkMorph(instance: ViewTransitionInstance) {
  const { group, imagePair, old, new: next } = instance as MorphInstance
  const effect = group.getAnimations()[0]?.effect
  if (!(effect instanceof KeyframeEffect)) return
  const frames = effect
    .getKeyframes()
    .map(({ offset: _o, computedOffset: _c, easing: _e, composite: _m, ...props }) => props)
  const from = frames[0]
  const to = frames[frames.length - 1]
  if (!from?.transform || !to?.transform) return

  const start = new DOMMatrix(String(from.transform))
  const end = new DOMMatrixReadOnly(String(to.transform))
  const center = (m: DOMMatrixReadOnly, width: unknown) =>
    m.m41 + Number.parseFloat(String(width)) / 2
  const dx = center(end, to.width) - center(start, from.width)
  const across = Math.abs(dx) >= 1 ? LEG : 0
  const total = EXIT + across + LEG
  const at = (ms: number) => ms / total

  start.m41 += dx
  effect.setKeyframes([
    { ...from, offset: 0, easing: 'linear' },
    { ...from, offset: at(EXIT), easing: EASE_IN_OUT },
    ...(across
      ? [{ ...from, transform: start.toString(), offset: at(EXIT + across), easing: EASE_IN_OUT }]
      : []),
    { ...to, offset: 1 },
  ])
  effect.updateTiming({ delay: 0, duration: total, easing: 'linear', fill: 'both' })

  // The card's crop gives way to the hero's while the frame resizes.
  for (const pseudo of [imagePair, old, next]) {
    for (const animation of pseudo.getAnimations()) {
      animation.effect?.updateTiming({ delay: EXIT + across, duration: LEG, fill: 'both' })
    }
  }

  document
    .querySelector<HTMLElement>('[data-slot="work-hero"]')
    ?.style.setProperty('--morph-hold', `${total}ms`)
}
