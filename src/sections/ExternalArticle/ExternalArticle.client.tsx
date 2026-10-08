'use client'

import { type ReactNode, useLayoutEffect, useState } from 'react'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'

/**
 * The band's shared reveal, then its arrival: once the copy has landed, the
 * arrow slides in and the rule draws (`data-arrival="pending"` holds them).
 * Pending is only set after hydration, so without JavaScript, and under
 * reduced motion where the reveal lands at once, both render at rest.
 */
export function ExternalArticleReveal({ children }: { children: ReactNode }) {
  const [armed, setArmed] = useState(false)
  const [landed, setLanded] = useState(false)
  useLayoutEffect(() => setArmed(true), [])

  return (
    <ScrollReveal as="div" className="container" onComplete={() => setLanded(true)} variant="intro">
      <div
        className="group/out relative flex flex-col gap-10 md:gap-16"
        data-arrival={armed && !landed ? 'pending' : undefined}
        data-reveal
      >
        {children}
      </div>
    </ScrollReveal>
  )
}
