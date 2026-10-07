/**
 * The first beat of a work card opening: the page fades away around the
 * clicked picture while the case study loads. Every visible piece of content
 * (a heading, a line of copy, a picture, a badge) fades and blurs out in
 * place on its own. The farthest pieces leave first, so the page clears in
 * toward the selection and the picture is the last thing standing. The
 * picture, the top bar and the dock stay.
 */

const DURATION = 280
/** The nearest piece leaves this long after the farthest. */
const SPREAD = 180
/** Past this many pieces the blur costs more than it adds. */
const BLUR_LIMIT = 60
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

const ATOMIC = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'svg', 'IFRAME', 'BUTTON', 'INPUT'])

/** Not page content. Fixed layers (the cursor, floating buttons) are skipped too. */
const SKIP = '#site-chrome, script, style, template, noscript'

function isLeaf(el: Element) {
  if (ATOMIC.has(el.tagName)) return true
  for (const child of el.children) {
    const display = getComputedStyle(child).display
    if (display !== 'none' && !display.startsWith('inline')) return false
  }
  return true
}

function isVisible(el: Element, style: CSSStyleDeclaration) {
  if (style.visibility === 'hidden' || Number(style.opacity) === 0) return false
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false
  return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth
}

function collect(root: Element, keep: Element, out: Element[]) {
  for (const el of root.children) {
    if (el === keep || el.matches(SKIP)) continue
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.position === 'fixed') continue
    if (style.display === 'contents') collect(el, keep, out)
    else if (!isVisible(el, style)) continue
    else if (el.contains(keep) || !isLeaf(el)) collect(el, keep, out)
    else out.push(el)
  }
}

/** How long each piece takes to leave, and how far apart the farthest and nearest start. */
export type ExitPace = { duration: number; spread: number }

/** Plays the exit, with a function that puts the page back once the snapshot no longer needs it. */
export function exitPageAround(
  keep: Element,
  { duration, spread }: ExitPace = { duration: DURATION, spread: SPREAD },
) {
  const pieces: Element[] = []
  collect(document.body, keep, pieces)

  const anchor = keep.getBoundingClientRect()
  const ax = anchor.left + anchor.width / 2
  const ay = anchor.top + anchor.height / 2
  const reach = Math.hypot(innerWidth, innerHeight) / 2
  const blur = pieces.length <= BLUR_LIMIT

  const animations = pieces.map((el) => {
    const rect = el.getBoundingClientRect()
    const distance = Math.hypot(rect.left + rect.width / 2 - ax, rect.top + rect.height / 2 - ay)
    return el.animate(
      { opacity: 0, ...(blur && { filter: 'blur(4px)' }) },
      {
        delay: (1 - Math.min(distance / reach, 1)) * spread,
        duration,
        easing: EASE_OUT,
        fill: 'forwards',
      },
    )
  })

  return {
    /** When the last piece is gone, on the `performance.now()` clock. */
    ends: performance.now() + spread + duration,
    restore: () => {
      for (const animation of animations) animation.cancel()
    },
  }
}
