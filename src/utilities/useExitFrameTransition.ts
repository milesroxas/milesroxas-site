// utilities/useExitFrameTransition.ts
'use client'

import { useCallback, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import type { LinkProps } from 'next/link'
import gsap from 'gsap'

// extract the correct event type from LinkProps:
type NavigateEvent = Parameters<NonNullable<LinkProps['onNavigate']>>[0]

// Define a type for tweenVars that excludes the position property
type AnimatableTweenVars = Omit<gsap.TweenVars, 'position'>

/**
 * Animate your frame bars, then navigate.
 */
export function useExitFrameTransition(
  href: string,
  target: string | RefObject<HTMLElement>,
  tweenVars: AnimatableTweenVars,
): (e: NavigateEvent) => void {
  const router = useRouter()

  return useCallback(
    (e: NavigateEvent) => {
      e.preventDefault()

      let elements: HTMLElement[] = []
      if (typeof target === 'string') {
        elements = Array.from(document.querySelectorAll(target))
      } else if (target.current) {
        elements = [target.current]
      }

      if (elements.length) {
        // Set position fixed immediately before starting the animation
        gsap.set(elements, { position: 'fixed' })
        gsap.to(elements, {
          ...tweenVars,
          // position is now handled by gsap.set above
          onComplete: () => router.push(href),
        })
      } else {
        router.push(href)
      }
    },
    [href, router, target, tweenVars],
  )
}
