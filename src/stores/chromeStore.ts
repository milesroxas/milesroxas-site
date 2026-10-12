import { create } from 'zustand'
import type { OutboundLink } from '@/components/SiteChrome/outbound'

/**
 * State the site chrome (src/components/SiteChrome) shares with the pages.
 *
 * - `title`: the page's own title, which the top bar shows beside its tab
 *   once the page's heading has scrolled away (`ChromeTitle`).
 * - `link`: the page's live site, which the dock offers as a "Visit" button
 *   (`DockLink`). A case study sets it on arrival and clears it on leaving.
 */
type ChromeState = {
  title: { text: string; shown: boolean } | null
  setTitle: (title: ChromeState['title']) => void
  link: OutboundLink | null
  setLink: (link: OutboundLink | null) => void
}

export const useChromeStore = create<ChromeState>((set) => ({
  title: null,
  setTitle: (title) => set({ title }),
  link: null,
  setLink: (link) => set({ link }),
}))
