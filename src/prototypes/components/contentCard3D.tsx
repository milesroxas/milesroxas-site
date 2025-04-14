'use client'

import React, { useMemo, useRef } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import Link from 'next/link'

import { ThreeCanvas } from '@/providers/ThreeCanvas'
import { AspectRatio } from '@/hooks/useImageCropMaterial'
import useClickableCard from '@/utilities/useClickableCard'
import { cn } from '@/utilities/ui'
import { getImageURL } from '@/utilities/getImageURL'
import HoverableCard3D from '@/components/HoverableCard3D'
import useTransitionNavigation from '@/hooks/useTransitionNavigation'

import type { Post, Work } from '@/payload-types'

// Common fields needed for both Work and Post types
export type ContentCardData =
  | (Pick<Work, 'slug' | 'categories' | 'meta' | 'title'> & { type?: 'work' })
  | (Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'> & { type?: 'post' })

export const ContentCard3D: React.FC<{
  className?: string
  doc?: ContentCardData
  relationTo?: 'works' | 'posts'
  showCategories?: boolean
  aspectRatio?: AspectRatio
  isFlipped?: boolean
  type?: 'post' | 'work'
  fullWidth?: boolean
}> = ({
  className,
  doc,
  relationTo = 'works',
  showCategories = true,
  aspectRatio = 'square',
  isFlipped = false,
  type: explicitType,
  fullWidth = false,
}) => {
  // All hooks called unconditionally
  const { card, link } = useClickableCard({})
  const viewRef = useRef<HTMLDivElement>(null)
  const { handleNavigate, isNavigating } = useTransitionNavigation()

  const camera = useMemo(
    () => <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={35} near={0.1} far={1000} />,
    [],
  )

  // Using conditional rendering instead of early return
  return doc
    ? (() => {
        // All non-hook logic
        const { slug, categories = [], meta, title } = doc

        // Determine image source based on content type
        const docType =
          explicitType || (doc as any).type || (relationTo === 'posts' ? 'post' : 'work')
        const imageResource =
          docType === 'post' && 'heroImage' in doc && doc.heroImage
            ? doc.heroImage
            : meta?.image || null

        const imageUrl = getImageURL(imageResource)
        const href = `/${relationTo}/${slug}`

        // Format categories for display
        const categoriesToUse = categories?.map((category: any) => {
          if (typeof category === 'object' && category !== null) return category.title
          return category
        })

        // Define aspect ratio classes with responsive breakpoints
        const aspectRatioClasses = {
          square: 'aspect-square',
          portrait: 'aspect-square md:aspect-[4/5]',
          landscape: 'aspect-square md:aspect-[16/9]',
        }

        const titleStyles = docType === 'post' ? 'text-lg' : 'text-3xl font-light'
        const widthClass = fullWidth ? 'w-full' : className || 'w-full'

        // Handle 3D card click with link click
        const handleCardClick = (event: any) => {
          // Only call preventDefault if it exists as a function
          if (event && typeof event.preventDefault === 'function') {
            event.preventDefault()
          }
          if (link.ref.current) {
            link.ref.current.click()
          }
        }

        return (
          <article className={widthClass} ref={card.ref}>
            <div className={cn('content-card', isFlipped && 'flex flex-col-reverse')}>
              <Link href={href} ref={link.ref} className="hidden" onNavigate={handleNavigate}>
                <span>{title}</span>
              </Link>

              <div
                className={cn(
                  aspectRatioClasses[aspectRatio],
                  'overflow-hidden relative w-full mb-2',
                  isNavigating && 'pointer-events-none',
                )}
              >
                <div ref={viewRef} className="absolute top-0 left-0 w-full h-full" />
                <ThreeCanvas>
                  <View track={viewRef as any}>
                    <ambientLight intensity={0.8} />
                    {camera}
                    <HoverableCard3D
                      imageUrl={imageUrl}
                      aspectRatio={aspectRatio}
                      brightness={1.2}
                      onClick={handleCardClick}
                    />
                  </View>
                </ThreeCanvas>
              </div>

              <div
                className={cn(
                  'flex gap-2 justify-between items-center',
                  isFlipped ? 'mb-4' : 'mt-4',
                )}
              >
                <h3 className={titleStyles}>{title}</h3>
                {showCategories && categories && categories.length > 0 && (
                  <div className="flex gap-2">
                    {categoriesToUse?.map((category: string) => (
                      <div key={category} className="text-sm uppercase font-mono text-accent">
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        )
      })()
    : null
}
