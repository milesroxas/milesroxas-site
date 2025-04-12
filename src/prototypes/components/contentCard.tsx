'use client'

import { Media } from '@/components/Media'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Post, Work } from '@/payload-types'
import { cn } from '@/utilities/ui'

// Common fields needed for both Work and Post types
export type ContentCardData =
  | (Pick<Work, 'slug' | 'categories' | 'meta' | 'title'> & { type?: 'work' })
  | (Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'> & { type?: 'post' })

export type AspectRatio = 'square' | 'portrait' | 'landscape'

export const ContentCard: React.FC<{
  className?: string
  doc?: ContentCardData
  relationTo?: 'works' | 'posts'
  showCategories?: boolean
  title?: string
  aspectRatio?: AspectRatio
  isFlipped?: boolean
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, aspectRatio = 'square', isFlipped = false } = props

  if (!doc) return null

  const { slug, categories, meta, title } = doc

  // Determine image source based on content type
  const docType = doc.type || (relationTo === 'posts' ? 'post' : 'work')
  const imageResource =
    docType === 'post' && 'heroImage' in doc && doc.heroImage ? doc.heroImage : meta?.image || null

  const href = `/${relationTo}/${slug}`
  const categoriesToUse = categories?.map((category) => {
    if (typeof category === 'object') return category.title
    else return category
  })

  // Define aspect ratio classes with responsive breakpoints
  // At smaller screens, all cards become square
  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-square md:aspect-[4/5]',
    landscape: 'aspect-square md:aspect-[16/9]',
  }

  // Define title styles based on content type
  const titleStyles = docType === 'post' ? 'text-lg' : 'text-3xl font-light'

  return (
    <article className={cn('w-full', className)} ref={card.ref}>
      <div className={cn('content-card', isFlipped && 'flex flex-col-reverse')}>
        <Link href={href} ref={link.ref} className="block h-full">
          {/* Image section */}
          {!imageResource ? (
            <div
              className={cn(
                'bg-gray-100 flex items-center justify-center mb-2',
                aspectRatioClasses[aspectRatio],
              )}
            >
              No Image
            </div>
          ) : (
            <div
              className={cn(
                aspectRatioClasses[aspectRatio],
                'overflow-hidden relative w-full mb-2',
              )}
            >
              <Media
                resource={imageResource}
                size="100vw"
                fill
                priority
                className="absolute inset-0 w-full h-full"
                imgClassName="object-cover w-full h-full transition-image"
              />
            </div>
          )}

          {/* Content section */}
          <div
            className={cn('flex gap-2 justify-between items-center', isFlipped ? 'mb-4' : 'mt-4')}
          >
            <h3 className={titleStyles}>{title}</h3>
            {categories && categories.length > 0 && (
              <div className="flex gap-2">
                {categoriesToUse?.map((category) => (
                  <div key={category} className="text-sm uppercase font-mono text-accent">
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual indicator of content type */}
          {docType === 'post' && (
            <div className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded-full">
              Post
            </div>
          )}
        </Link>
      </div>
    </article>
  )
}
