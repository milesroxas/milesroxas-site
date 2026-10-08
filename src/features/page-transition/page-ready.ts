import { CROSSFADE_MS } from '@/features/immersive/visual/poster'

/** Fixed layers that are not the arriving page. */
const NOT_PAGE = '#site-chrome, [data-page-curtain]'

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Rendered (not a `display: none` theme twin), inside the viewport, and part of the page. */
const onScreen = (el: Element) => {
  if (el.closest(NOT_PAGE) || el.getClientRects().length === 0) return false
  const rect = el.getBoundingClientRect()
  return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth
}

const decoded = (img: HTMLImageElement) => img.decode().catch(() => {})

const firstFrame = (video: HTMLVideoElement) =>
  video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        video.addEventListener('loadeddata', () => resolve(), { once: true })
        video.addEventListener('error', () => resolve(), { once: true })
      })

/**
 * Until every effect slot on screen has drawn its first live frame and the
 * poster under it has faded out. A slot that will stay a poster is never
 * pending (`data-visual-pending`, `useLiveVisual`).
 */
async function liveFrames(deadline: number) {
  let waited = false
  while (
    performance.now() < deadline &&
    [...document.querySelectorAll('[data-visual-pending]')].some(onScreen)
  ) {
    waited = true
    await nextFrame()
  }
  if (waited) await wait(CROSSFADE_MS)
}

/**
 * Resolves once the page in the viewport is complete: fonts loaded, every
 * picture on screen decoded, every video holding a frame, and every live
 * effect drawing in place of its poster. Never later than `limit` ms, so a
 * stalled asset cannot hold the page back for good.
 */
export async function pageReady(limit: number) {
  const deadline = performance.now() + limit
  // Two frames: the arriving slots publish whether they are pending after their first commit.
  await nextFrame()
  await nextFrame()
  const media = [...document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video')]
    .filter(onScreen)
    .map((el) => (el instanceof HTMLVideoElement ? firstFrame(el) : decoded(el)))
  await Promise.race([
    Promise.all([document.fonts.ready, ...media]).then(() => liveFrames(deadline)),
    wait(limit),
  ])
}
