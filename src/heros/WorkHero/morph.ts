import type React from 'react'
import { useState } from 'react'

/**
 * The work card → case study morph (`.work-morph` in globals.css). The card's
 * picture and the hero frame share one view-transition name per work, so the
 * browser carries the picture from one into the other.
 */
export const workMorphName = (slug: string) => `work-media-${slug}`

let opening: string | null = null

/**
 * Marks the work a card is opening, so its hero frame lets the picture arrive
 * by morph instead of playing its own wipe. Only where the browser can morph:
 * elsewhere the frame wipes in as on a fresh load.
 */
function markWorkMorph(slug: string) {
  opening = 'startViewTransition' in document ? slug : null
}

export const isWorkMorph = (slug: string) => opening === slug

export function clearWorkMorph() {
  opening = null
}

/**
 * A work card's side of the morph. The card takes its name only once clicked:
 * a list can hold cards for works the next page also lists (related works),
 * and every named pair would morph, not just the one opened. A modified click
 * opens a new tab, so it leaves the card as it is.
 */
export function useWorkCardMorph(slug: string | null | undefined) {
  const [named, setNamed] = useState(false)
  const onClick = (event: React.MouseEvent) => {
    if (!slug || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    markWorkMorph(slug)
    setNamed(true)
  }
  return { name: named && slug ? workMorphName(slug) : undefined, onClick }
}
