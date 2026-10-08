'use client'

import Link from 'next/link'
import type React from 'react'
import { Badge } from '@/components/ui/badge'
import { useCurtainLink } from '@/features/page-transition/use-curtain-link'
import type { Post } from '@/payload-types'
import { cursorTarget } from '@/providers/Cursor/variants'
import { DEFAULT_PUBLISHER, isExternalPost } from '@/utilities/externalArticle'
import { cn } from '@/utilities/ui'
import { type CardAspect, CardImage } from '../shared'

export type CardPostData = Pick<Post, 'slug' | 'meta' | 'title' | 'hero'> &
  Partial<Pick<Post, 'source' | 'external'>>

interface PostCardProps {
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  title?: string
  index?: number
  aspect?: CardAspect
}

export const PostCard: React.FC<PostCardProps> = ({
  className,
  doc,
  relationTo = 'posts',
  title: titleFromProps,
  index,
  aspect = 'wide',
}) => {
  const { slug, meta, title, hero } = doc || {}
  // The card reads the publisher only; the URL stays with the post page.
  const publisher = isExternalPost(doc) ? doc?.external?.publisher || DEFAULT_PUBLISHER : null
  const description = meta?.description
  const sanitizedDescription = description?.replace(/\s+/g, ' ')
  const href = `/${relationTo}/${slug}`
  const open = useCurtainLink(href, hero)

  return (
    <article className={cn('h-full', className)}>
      <Link {...cursorTarget('view')} href={href} onClick={open} className="not-prose">
        <CardImage aspect={aspect} hero={hero} index={index} />

        {(titleFromProps || title) && (
          <div
            className="flex flex-col-reverse items-start justify-between gap-2 md:flex-row"
            data-reveal
            data-reveal-group={slug}
          >
            <h3 className="font-light text-lg">{titleFromProps || title}</h3>
            <Badge variant="post" className="mt-1">
              Post
            </Badge>
          </div>
        )}
        {publisher && (
          <p className="mt-1 text-muted-foreground text-sm" data-reveal data-reveal-group={slug}>
            On {publisher}
          </p>
        )}
      </Link>
      {description && (
        <div className="mt-2" data-reveal data-reveal-group={slug}>
          <p>{sanitizedDescription}</p>
        </div>
      )}
    </article>
  )
}
