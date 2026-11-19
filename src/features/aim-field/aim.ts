/**
 * What the aim locks onto, shared by the field's reticle (`field.ts`) and the
 * standalone one (`AimReticle`): a control, then media, then the line of text
 * under the point. `[data-aim="off"]` opts a subtree out.
 */
export type AimTarget = 'free' | 'text' | 'media' | 'act'
export type AimLock = { kind: Exclude<AimTarget, 'free'>; rect: () => DOMRect }

const ACT = 'a[href], button, input, select, textarea, summary, [role="button"], [data-aim="act"]'
const MEDIA = 'img, picture, video, svg, figure, [data-aim="media"]'
const TEXT =
  'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, label, dt, dd, [data-aim="text"]'

type Rect = { x0: number; y0: number; x1: number; y1: number }

/** The line box of text under the point, or null between lines. */
function textLine(el: Element, x: number, y: number): DOMRect | null {
  const range = document.createRange()
  range.selectNodeContents(el)
  let hit: Rect | null = null
  for (const r of Array.from(range.getClientRects())) {
    if (r.width === 0 || y < r.top || y > r.bottom) continue
    hit = hit
      ? {
          x0: Math.min(hit.x0, r.left),
          y0: Math.min(hit.y0, r.top),
          x1: Math.max(hit.x1, r.right),
          y1: Math.max(hit.y1, r.bottom),
        }
      : { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }
  }
  if (!hit || x < hit.x0 - 8 || x > hit.x1 + 8) return null
  return new DOMRect(hit.x0, hit.y0, hit.x1 - hit.x0, hit.y1 - hit.y0)
}

/** The lock for the element under a client point: a live rect, or null for free aim. */
export function lockAt(hit: Element | null, x: number, y: number): AimLock | null {
  if (!hit || hit.closest('[data-aim="off"]')) return null
  const act = hit.closest(ACT)
  if (act) return { kind: 'act', rect: () => act.getBoundingClientRect() }
  const media = hit.closest(MEDIA)
  if (media) return { kind: 'media', rect: () => media.getBoundingClientRect() }
  const text = hit.closest(TEXT)
  if (!text) return null
  const line = textLine(text, x, y)
  if (!line) return null
  // Keep the line pinned to its element when the page scrolls under the lock.
  const anchor = text.getBoundingClientRect()
  const dx = line.x - anchor.x
  const dy = line.y - anchor.y
  return {
    kind: 'text',
    rect: () => {
      const now = text.getBoundingClientRect()
      return new DOMRect(now.x + dx, now.y + dy, line.width, line.height)
    },
  }
}
