// components/HighImpactHero.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText, showContent }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeaderTheme('dark')

    const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
    const heroEl = heroRef.current
    if (!clone || !heroEl) return

    // anchor transforms from the page top‑left
    clone.style.transformOrigin = 'top left'

    // find the real <img> so we get its exact position & size
    const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
    if (!mediaEl) {
      // if no hero media, just fade clone out
      gsap.to(clone, {
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          clone.remove()
          window.__PAGE_TRANSITION_CLONE = undefined
        },
      })
      return
    }

    const { top, left, width, height } = mediaEl.getBoundingClientRect()

    gsap
      .timeline({
        onComplete: () => {
          clone.remove()
          window.__PAGE_TRANSITION_CLONE = undefined
        },
      })
      // 1) shrink/move the clone into place
      .to(clone, {
        top,
        left,
        width,
        height,
        duration: 0.8,
        ease: 'power3.inOut',
      })
      // 2) then fade it out
      .to(
        clone,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out',
        },
        '>-0.1',
      )
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[78vh] w-full overflow-hidden text-white"
      data-theme="dark"
    >
      {/* full‑bleed background image or video */}
      {media && typeof media === 'object' && (
        <Media
          fill
          imgClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
          videoClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
          priority
          resource={media}
        />
      )}

      {/* your overlayed text + links */}
      {showContent && (
        <div className="relative z-10 container mx-auto flex min-h-[78vh] flex-col items-center justify-center px-4">
          {richText && (
            <RichText className="mb-6 text-center" data={richText} enableGutter={false} />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
