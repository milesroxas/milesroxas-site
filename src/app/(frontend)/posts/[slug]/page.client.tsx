'use client'

import React, { useEffect } from 'react'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'
import { useLenis } from '@/hooks/useLenis'
import { Post } from '@/payload-types'
import { formatDateTime } from 'src/utilities/formatDateTime'

const PageClient: React.FC<{ post: Post }> = ({ post }) => {
  const { categories, publishedAt, title } = post

  const { restoreFrame } = usePageAnimationStore()
  const lenis = useLenis()

  useEffect(() => {
    restoreFrame()
    lenis?.scrollTo(0, { immediate: true })
  }, [restoreFrame, lenis])

  return (
    <div className="mb-8 w-full items-center font-light md:mb-12 md:pt-40">
      <div className="container">
        <div className="flex max-w-2xl flex-col gap-4">
          {title && (
            <div className="">
              <h1 className="text-primary-foreground mb-2 text-2xl leading-tight md:text-3xl lg:text-4xl">
                {title}
              </h1>
            </div>
          )}

          <div className="flex flex-col gap-2 align-middle text-white/60 md:flex-row md:gap-4">
            {categories && categories.length > 0 && (
              <div className="text-sm tracking-widest uppercase">
                {categories?.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    const { title: categoryTitle } = category

                    const titleToUse = categoryTitle || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <React.Fragment key={index}>
                        {titleToUse}
                        {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                      </React.Fragment>
                    )
                  }
                  return null
                })}
              </div>
            )}

            <span className="text-sm tracking-widest text-white/40 uppercase">–</span>

            {publishedAt && (
              <time dateTime={publishedAt} className="text-light text-sm">
                {formatDateTime(publishedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageClient
