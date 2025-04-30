'use client'
import { cn } from '@/utilities/ui'
import React, { useRef, useEffect } from 'react'
import Link, { LinkProps } from 'next/link'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'
import { gsap } from 'gsap'
import Flip from 'gsap/Flip'
gsap.registerPlugin(Flip)

import type { Work } from '@/payload-types'
import { Media } from '@/components/Media'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import { SceneTrackRefs } from '@/r3f/types/r3f'
import { useTransitionRouter } from 'next-view-transitions'

export type CardWorkData = Pick<Work, 'slug' | 'meta' | 'title' | 'hero'>
type NavigateEvent = Parameters<NonNullable<LinkProps['onNavigate']>>[0]

export const WorkCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardWorkData
  relationTo?: 'works'
  title?: string
  index?: number
  aspect?: 'wide' | 'portrait' | 'square'
  data?: Work[]
  hero?: number
  /** Ref for the image container div */
  imageRef?: React.RefObject<HTMLDivElement | null>
  setHoveredIndex?: (index: number | null) => void
}> = (props) => {
  const {
    className,
    doc,
    relationTo = 'works',
    title: titleFromProps,
    index,
    aspect = 'wide',
    imageRef: imageRefProp,
  } = props

  const router = useTransitionRouter()
  const { slug, meta, title, hero } = doc || {}
  const { description, image: metaImage } = meta || {}

  const setHoveredIndex = useSceneStore((s) => s.setHoveredIndex)
  const setMouseUV = useSceneStore((s) => s.setMouseUV)

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  // use provided ref or fallback to a local image container div ref
  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef

  const trackedRefs: SceneTrackRefs = {
    cards: [imageRef],
  }

  const { collapseFrame } = usePageAnimationStore()

  const aspectRatios = {
    wide: 16 / 9,
    portrait: 3 / 4,
    square: 1 / 1,
  } as const

  const aspectValue = aspectRatios[aspect] ?? aspectRatios.wide

  const handleTransition = (e: NavigateEvent) => {
    e.preventDefault()

    const containerEl = imageRef.current
    if (!containerEl) {
      return router.push(href)
    }

    // Find the media element - target the actual image/video
    const mediaEl = containerEl.querySelector('img') || containerEl.querySelector('video')
    if (!mediaEl) {
      return router.push(href)
    }

    // Create a clone of the media element to animate
    const clone = mediaEl.cloneNode(true) as HTMLElement
    document.body.appendChild(clone)

    // Position the clone exactly where the original is
    const rect = mediaEl.getBoundingClientRect()
    clone.style.position = 'fixed'
    clone.style.top = `${rect.top}px`
    clone.style.left = `${rect.left}px`
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.objectFit = 'cover'
    clone.style.zIndex = '10000'

    // Capture initial state
    const state = Flip.getState(clone)

    // Apply fullscreen styles to the clone
    clone.style.top = '0'
    clone.style.left = '0'
    clone.style.width = '100vw'
    clone.style.height = '100vh'

    // Execute FLIP animation
    Flip.from(state, {
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        // Clean up and navigate
        document.body.removeChild(clone)
        router.push(href)
      },
      onInterrupt: () => {
        // Clean up if interrupted
        if (document.body.contains(clone)) {
          document.body.removeChild(clone)
        }
        router.push(href)
      },
    })
  }

  return (
    <article className={cn('h-full', className)}>
      <Link href={href} onNavigate={handleTransition} className="not-prose">
        <div
          className="relative mb-6 w-full"
          ref={imageRef}
          style={{
            aspectRatio: `${aspectValue}`,
          }}
          onMouseEnter={() => {
            setHoveredIndex(index ?? null)
          }}
          onMouseLeave={() => {
            setHoveredIndex(null)
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = 1 - (e.clientY - rect.top) / rect.height
            setMouseUV([x, y])
          }}
        >
          {hero && (
            <Media
              resource={hero.media}
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {titleToUse && (
          <div className="prose">
            <h3 className="text-3xl font-light">{titleToUse}</h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </Link>
    </article>
  )
}
