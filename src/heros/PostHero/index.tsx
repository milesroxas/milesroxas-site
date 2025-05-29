'use client'
import { formatDateTime } from 'src/utilities/formatDateTime'
import React, { useEffect, useRef } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const { categories, hero, publishedAt, title } = post
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
    <div className="relative -mt-[10.4rem] flex items-end" ref={heroRef}>
      <div className="min-h-[80vh] select-none">
        {hero && typeof hero !== 'string' && (
          <Media
            fill
            priority
            imgClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
            videoClassName="absolute inset-0 w-full h-full object-cover pointer-events-none"
            resource={hero.media}
          />
        )}
        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 container pb-8 text-white lg:grid lg:grid-cols-[1fr_48rem_1fr]">
        <div className="col-span-1 col-start-1 md:col-span-2 md:col-start-2">
          <div className="mb-6 text-sm uppercase">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:gap-16">
            {publishedAt && (
              <time dateTime={publishedAt} className="text-light text-sm">
                {formatDateTime(publishedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
