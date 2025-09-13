'use client'
import { formatDateTime } from 'src/utilities/formatDateTime'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

import { useFrameAnimation } from '@/hooks/useFrameAnimation'
import { useSiteFrameStore } from '@/stores/siteframeStore'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, hero, publishedAt, title } = post
  const heroRef = useRef<HTMLDivElement>(null)
  const { restoreFrame } = useFrameAnimation()
  const { setTransitionPhase } = useSiteFrameStore()

  useEffect(() => {
    const handleTransition = () => {
      const clone = window.__PAGE_TRANSITION_CLONE as HTMLElement | undefined
      const heroEl = heroRef.current
      
      if (!clone) return

      // Ensure clone is visible and properly positioned
      Object.assign(clone.style, {
        visibility: 'visible',
        opacity: '1',
        zIndex: '10000',
        transformOrigin: 'center center',
      })

      if (!heroEl) {
        // No hero element, restore frame and fade out
        restoreFrame(() => {
          gsap.to(clone, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              clone.remove()
              window.__PAGE_TRANSITION_CLONE = undefined
              window.__PAGE_TRANSITION_SCROLL_DATA = undefined
              setTransitionPhase('complete')
            },
          })
        })
        return
      }

      // Find the target media element
      const mediaEl = heroEl.querySelector('img, video') as HTMLElement | null
      
      if (!mediaEl) {
        // No media element, restore frame and fade out
        restoreFrame(() => {
          gsap.to(clone, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              clone.remove()
              window.__PAGE_TRANSITION_CLONE = undefined
              window.__PAGE_TRANSITION_SCROLL_DATA = undefined
              setTransitionPhase('complete')
            },
          })
        })
        return
      }

      // Wait for layout to stabilize before getting target position
      requestAnimationFrame(() => {
        // Get target element position (new page is at scroll 0)
        const targetRect = mediaEl.getBoundingClientRect()
        
        // Target coordinates are viewport-relative (new page starts at scroll 0)
        const targetTop = targetRect.top
        const targetLeft = targetRect.left

        // Restore frame first, then animate
        restoreFrame(() => {
          setTransitionPhase('frame-ready')
          
          const tl = gsap.timeline({
            onComplete: () => {
              clone.remove()
              window.__PAGE_TRANSITION_CLONE = undefined
              window.__PAGE_TRANSITION_SCROLL_DATA = undefined
              // Ensure original media is visible
              mediaEl.style.visibility = 'visible'
              setTransitionPhase('complete')
            },
          })
          // Reset any transforms from the source animation
          tl.set(clone, { scale: 1 })
            // Animate to target position with consistent timing
            .to(clone, {
              top: `${targetTop}px`,
              left: `${targetLeft}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              duration: 0.7,
              ease: 'power2.inOut',
            })
            // Fade out clone smoothly
            .to(
              clone,
              {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
              },
              '>-0.1',
            )
        })
      })
    }

    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(handleTransition, 50)
    return () => clearTimeout(timeoutId)
  }, [restoreFrame, setTransitionPhase])

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
