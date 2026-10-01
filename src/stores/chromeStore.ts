import { create } from 'zustand'

/**
 * State the site chrome (src/components/SiteChrome) shares with the pages
 * and the card → detail page transition.
 *
 * - `visible`: false while a page transition owns the screen. The card's
 *   FLIP hides the chrome as its clone fills the viewport; the destination
 *   hero shows it again as the clone lands (`restoreChrome`).
 * - `transitionPhase`: where that transition is, for the heroes that pick
 *   up the clone.
 * - `title`: the page's own title, which the top bar shows beside its tab
 *   once the page's heading has scrolled away (`ChromeTitle`).
 */
type ChromeState = {
  visible: boolean
  setVisible: (visible: boolean) => void
  transitionPhase: 'initial' | 'clone-animating' | 'frame-ready' | 'complete'
  setTransitionPhase: (phase: ChromeState['transitionPhase']) => void
  title: { text: string; shown: boolean } | null
  setTitle: (title: ChromeState['title']) => void
}

export const useChromeStore = create<ChromeState>((set) => ({
  visible: true,
  setVisible: (visible) => set({ visible }),
  transitionPhase: 'initial',
  setTransitionPhase: (transitionPhase) => set({ transitionPhase }),
  title: null,
  setTitle: (title) => set({ title }),
}))

/**
 * Brings the chrome back after a page transition, then runs `onComplete`.
 * The chrome's own enter is a CSS transition, so nothing here waits on it:
 * the caller's next step (the clone settling into the hero) plays alongside.
 */
export function restoreChrome(onComplete?: () => void) {
  useChromeStore.getState().setVisible(true)
  onComplete?.()
}
