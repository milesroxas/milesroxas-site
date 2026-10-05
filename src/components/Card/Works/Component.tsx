// components/WorkCard.tsx
'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import type React from 'react'
import { useRef, ViewTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { useWorkCardMorph } from '@/heros/WorkHero/morph'
import type { Work } from '@/payload-types'
import { cursorTarget } from '@/providers/Cursor/variants'
import { cn } from '@/utilities/ui'
import { type CardAspect, CardImage } from '../shared'

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
  /** Title size; a list under a section heading passes a smaller step. */
  titleClassName?: string
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
  titleClassName = 'font-light text-3xl',
}) => {
  const { slug, title, hero } = doc || {}
  const description = hero?.richText
  const href = `/${relationTo}/${slug}`
  const localImageRef = useRef<HTMLDivElement>(null)
  const imageRef = imageRefProp ?? localImageRef
  const morph = useWorkCardMorph(slug, href, imageRef)

  return (
    <article className={cn('h-full', className)}>
      {/* The picture morphs into the case study's hero (src/heros/WorkHero/morph.ts). */}
      <Link
        {...cursorTarget('view')}
        className="not-prose"
        href={href}
        onClick={morph.onClick}
        transitionTypes={['work-open']}
      >
        <ViewTransition default="none" name={morph.name} onShare={morph.onShare} share="work-morph">
          <CardImage aspect={aspect} hero={hero} imageRef={imageRef} index={index} />
        </ViewTransition>

        {(titleFromProps || title) && (
          <div className="flex items-start justify-between gap-2">
            <h3 className={titleClassName}>{titleFromProps || title}</h3>
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
