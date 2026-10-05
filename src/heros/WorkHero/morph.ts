import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState, type ViewTransitionInstance } from 'react'
import { exitPageAround } from './pageExit'

/**
 * The work card → case study opening (`.work-morph` in globals.css), in three
 * beats. The page parts around the clicked picture (`pageExit.ts`). The
 * picture, which the card and the hero frame share by view-transition name,
 * takes the hero's shape where it stands and then travels into the frame.
 * The case study's copy and body load in as it lands.
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
let restore: (() => void) | null = null

/** Puts back the page the exit cleared, once the old snapshot no longer needs it. */
function restorePage() {
  restore?.()
  restore = null
  exiting = false
}

/**
 * A work card's side of the opening. The card takes its name only once
 * clicked: a list can hold cards for works the next page also lists (related
 * works), and every named pair would morph, not just the one opened. A
 * modified click opens a new tab, so it leaves the card as it is. Reduced
 * motion skips the exit and lets the link navigate at once.
 */
export function useWorkCardMorph(
  slug: string | null | undefined,
  href: string,
  imageRef: React.RefObject<HTMLElement | null>,
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
    const picture = imageRef.current
    if (!opening || !picture || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // The exit plays while the case study loads. If it arrives first, the old
    // page's fade (globals.css) finishes what the exit started.
    event.preventDefault()
    exiting = true
    const exit = exitPageAround(picture)
    restore = exit.restore
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

/** The picture takes the hero frame's shape in place, before it moves. */
const RESIZE = 280
/** Travel time grows with the path, within these bounds. */
const TRAVEL = { min: 360, max: 640, base: 240, perPx: 0.55 }
/** The travel starts inside the last 1% of the resize, so the two never visibly overlap. */
const HANDOFF = 40
/** The radius the path turns its corner on. */
const CORNER = 32
/** The case study's copy starts this long before the picture comes to rest. */
const LAND_LEAD = 160
const FRAME = 1000 / 60

/** A CSS `cubic-bezier()` as a function of time, solved by bisection. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3
  return (x: number) => {
    let [lo, hi, t] = [0, 1, x]
    for (let i = 0; i < 24; i++) {
      if (at(x1, x2, t) < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return at(y1, y2, t)
  }
}

/** Morphing in place: even acceleration and settle. */
const resizeEase = cubicBezier(0.65, 0, 0.35, 1)
/** Travel: a firm start and a long, soft landing. */
const travelEase = cubicBezier(0.6, 0, 0.2, 1)

/**
 * The route from the picture's center to the hero's: across, then down (or
 * up), turning the corner on a short arc so the picture never stops and never
 * cuts a diagonal. Walked by distance along the path.
 */
function lPath(x0: number, y0: number, x1: number, y1: number) {
  const [ax, ay] = [Math.abs(x1 - x0), Math.abs(y1 - y0)]
  const [sx, sy] = [Math.sign(x1 - x0), Math.sign(y1 - y0)]
  const r = ax < 1 || ay < 1 ? 0 : Math.min(CORNER, ax / 3, ay / 3)
  const across = ax - r
  const turn = (Math.PI * r) / 2
  const length = across + turn + (ay - r)
  const at = (s: number) => {
    if (s <= across) return [x0 + sx * s, y0]
    if (s <= across + turn) {
      const angle = (s - across) / r
      return [x1 - sx * r * (1 - Math.sin(angle)), y0 + sy * r * (1 - Math.cos(angle))]
    }
    return [x1, y0 + sy * (r + s - across - turn)]
  }
  return { length, at }
}

const px = (value: unknown) => Number.parseFloat(String(value))
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

type Pseudo = { getAnimations(): Animation[] }
type MorphInstance = ViewTransitionInstance & Record<'group' | 'imagePair' | 'old' | 'new', Pseudo>

/**
 * Retimes the browser's straight-line morph. The picture first resizes to
 * the hero frame where it stands (the card's crop gives way to the hero's
 * meanwhile), then travels along `lPath` on one easing, so it speeds up,
 * rounds the corner and settles into the frame as one motion. A step with
 * nothing to cover drops out. Sampled per frame so each step keeps its own
 * easing. Reduced motion leaves no group animation, so nothing is retimed.
 */
function choreographWorkMorph(instance: ViewTransitionInstance) {
  // The old snapshot is taken: the page the exit cleared can come back.
  restorePage()
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
  const path = lPath(start.m41 + w0 / 2, start.m42 + h0 / 2, end.m41 + w1 / 2, end.m42 + h1 / 2)

  const resize = Math.max(Math.abs(w1 - w0), Math.abs(h1 - h0)) >= 2 ? RESIZE : 0
  const travel =
    path.length >= 1 ? clamp(TRAVEL.base + path.length * TRAVEL.perPx, TRAVEL.min, TRAVEL.max) : 0
  const departs = resize && travel ? resize - HANDOFF : resize
  const total = Math.max(departs + travel, 1)
  const progress = (ms: number, begin: number, duration: number, ease: (t: number) => number) =>
    duration ? ease(clamp((ms - begin) / duration, 0, 1)) : 1

  const count = Math.ceil(total / FRAME)
  const keyframes = Array.from({ length: count }, (_, i) => {
    const ms = (total * i) / count
    const size = progress(ms, 0, resize, resizeEase)
    const width = w0 + (w1 - w0) * size
    const height = h0 + (h1 - h0) * size
    const [x, y] = path.at(path.length * progress(ms, departs, travel, travelEase))
    const matrix = DOMMatrix.fromMatrix(start)
    matrix.m41 = x - width / 2
    matrix.m42 = y - height / 2
    const frame = { transform: matrix.toString(), width: `${width}px`, height: `${height}px` }
    return { ...from, ...frame, offset: i / count, easing: 'linear' }
  })
  effect.setKeyframes([...keyframes, { ...to, offset: 1 }])
  effect.updateTiming({ delay: 0, duration: total, easing: 'linear', fill: 'both' })

  const swap = resize || total
  for (const pseudo of [imagePair, old, next]) {
    for (const animation of pseudo.getAnimations()) {
      animation.effect?.updateTiming({ delay: 0, duration: swap, fill: 'both' })
    }
  }
  // This can run a few frames into the transition (the CSS delay holds the
  // picture till then): start the choreography from its first frame.
  for (const pseudo of [group, imagePair, old, next]) {
    for (const animation of pseudo.getAnimations()) animation.currentTime = 0
  }

  // The hero and the body after it wait for the landing (`--morph-hold`).
  document
    .querySelector<HTMLElement>('[data-slot="work-hero"]')
    ?.parentElement?.style.setProperty('--morph-hold', `${Math.max(total - LAND_LEAD, 0)}ms`)
}
