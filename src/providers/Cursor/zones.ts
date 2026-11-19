/**
 * Cursor zones: a `[data-cursor-zone]` element draws its own cursor (the CTA
 * link's aim field), clipped to its box. The site cursor is cut out of every
 * zone box at the same edge, so crossing in hands one cursor to the other
 * instead of swapping them. The ring trails the pointer, so it slides under
 * the edge rather than vanishing.
 *
 * Each layer is a zero-size fixed element moved by transform: a path in its
 * local px, with the zone boxes as evenodd holes, does the cut. The loop runs
 * only while a zone is in the document.
 */
const FAR = 1e5
const ZONE = '[data-cursor-zone]'

export function cursorZones(layers: HTMLElement[]) {
  let raf = 0

  const clear = () => {
    for (const layer of layers) layer.style.clipPath = ''
  }

  const frame = () => {
    const boxes = Array.from(document.querySelectorAll(ZONE))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width && r.height && r.bottom > 0 && r.top < window.innerHeight)
    if (!document.querySelector(ZONE)) {
      raf = 0
      clear()
      return
    }
    raf = requestAnimationFrame(frame)
    if (!boxes.length) {
      clear()
      return
    }
    for (const layer of layers) {
      const o = layer.getBoundingClientRect()
      const holes = boxes
        .map((r) => {
          const x0 = r.left - o.left
          const y0 = r.top - o.top
          return `M${x0} ${y0}H${r.right - o.left}V${r.bottom - o.top}H${x0}Z`
        })
        .join('')
      layer.style.clipPath = `path(evenodd, "M${-FAR} ${-FAR}H${FAR}V${FAR}H${-FAR}Z${holes}")`
    }
  }

  return {
    /** Start the loop if a zone is on the page; call it from the pointer handler. */
    wake() {
      if (!raf && document.querySelector(ZONE)) raf = requestAnimationFrame(frame)
    },
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      clear()
    },
  }
}
