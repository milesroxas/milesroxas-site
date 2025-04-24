'use client'
import { cn } from '@/utilities/ui'

import React, { useRef } from 'react'

import type { Work } from '@/payload-types'
import { Media } from '@/components/Media'
import useClickableCard from '@/utilities/useClickableCard'

import { TransitionLink } from '@/components/Link'

export type CardWorkData = Pick<Work, 'slug' | 'meta' | 'title' | 'hero'>

export const CardWork: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardWorkData
  relationTo?: 'works'
  title?: string
  index?: number
  data?: Work[]
  /** Ref for the image container div */
  imageRef?: React.Ref<HTMLDivElement>
  setHoveredIndex?: (index: number | null) => void
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, title: titleFromProps, index, imageRef } = props

  const { slug, meta, title, hero } = doc || {}
  const { description, image: metaImage } = meta || {}
  const { media: heroMedia } = hero || {}
  const imageResource = heroMedia || metaImage

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  return (
    <article className={cn('h-full', className)} ref={card.ref}>
      <div className="relative w-full" ref={imageRef}>
        {!imageResource && <div className="">No image</div>}
        {imageResource && <Media resource={imageResource} size="33vw" />}
      </div>
      <div className="p-4">
        {titleToUse && (
          <div className="prose mt-2">
            <h3>
              <TransitionLink className="not-prose" href={href}>
                {titleToUse}
              </TransitionLink>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
