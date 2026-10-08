import type { useRouter } from 'next/navigation'
import { pageReady } from './page-ready'

type Router = ReturnType<typeof useRouter>

/** The longest the arriving page waits on its assets before it shows regardless. */
const HOLD_LIMIT = 4000
/** A navigation that never lands gives the page back after this. */
const NAVIGATION_LIMIT = 10000

let opening = false

const finished = (el: Element) =>
  Promise.all(el.getAnimations().map((animation) => animation.finished)).catch(() => {})

/** Until the route has changed (the new page has committed), or the navigation is given up on. */
const landed = (from: string) =>
  new Promise<void>((resolve) => {
    const started = performance.now()
    const check = () => {
      if (location.pathname !== from || performance.now() - started > NAVIGATION_LIMIT) resolve()
      else requestAnimationFrame(check)
    }
    check()
  })

/**
 * Opens `href` behind a curtain (`[data-page-curtain]` in globals.css). The
 * page leaves under it, the route changes and the next page loads hidden
 * (`data-page-held` holds its CSS openings), and the curtain lifts only once
 * that page is complete on screen (`pageReady`): pictures decoded and every
 * effect drawing live, never its stand-in poster. The chrome stays above.
 */
export async function openBehindCurtain(href: string, router: Router) {
  if (opening) return
  opening = true
  router.prefetch(href)

  const curtain = document.createElement('div')
  curtain.setAttribute('aria-hidden', 'true')
  curtain.dataset.pageCurtain = 'cover'
  document.body.append(curtain)
  const root = document.documentElement
  try {
    await finished(curtain)
    const from = location.pathname
    root.setAttribute('data-page-held', '')
    router.push(href)
    await landed(from)
    await pageReady(HOLD_LIMIT)
    root.removeAttribute('data-page-held')
    curtain.dataset.pageCurtain = 'lift'
    await finished(curtain)
  } finally {
    root.removeAttribute('data-page-held')
    curtain.remove()
    opening = false
  }
}
