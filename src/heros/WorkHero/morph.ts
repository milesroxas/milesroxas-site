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
/** Each travel step: across to the hero's center, then vertically into place. */
const MOVE = 400
/** The last step: the picture resizes to the hero frame, standing still. */
const RESIZE = 320
/**
 * Each step starts this early, inside the last 1% of the step before, so the
 * picture turns its corner without a dead stop and never visibly travels two
 * ways (or moves while resizing) at once.
 */
const HANDOFF = 60
const FRAME = 1000 / 60

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2)
const px = (value: unknown) => Number.parseFloat(String(value))

type Pseudo = { getAnimations(): Animation[] }
type MorphInstance = ViewTransitionInstance & Record<'group' | 'imagePair' | 'old' | 'new', Pseudo>
type Step = { key: 'x' | 'y' | 'size'; duration: number; distance: number }

/**
 * Retimes the browser's straight-line morph into steps: the picture holds
 * while the page fades, travels across to the hero's center, then vertically
 * into place, then resizes to the frame, and lands as the hero's copy starts
 * its load-in. A step with nothing to cover drops out. The path is sampled
 * per frame so each step keeps its own easing. Reduced motion leaves no group
 * animation, so nothing is retimed.
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

  const start = new DOMMatrixReadOnly(String(from.transform))
  const end = new DOMMatrixReadOnly(String(to.transform))
  const [w0, h0, w1, h1] = [px(from.width), px(from.height), px(to.width), px(to.height)]
  const x0 = start.m41 + w0 / 2
  const y0 = start.m42 + h0 / 2
  const x1 = end.m41 + w1 / 2
  const y1 = end.m42 + h1 / 2

  const steps: Step[] = [
    { key: 'x', duration: MOVE, distance: Math.abs(x1 - x0) },
    { key: 'y', duration: MOVE, distance: Math.abs(y1 - y0) },
    { key: 'size', duration: RESIZE, distance: Math.max(Math.abs(w1 - w0), Math.abs(h1 - h0)) },
  ]
  let total = EXIT
  const timed = steps
    .filter((step) => step.distance >= 1)
    .map((step, i) => {
      const begin = i === 0 ? total : total - HANDOFF
      total = begin + step.duration
      return { ...step, begin }
    })
  const progress = (key: Step['key'], ms: number) => {
    const step = timed.find((s) => s.key === key)
    if (!step) return 1
    return easeInOut(Math.min(Math.max((ms - step.begin) / step.duration, 0), 1))
  }

  const count = Math.ceil(total / FRAME)
  const path = Array.from({ length: count }, (_, i) => {
    const ms = (total * i) / count
    const size = progress('size', ms)
    const width = w0 + (w1 - w0) * size
    const height = h0 + (h1 - h0) * size
    const matrix = DOMMatrix.fromMatrix(start)
    matrix.m41 = x0 + (x1 - x0) * progress('x', ms) - width / 2
    matrix.m42 = y0 + (y1 - y0) * progress('y', ms) - height / 2
    const frame = { transform: matrix.toString(), width: `${width}px`, height: `${height}px` }
    return { ...from, ...frame, offset: i / count, easing: 'linear' }
  })
  effect.setKeyframes([...path, { ...to, offset: 1 }])
  effect.updateTiming({ delay: 0, duration: total, easing: 'linear', fill: 'both' })

  // The card's crop gives way to the hero's while the frame resizes.
  const swap = timed.find((s) => s.key === 'size') ??
    timed[timed.length - 1] ?? { begin: EXIT, duration: MOVE }
  for (const pseudo of [imagePair, old, next]) {
    for (const animation of pseudo.getAnimations()) {
      animation.effect?.updateTiming({ delay: swap.begin, duration: swap.duration, fill: 'both' })
    }
  }

  document
    .querySelector<HTMLElement>('[data-slot="work-hero"]')
    ?.style.setProperty('--morph-hold', `${total}ms`)
}
