'use client'
import { cn } from '@/utilities/ui'

import React, { useRef, useEffect } from 'react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media' // removed for 3D plane rendering
import useClickableCard from '@/utilities/useClickableCard'

import { TransitionLink } from '@/components/Link'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import { SceneTrackRefs } from '@/r3f/types/r3f'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

export const PostCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: Post
  relationTo?: 'posts'
  title?: string
  index?: number
  aspect?: 'wide' | 'portrait' | 'square'
  data?: Post[]
  hero?: number
  /** Ref for the image container div */
  imageRef?: React.RefObject<HTMLDivElement | null>
  setHoveredIndex?: (index: number | null) => void
}> = (props) => {
  const { card, link } = useClickableCard({})
  const {
    className,
    doc,
    relationTo = 'posts',
    title: titleFromProps,
    index,
    aspect = 'wide',
    imageRef: imageRefProp,
  } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const setHoveredIndex = useSceneStore((s) => s.setHoveredIndex)
  const setMouseUV = useSceneStore((s) => s.setMouseUV)

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  // use provided ref or fallback to a local image container div ref
  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef

  // log when the ref attaches to a DOM node
  useEffect(() => {
    console.log('[WorkCard] imageRef.current:', imageRef.current)
  }, [imageRef])

  const trackedRefs: SceneTrackRefs = {
    cards: [imageRef],
  }

  const aspectRatios = {
    wide: 16 / 9,
    portrait: 3 / 4,
    square: 1 / 1,
  } as const

  const aspectValue = aspectRatios[aspect] ?? aspectRatios.wide

  return (
    <article className={cn('h-full', className)} ref={card.ref}>
      <TransitionLink className="not-prose" href={href}>
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
            console.log('[CardWork] onMouseMove', { index, x, y })
            setMouseUV([x, y])
          }}
        >
          {metaImage && (
            <Media
              resource={metaImage}
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        {titleToUse && (
          <div className="prose">
            <h3 className="w-[80%] text-lg font-light">{titleToUse}</h3>
          </div>
        )}
        {/* {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>} */}
      </TransitionLink>
    </article>
  )
}
