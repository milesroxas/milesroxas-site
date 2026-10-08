'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'
import type { StoredVisualSlot } from '@/features/immersive/visual'
import { preloadVisualRuntime } from '@/features/immersive/visual/preload'
import { openBehindCurtain } from './curtain'

/**
 * A link's click handler that opens `href` behind the page curtain
 * (`openBehindCurtain`). `hero` is the visual slot the destination opens on:
 * an effect's runtime starts loading with the click, inside the curtain's
 * wait. A modified or non-primary click (a new tab) is left to the link.
 */
export function useCurtainLink(href: string, hero?: StoredVisualSlot | null) {
  const router = useRouter()
  return (event: React.MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    if (new URL(href, location.href).pathname === location.pathname) return
    event.preventDefault()
    const effect = hero?.visualType
    if (effect === 'streakField' || effect === 'lightLeak') preloadVisualRuntime(effect)
    void openBehindCurtain(href, router)
  }
}
