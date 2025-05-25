// components/WorkCard.tsx
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
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'

gsap.registerPlugin(Flip, useGSAP)

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title' | 'heroImage'>

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
  const { slug, meta, title, heroImage } = doc || {}
  const description = meta?.description
  const sanitizedDescription = description?.replace(/\s+/g, ' ')
  const href = `/${relationTo}/${slug}`
  const router = useRouter()

  const setHoveredIndex = useSceneStore((s) => s.setHoveredIndex)
  const setMouseUV = useSceneStore((s) => s.setMouseUV)
  const { collapseFrame } = usePageAnimationStore()

  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  console.log(heroImage)

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
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => router.push(href),
      onInterrupt: () => router.push(href),
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
          {heroImage && typeof heroImage !== 'string' && (
            <Media
              fill
              priority
              imgClassName="h-full w-full object-cover object-cover"
              resource={heroImage}
            />
          )}
        </div>

        {(titleFromProps || title) && (
          <div className="prose">
            <h3 className="text-2xl font-light">{titleFromProps || title}</h3>
          </div>
        )}

        {description && (
          <div className="mt-2">
            <p>{sanitizedDescription}</p>
          </div>
        )}
      </Link>
    </article>
  )
}
