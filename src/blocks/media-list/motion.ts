import { readPrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

/** Every timing the Media list owns. */
export const MEDIA_LIST_MOTION = {
  /** `--ease-out-quint`. */
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** The media wipe, in the direction the reader moved (ms). */
  swap: 1100,
  /** Base for the marker: dashes switch on 15% of it apart (ms). */
  marker: 600,
  /** Hover must rest this long before it commits, so a sweep across the list fires nothing (ms). */
  dwell: 120,
  /** Reduced motion: every change is a plain crossfade (ms). */
  fade: 300,
} as const

export type Flow = 'down' | 'up'
type Dir = 1 | -1

const OPEN = 'inset(0% 0% 0% 0%)'
const STEP = 'steps(1, end)'

/** Animates from where the element is now (or `from`) to `to`, replacing its running motion. */
function animateTo(el: HTMLElement, to: Keyframe, duration: number, from?: Keyframe) {
  const start: Keyframe = { ...from }
  if (!from) {
    const style = getComputedStyle(el) as unknown as Record<string, string>
    for (const key of Object.keys(to)) start[key] = style[key]
  }
  for (const animation of el.getAnimations()) animation.cancel()
  el.animate([start, to], { duration, easing: MEDIA_LIST_MOTION.ease, fill: 'forwards' })
}

const running = (el: HTMLElement | null | undefined) =>
  Boolean(el?.getAnimations().some((a) => a.playState === 'running'))

/**
 * The frame's layers, one per item, ordered bottom to top. A swap lifts the
 * incoming layer to the top and wipes it open in the direction of travel
 * (rising from the bottom going down the list). Choosing the item just left
 * while its successor is still opening closes the successor back the way it
 * came; choosing it again reopens it. No cut, no scale.
 */
export function createLayerStack(count: number) {
  const order = Array.from({ length: count }, (_, i) => count - 1 - i)
  const openedWith: Dir[] = Array(count).fill(1)
  const closed = (dir: Dir, reduced: boolean): Keyframe =>
    reduced
      ? { opacity: 0 }
      : { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }
  const open = (reduced: boolean): Keyframe => (reduced ? { opacity: 1 } : { clipPath: OPEN })

  return {
    zIndex: (i: number) => order.indexOf(i),
    swap(layers: (HTMLElement | null)[], from: number, to: number) {
      const reduced = readPrefersReducedMotion()
      const duration = reduced ? MEDIA_LIST_MOTION.fade : MEDIA_LIST_MOTION.swap
      const top = order[order.length - 1]
      const under = order[order.length - 2]
      const target = layers[to]
      if (top === to) {
        if (target) animateTo(target, open(reduced), duration)
        return 'resume' as const
      }
      if (top === from && under === to && running(layers[from])) {
        const leaving = layers[from]
        if (leaving) animateTo(leaving, closed(openedWith[from] ?? 1, reduced), duration)
        return 'resume' as const
      }
      const dir: Dir = to > from ? 1 : -1
      order.splice(order.indexOf(to), 1)
      order.push(to)
      order.forEach((i, z) => {
        const layer = layers[i]
        if (layer) layer.style.zIndex = String(z)
      })
      openedWith[to] = dir
      if (target) animateTo(target, open(reduced), duration, closed(dir, reduced))
      return 'restart' as const
    },
  }
}

/**
 * The marker flickers on in place: its dashes switch on one at a time from the
 * side the reader came from, and the long dash (which leads the flow) lands
 * last with the only flicker, one dip. Nothing grows or moves.
 */
export function markerIn(marker: HTMLElement, flow: Flow) {
  if (readPrefersReducedMotion()) {
    return [marker.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 })]
  }
  const base = MEDIA_LIST_MOTION.marker
  const gap = base * 0.15
  const lead = base * 0.1
  const dashes = Array.from(marker.children) as HTMLElement[]
  const out = dashes.map((dash, i) =>
    dash.animate([{ opacity: 0, easing: STEP }, { opacity: 1 }], {
      duration: 1,
      delay: lead + (flow === 'down' ? i : dashes.length - 1 - i) * gap,
      fill: 'backwards',
    }),
  )
  const long = dashes[flow === 'down' ? dashes.length - 1 : 0]
  if (long) {
    out.push(
      long.animate(
        [
          { opacity: 1, easing: STEP },
          { opacity: 0.35, offset: 0.5, easing: STEP },
          { opacity: 1 },
        ],
        { duration: base * 0.25, delay: lead + (dashes.length - 1) * gap + base * 0.2 },
      ),
    )
  }
  return out
}

/** The marker it replaces fades in place; the shut clip takes over once it is gone. */
export function markerOut(marker: HTMLElement) {
  return [
    marker.animate(
      [
        { clipPath: OPEN, opacity: 1 },
        { clipPath: OPEN, opacity: 0 },
      ],
      {
        duration: readPrefersReducedMotion() ? 200 : MEDIA_LIST_MOTION.marker * 0.5,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'backwards',
      },
    ),
  ]
}
