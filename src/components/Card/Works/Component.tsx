// components/WorkCard.tsx
'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import Flip from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

import { cn } from '@/utilities/ui'
import type { Work } from '@/payload-types'
import { Media } from '@/components/Media'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { Badge } from '@/components/ui/badge'

import { useSiteFrameStore } from '@/stores/siteframeStore'

gsap.registerPlugin(Flip, useGSAP)

export type CardWorkData = Pick<Work, 'slug' | 'meta' | 'title' | 'hero'>

interface WorkCardProps {
  className?: string
  doc?: CardWorkData
  relationTo?: 'works'
  title?: string
  index?: number
  aspect?: 'wide' | 'portrait' | 'square'
  imageRef?: React.RefObject<HTMLDivElement | null>
  showDescription?: boolean
}

export const WorkCard: React.FC<WorkCardProps> = ({
  className,
  doc,
  relationTo = 'works',
  title: titleFromProps,
  index,
  aspect = 'wide',
  imageRef: imageRefProp,
  showDescription = false,
}) => {
  const { slug, title, hero } = doc || {}
  const description = hero?.richText
  const href = `/${relationTo}/${slug}`
  const router = useRouter()

  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  const { setIsSiteFrameVisible, setIsTransitioning, setTransitionPhase } = useSiteFrameStore()

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

    // Hide original immediately
    mediaEl.style.visibility = 'hidden'

    // FLIP to full-screen - get initial state first
    const state = Flip.getState(clone)

    // Set target position and dimensions
    Object.assign(clone.style, {
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    })

    // Animate from initial to target state
    Flip.from(state, {
      duration: 1, // Increased from 0.8 to 1.2 for slower animation
      ease: 'power2.inOut', // Changed to power2.inOut for smoother animation
      // onStart: () => {
      //   setTransitionPhase('clone-animating')
      // },
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
        <div ref={imageRef} className="relative mb-6 w-full" style={{ aspectRatio: aspectValue }}>
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
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-3xl font-light">{titleFromProps || title}</h3>
            <Badge variant="work">Work</Badge>
          </div>
        )}
      </Link>
      {description && showDescription && (
        <div className="mt-2">
          <RichText data={description} />
        </div>
      )}
    </article>
  )
}
