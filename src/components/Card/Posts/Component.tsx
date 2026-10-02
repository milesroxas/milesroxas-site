'use client'

import Link from 'next/link'
import type React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type CardAspect, CardImage, useCardLink } from '../shared'

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title' | 'hero'>

interface PostCardProps {
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  title?: string
  index?: number
  aspect?: CardAspect
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
  const { containerRef, imageRef, handleTransition } = useCardLink(href, imageRefProp)

  return (
    <article ref={containerRef} className={cn('h-full', className)}>
      <Link href={href} onClick={handleTransition} className="not-prose">
        <CardImage aspect={aspect} hero={hero} imageRef={imageRef} index={index} />

        {(titleFromProps || title) && (
          <div className="flex flex-col-reverse items-start justify-between gap-2 md:flex-row">
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
