'use client'

import { cn } from '@/utilities/ui'
import React, { useRef, useEffect } from 'react'
import RichText from '@/components/RichText'
import type { ContentBlock as ContentBlockProps, Work, Media } from '@/payload-types'
import { useSceneStore } from '@/r3f/store/useSceneStore'
import SceneSetter from '@/r3f/canvas/SceneSetter'

import { CMSLink } from '../../components/Link'
import { MediaBlock } from '../MediaBlock/Component'
import { SliderBlock } from '../Slider/Component'
import { WorkCard } from '@/components/Card/Works/Component'

interface ContentBlockClientProps {
  columns: ContentBlockProps['columns']
  sectionTheme: 'light' | 'dark'
}

type Column = NonNullable<NonNullable<ContentBlockProps['columns']>[number]>

export const ContentBlockClient: React.FC<ContentBlockClientProps> = ({
  columns,
  sectionTheme,
}) => {
  const setResources = useSceneStore((s) => s.setResources)
  const currentResources = useSceneStore((s) => s.resources)

  // Filter work columns and create refs
  const workColumns =
    columns?.filter((col): col is Column => col.content === 'work' && !!col.work?.works) || []

  // Create a stable reference for workColumns
  const workColumnsRef = useRef(workColumns)

  useEffect(() => {
    workColumnsRef.current = workColumns
  }, [workColumns])

  // Separate effect for resource management
  useEffect(() => {
    if (workColumnsRef.current.length === 0) return

    const newResources = workColumnsRef.current
      .map((col) => {
        if (!col.work?.works) return null
        const work = col.work.works as Work
        const media = work?.hero?.media as Media
        const url = media?.url
        if (!url) return null

        return {
          url: url.startsWith('http') ? url : `${window.location.origin}${url}`,
          variant: col.work.aspect || 'wide',
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    // Read the current state directly for comparison
    const currentResources = useSceneStore.getState().resources

    // Only update if resources have changed
    if (JSON.stringify(newResources) !== JSON.stringify(currentResources)) {
      setResources(newResources)
    }
    // Depend on the ref and the setter function, not the state value itself
  }, [workColumnsRef, setResources])

  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>(
    workColumns.map(() => React.createRef<HTMLDivElement | null>()),
  )

  return (
    <>
      {/* Set up scene tracking for work cards */}
      {workColumns.length > 0 && (
        <SceneSetter
          scene="home"
          trackedRefs={{ cards: cardRefs.current }}
          key={workColumns
            .map((col) => {
              const work = col.work?.works as Work
              return work?.id ?? ''
            })
            .join('-')}
        />
      )}

      {/* Render columns */}
      {columns?.map((col, index) => {
        if (!col) return null
        const { size, content } = col

        return (
          <div
            className={cn('col-span-4', {
              'lg:col-span-4': size === 'oneThird',
              'lg:col-span-6': size === 'half',
              'lg:col-span-8': size === 'twoThirds',
              'lg:col-span-12': size === 'full',
              'md:col-span-2': size !== 'full',
            })}
            key={index}
          >
            {content === 'work' && col.work?.works && (
              <WorkCard
                doc={col.work.works as Work}
                index={workColumns.findIndex((wc) => wc === col)}
                aspect={col.work.aspect || 'wide'}
                imageRef={cardRefs.current[workColumns.findIndex((wc) => wc === col)]}
                className={cn({
                  'text-primary-foreground': sectionTheme === 'dark',
                })}
              />
            )}

            {content === 'text' && col.text?.richText && (
              <RichText
                data={col.text.richText}
                enableGutter={false}
                className={cn({
                  'prose-invert': sectionTheme === 'dark',
                })}
              />
            )}

            {content === 'sectionHeading' && col.sectionHeading?.heading && (
              <div
                className={cn('text-center', {
                  'text-left': col.sectionHeading.align === 'left',
                })}
              >
                {col.sectionHeading.subheading && (
                  <p
                    className={cn('font-light text-orange-600 uppercase', {
                      'text-sm': col.sectionHeading.size === 'base',
                      'text-xl': col.sectionHeading.size === 'lg',
                      'text-2xl': col.sectionHeading.size === 'xl',
                    })}
                  >
                    {col.sectionHeading.subheading}
                  </p>
                )}
                <p
                  className={cn('text-2xl font-light', {
                    'text-center': col.sectionHeading.align === 'center',
                    'text-left': col.sectionHeading.align === 'left',
                    'text-2xl/8': col.sectionHeading.size === 'base',
                    'text-3xl/12': col.sectionHeading.size === 'lg',
                    'text-4xl/12': col.sectionHeading.size === 'xl',
                    'mb-4': col.sectionHeading.subheading,
                  })}
                >
                  {col.sectionHeading.heading}
                </p>
              </div>
            )}

            {content === 'media' && col.media?.media && (
              <MediaBlock
                blockType="mediaBlock"
                media={col.media.media as Media}
                enableGutter={false}
                aspectRatio={col.media.aspectRatio || undefined}
              />
            )}

            {content === 'slider' && col.slider?.slides && (
              <SliderBlock
                blockType="slider"
                slides={col.slider.slides as any}
                style={col.slider.style || undefined}
                className="py-0"
              />
            )}

            {content === 'text' && col.text?.enableLink && col.text?.link && (
              <CMSLink
                {...col.text.link}
                className={cn({
                  'text-primary-foreground hover:text-primary-foreground/80':
                    sectionTheme === 'dark',
                })}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
