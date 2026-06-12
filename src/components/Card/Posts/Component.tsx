'use client'

import Link from 'next/link'
import type React from 'react'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import { useCardTransition } from '@/hooks/useCardTransition'
import type { Post } from '@/payload-types'
import { cn } from '@/utilities/ui'

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

  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTransition = useCardTransition({ href, imageRef, scope: containerRef })

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
          <div className="prose flex flex-col-reverse items-start justify-between gap-2 md:flex-row">
            <h3 className="font-light text-lg">{titleFromProps || title}</h3>
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
