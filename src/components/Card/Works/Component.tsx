// components/WorkCard.tsx
'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Work } from '@/payload-types'
import { CursorButton } from '@/providers/Cursor/components/CursorInteractions'
import { cn } from '@/utilities/ui'
import { type CardAspect, CardImage, useCardLink } from '../shared'

export type CardWorkData = Pick<Work, 'slug' | 'meta' | 'title' | 'hero'>

interface WorkCardProps {
  className?: string
  doc?: CardWorkData
  relationTo?: 'works'
  title?: string
  index?: number
  aspect?: CardAspect
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
  const { containerRef, imageRef, handleTransition } = useCardLink(href, imageRefProp)

  return (
    <article ref={containerRef} className={cn('h-full', className)}>
      <CursorButton>
        <Link href={href} onClick={handleTransition} className="not-prose">
          <CardImage aspect={aspect} hero={hero} imageRef={imageRef} index={index} />

          {(titleFromProps || title) && (
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-light text-3xl">{titleFromProps || title}</h3>
              <Badge variant="work">Work</Badge>
            </div>
          )}
        </Link>
        {description && showDescription && (
          <div className="mt-2">
            <RichText data={description} />
          </div>
        )}
      </CursorButton>
    </article>
  )
}
