'use client'
import { formatDateTime } from 'src/utilities/formatDateTime'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, hero, publishedAt, title } = post
  const heroRef = useRef<HTMLDivElement>(null)
  const restoreFrame = usePageAnimationStore((s) => s.restoreFrame)

  useEffect(() => {
    // Wait for the DOM to fully render before trying to access the clone
    setTimeout(() => {
      const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
      if (!clone) return

      // Make sure the clone is visible
      Object.assign(clone.style, {
        visibility: 'visible',
        opacity: 1,
        zIndex: '10000',
      })

      const heroEl = heroRef.current
      if (!heroEl) {
        // No hero element, just fade out the clone after restoring frame
        restoreFrame(() => {
          gsap.to(clone, {
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => {
              clone.remove()
              window.__PAGE_TRANSITION_CLONE = undefined
            },
          })
        })
        return
      }

      // Find the media element in the hero
      const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
      if (!mediaEl) {
        // No media element, just fade out the clone after restoring frame
        restoreFrame(() => {
          gsap.to(clone, {
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => {
              clone.remove()
              window.__PAGE_TRANSITION_CLONE = undefined
            },
          })
        })
        return
      }

      // Wait a moment for the image to load properly
      setTimeout(() => {
        // Get the final position of the media element
        const { top, left, width, height } = mediaEl.getBoundingClientRect()

        // Ensure the clone is still visible and on top
        Object.assign(clone.style, {
          zIndex: '10000',
          visibility: 'visible',
          opacity: 1,
        })

        // First restore the site frame
        restoreFrame(() => {
          // Then animate the image to its final position
          gsap
            .timeline({
              onComplete: () => {
                clone.remove()
                window.__PAGE_TRANSITION_CLONE = undefined
                // Make sure the original media is visible
                mediaEl.style.visibility = 'visible'
              },
            })
            // Animate to the final position
            .to(clone, {
              top,
              left,
              width,
              height,
              duration: 0.8,
              ease: 'power3.inOut',
            })
            // Then fade it out
            .to(
              clone,
              {
                opacity: 0,
                duration: 0.3,
                ease: 'power1.out',
              },
              '>-0.1',
            )
        })
      }, 100) // Small delay to ensure all elements are properly rendered
    }, 100) // Initial delay to ensure component is mounted
  }, [restoreFrame])

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

      <div className="relative z-10 container pb-24 text-white lg:grid lg:grid-cols-[1fr_48rem_1fr]">
        <div className="col-span-1 col-start-1 pb-12 md:col-span-2 md:col-start-2">
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

          <div className="mb-12 flex flex-col gap-4 pb-12 md:flex-row md:gap-16">
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
