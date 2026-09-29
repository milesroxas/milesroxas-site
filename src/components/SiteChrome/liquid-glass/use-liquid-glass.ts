'use client'

import { type RefCallback, type RefObject, useCallback } from 'react'
import { attachLiquidGlass } from './attach'
import type { GlassOptics } from './optics'

/**
 * A ref that puts the liquid glass on its element for as long as the element
 * is mounted, including through an exit animation, and forwards the element
 * to `forward` for code that also needs it (a morph, a focus return).
 */
export function useLiquidGlass<T extends HTMLElement>(
  optics: GlassOptics,
  forward?: RefObject<T | null>,
): RefCallback<T> {
  return useCallback(
    (element: T | null) => {
      if (forward) forward.current = element
      if (!element) return
      const detach = attachLiquidGlass(element, optics)
      return () => {
        detach()
        if (forward) forward.current = null
      }
    },
    [optics, forward],
  )
}
