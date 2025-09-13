'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import Flip from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

import { cn } from '@/utilities/ui'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import { Badge } from '@/components/ui/badge'
import { useSiteFrameStore } from '@/stores/siteframeStore'

gsap.registerPlugin(Flip, useGSAP)

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title' | 'hero'>

interface PostCardProps {
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  title?: string
  index?: number
  aspect?: 'wide' | 'portrait' | 'square'
  imageRef?: React.RefObject<HTMLDivElement | null>
}

export const PostCard: React.FC<PostCardProps> = ({
  className,
  doc,
  relationTo = 'posts',
  title: titleFromProps,
  index,
  aspect = 'wide',
  imageRef: imageRefProp,
}) => {
  const { slug, meta, title, hero } = doc || {}
  const description = meta?.description
  const sanitizedDescription = description?.replace(/\s+/g, ' ')
  const href = `/${relationTo}/${slug}`
  const router = useRouter()

  const setHoveredIndex = useSceneStore((s) => s.setHoveredIndex)
  const setMouseUV = useSceneStore((s) => s.setMouseUV)

  const { setIsSiteFrameVisible, setIsTransitioning, setTransitionPhase } = useSiteFrameStore()

  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleTransition = contextSafe((e: React.MouseEvent) => {
    e.preventDefault()

    const containerEl = imageRef.current
    if (!containerEl) {
      router.push(href)
      return
    }

    const mediaEl =
      (containerEl.querySelector('img') as HTMLElement) ||
      (containerEl.querySelector('video') as HTMLElement)

    if (!mediaEl) {
      router.push(href)
      return
    }

    // Set transition state
    setIsTransitioning(true)
    setTransitionPhase('initial')

    // Store current scroll position for transition calculations
    const currentScrollY = window.scrollY
    const currentScrollX = window.scrollX

    // Clone and prepare for transition
    const clone = mediaEl.cloneNode(true) as HTMLElement
    clone.classList.add('page-transition-clone')
    
    // Store scroll position data for receiving hero
    window.__PAGE_TRANSITION_CLONE = clone
    window.__PAGE_TRANSITION_SCROLL_DATA = {
      scrollY: currentScrollY,
      scrollX: currentScrollX,
    }
    
    document.body.appendChild(clone)

    // Get viewport-relative position
    const rect = mediaEl.getBoundingClientRect()

    // Position clone exactly at the card's current viewport position
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      objectFit: 'cover',
      zIndex: '10000',
      transformOrigin: 'center center',
      visibility: 'visible',
      opacity: '1',
    })

    // Hide original after clone is positioned
    mediaEl.style.visibility = 'hidden'

    // Create a smooth transition: first animate to center, then navigate
    // This ensures the animation looks consistent regardless of scroll position
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2
    const targetSize = Math.min(window.innerWidth, window.innerHeight) * 0.8
    
    gsap.timeline({
      onComplete: () => {
        // Navigate after centering animation completes
        router.push(href)
        setIsSiteFrameVisible(false)
      },
    })
    .to(clone, {
      top: `${viewportCenterY - targetSize / 2}px`,
      left: `${viewportCenterX - targetSize / 2}px`,
      width: `${targetSize}px`,
      height: `${targetSize}px`,
      duration: 0.6,
      ease: 'power2.inOut',
      onStart: () => {
        setTransitionPhase('clone-animating')
      },
    })
    .to(clone, {
      scale: 1.2,
      opacity: 0.95,
      duration: 0.4,
      ease: 'power2.inOut',
    })
  })

  const aspectRatios = { wide: 16 / 9, portrait: 3 / 4, square: 1 } as const
  const aspectValue = aspectRatios[aspect]

  return (
    <article ref={containerRef} className={cn('h-full', className)}>
      <Link href={href} onClick={handleTransition} className="not-prose">
        <div
          ref={imageRef}
          className="relative mb-6 w-full"
          style={{ aspectRatio: aspectValue }}
          onMouseEnter={() => setHoveredIndex?.(index ?? null)}
          onMouseLeave={() => setHoveredIndex?.(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - r.left) / r.width
            const y = 1 - (e.clientY - r.top) / r.height
            setMouseUV([x, y])
          }}
        >
          {hero && (
            <Media
              resource={hero.media}
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
              imgClassName="rounded-sm overflow-hidden"
              videoClassName="rounded-sm overflow-hidden"
            />
          )}
        </div>

        {(titleFromProps || title) && (
          <div className="prose flex flex-col-reverse items-start justify-between gap-2 md:flex-row">
            <h3 className="text-lg font-light">{titleFromProps || title}</h3>
            <Badge variant="post" className="mt-1">
              Post
            </Badge>
          </div>
        )}
      </Link>
      {description && (
        <div className="mt-2">
          <p>{sanitizedDescription}</p>
        </div>
      )}
    </article>
  )
}
