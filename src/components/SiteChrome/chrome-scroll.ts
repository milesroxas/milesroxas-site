'use client'

/**
 * One scroll subscription for the fixed site chrome (header + footer bars).
 *
 * Everything that keys chrome state off the scroll position (the phone tab
 * bar's minimize, the Contents button) reads from here rather than
 * owning a `scroll` listener: one `scrollY` read per event, fanned out, and
 * one place that knows when the page frame cannot be trusted.
 *
 * The takeover menu freezes `[data-page-frame]` for the whole open (`inert`,
 * `position: fixed`, scaled): the document collapses, `scrollY` snaps to 0
 * and every rect inside the frame is scaled. Nothing here runs while that
 * attribute is present, and when it is dropped (`restoreFrame`, after the
 * frame is back in flow and the scroll offset is final) every subscriber is
 * run once against the real position. That thaw dispatch is what keeps the
 * chrome honest after a menu-link navigation: the new route lands at 0, the
 * collapsed document was already at 0, so no scroll event ever fires.
 */

const PAGE_FRAME_SELECTOR = '[data-page-frame]'

type ChromeScrollListener = (scrollY: number) => void

let frame: HTMLElement | null = null

/** The page frame, re-queried only if the cached one has left the document. */
const pageFrame = (): HTMLElement | null => {
  if (!frame?.isConnected) frame = document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)
  return frame
}

/** True while the takeover menu holds the page frame: no scroll-derived state may be read. */
export const pageFrameFrozen = (): boolean => pageFrame()?.hasAttribute('inert') ?? false

const listeners = new Set<ChromeScrollListener>()
let frameObserver: MutationObserver | null = null
let observedFrame: HTMLElement | null = null

const dispatch = () => {
  if (pageFrameFrozen()) return
  const scrollY = window.scrollY
  for (const listener of listeners) listener(scrollY)
}

/** Fires on every `inert` change; only the thaw gets through `dispatch`. */
const observeFrame = () => {
  const target = pageFrame()
  if (target === observedFrame) return
  frameObserver?.disconnect()
  observedFrame = target
  if (!target) {
    frameObserver = null
    return
  }
  frameObserver = new MutationObserver(dispatch)
  frameObserver.observe(target, { attributes: true, attributeFilter: ['inert'] })
}

const start = () => {
  window.addEventListener('scroll', dispatch, { passive: true })
}

const stop = () => {
  window.removeEventListener('scroll', dispatch)
  frameObserver?.disconnect()
  frameObserver = null
  observedFrame = null
}

/**
 * Subscribe to the chrome's scroll position. Runs on every scroll event
 * while the page frame is live, and once when the frame thaws. Returns the
 * unsubscribe.
 */
export function onChromeScroll(listener: ChromeScrollListener): () => void {
  if (listeners.size === 0) start()
  observeFrame()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}
