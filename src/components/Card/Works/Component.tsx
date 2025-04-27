'use client'
import { cn } from '@/utilities/ui'
import React, { useRef, useEffect } from 'react'
import Link, { LinkProps } from 'next/link'
import { useExitFrameTransition } from '@/utilities/useExitFrameTransition'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'
import { gsap } from 'gsap'
import Flip from 'gsap/Flip'
gsap.registerPlugin(Flip)

import type { Work } from '@/payload-types'
import { Media } from '@/components/Media' // removed for 3D plane rendering

import { useSceneStore } from '@/r3f/store/useSceneStore'
import { SceneTrackRefs } from '@/r3f/types/r3f'
import { useRouter } from 'next/navigation'
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

  const { slug, meta, title, hero } = doc || {}
  const { description, image: metaImage } = meta || {}

  const router = useRouter()

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

  const handleExit = (e: NavigateEvent) => {
    e.preventDefault()
    const el = imageRef.current!
    const rect = el.getBoundingClientRect()

    // 1) snap it into fixed positioning exactly where it started
    Object.assign(el.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transformOrigin: 'top left',
      zIndex: '9999',
    })

    // 2) calculate final size & position with 40px margin
    const margin = 40
    const finalLeft = margin
    const finalTop = margin
    const finalWidth = window.innerWidth - margin * 2.43
    const finalHeight = finalWidth / aspectValue // keep your aspect ratio

    const deltaX = finalLeft - rect.left
    const deltaY = finalTop - rect.top

    // 3) animate x/y and width/height
    gsap.to(el, {
      x: deltaX,
      y: deltaY,
      width: finalWidth,
      height: finalHeight,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        router.push(href)
      },
    })
  }

  return (
    <article className={cn('h-full', className)}>
      <Link href={href} onNavigate={handleExit} className="not-prose">
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
