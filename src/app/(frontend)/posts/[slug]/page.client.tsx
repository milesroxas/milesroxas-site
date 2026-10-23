'use client'

import React from 'react'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import type { Post } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import { categoryKeys } from '@/utilities/reactKeyDomains'

/** Without `header`, the opening is the post's own hero (`PostHero`). */
const PageClient: React.FC<{ post: Post; header?: boolean }> = ({ post, header = true }) => {
  const { categories, publishedAt, title } = post

  if (!header) return null

  return (
    <div className="mb-8 w-full items-center font-light md:mb-12 md:pt-40">
      <div className="container">
        <div className="flex max-w-2xl flex-col gap-4">
          {title && (
            <div className="">
              <h1 className="text-tertiary-foreground mb-2 text-2xl leading-tight md:text-3xl lg:text-4xl">
                {title}
              </h1>
            </div>
          )}

          <div className="text-tertiary-foreground/60 flex flex-col gap-2 align-middle md:flex-row md:gap-4">
            {categories && categories.length > 0 && (
              <div className="text-sm tracking-widest uppercase">
                {categories?.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    const { title: categoryTitle, id } = category

                    const titleToUse = categoryTitle || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <React.Fragment key={categoryKeys.fromCategory({ id }, index)}>
                        {titleToUse}
                        {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                      </React.Fragment>
                    )
                  }
                  return null
                })}
              </div>
            )}

            <span className="text-tertiary-foreground/40 text-sm tracking-widest uppercase">–</span>

            {publishedAt && (
              <time dateTime={publishedAt} className="text-light text-sm">
                {formatDateTime(publishedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
      {title && <ChromeTitle title={title} />}
    </div>
  )
}

export default PageClient
