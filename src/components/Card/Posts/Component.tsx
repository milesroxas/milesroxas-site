'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Flip from 'gsap/Flip'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/payload-types'
import { useSiteFrameStore } from '@/stores/siteframeStore'
import { cn } from '@/utilities/ui'

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

    // clone & stash
    const clone = mediaEl.cloneNode(true) as HTMLElement
    clone.classList.add('page-transition-clone')
    window.__PAGE_TRANSITION_CLONE = clone
    document.body.appendChild(clone)

    const rect = mediaEl.getBoundingClientRect()
    Object.assign(clone.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      objectFit: 'cover',
      zIndex: '10000',
    })

    mediaEl.style.visibility = 'hidden'

    // FLIP to full-screen
    const state = Flip.getState(clone)
    Object.assign(clone.style, {
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    })

    Flip.from(state, {
      duration: 1.2,
      ease: 'power2.inOut',
      onStart: () => {
        setTransitionPhase('clone-animating')
      },
      onComplete: () => {
        router.push(href)
        setIsSiteFrameVisible(false)
      },
      onInterrupt: () => {
        router.push(href)
        setIsSiteFrameVisible(false)
      },
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
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            void r
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
