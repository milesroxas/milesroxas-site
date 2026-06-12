// components/WorkCard.tsx
'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type React from 'react'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import { useCardTransition } from '@/hooks/useCardTransition'
import type { Work } from '@/payload-types'
import { CursorButton } from '@/providers/Cursor/components/CursorInteractions'
import { cn } from '@/utilities/ui'

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

  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTransition = useCardTransition({ href, imageRef, scope: containerRef })

  const aspectRatios = { wide: 16 / 9, portrait: 3 / 4, square: 1 } as const
  const aspectValue = aspectRatios[aspect]

  return (
    <article ref={containerRef} className={cn('h-full', className)}>
      <CursorButton>
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
