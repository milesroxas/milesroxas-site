import { create } from 'zustand'

/**
 * State the site chrome (src/components/SiteChrome) shares with the pages.
 *
 * - `title`: the page's own title, which the top bar shows beside its tab
 *   once the page's heading has scrolled away (`ChromeTitle`).
 */
type ChromeState = {
  title: { text: string; shown: boolean } | null
  setTitle: (title: ChromeState['title']) => void
}

export const useChromeStore = create<ChromeState>((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
}))
