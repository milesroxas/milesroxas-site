'use client'

import type * as React from 'react'
import { useState } from 'react'
import { useTransitionClonePickup } from '@/hooks/useTransitionClonePickup'
import { cn } from '@/utilities/ui'

/**
 * The hero root. Arriving from a post card, the card's picture is already in
 * flight (`useCardTransition`): it lands on the featured image, which skips
 * its own wipe, and the copy holds until the picture has nearly settled.
 */
export function PostHeroRoot({ className, style, ...props }: React.ComponentProps<'header'>) {
  const ref = useTransitionClonePickup<HTMLElement>()
  const [arrival] = useState(() =>
    typeof window !== 'undefined' && window.__PAGE_TRANSITION_CLONE ? 'morph' : 'load',
  )

  return (
    <header
      ref={ref}
      className={cn(
        'flex flex-col gap-10 px-gutter pt-[calc(var(--chrome-top)+--spacing(10))] pb-16 text-foreground md:gap-14 md:pt-[calc(var(--chrome-top)+--spacing(20))] md:pb-24',
        className,
      )}
      data-arrival={arrival}
      data-band="dark"
      data-slot="post-hero"
      style={
        arrival === 'morph' ? ({ '--morph-hold': '700ms', ...style } as React.CSSProperties) : style
      }
      {...props}
    />
  )
}
