import React, { cache } from 'react'
import PageClient from './page.client'
import { ContentCard, type AspectRatio } from '@/prototypes/components/contentCard'

import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'

import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { cn } from '@/utilities/ui'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  // Fetch works
  const workEntries = await payload.find({
    collection: 'works',
    depth: 1,
    limit: 10,
  })

  // Fetch posts
  const postEntries = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 10,
  })

  // Combine works and posts for display
  const combinedEntries = [
    ...workEntries.docs.map((doc) => ({ doc, relationTo: 'works' as const })),
    ...postEntries.docs.map((doc) => ({ doc, relationTo: 'posts' as const })),
  ]

  return (
    <article className="pt-16 pb-24">
      <PageClient />

      <div className="container">
        <h2 className="text-sm uppercase font-mono text-accent mb-8">Mixed Content</h2>

        {/* First row - responsive with standard breakpoints */}
        <div className="flex flex-wrap gap-12 mb-12">
          {combinedEntries.slice(0, 2).map((entry, index) => (
            <ContentCard
              key={`${entry.relationTo}-${entry.doc.id || index}`}
              doc={entry.doc}
              relationTo={entry.relationTo}
              showCategories={true}
              aspectRatio={index === 0 ? 'landscape' : 'portrait'}
              isFlipped={false}
              className={cn(
                'w-full', // Full width on mobile
                index === 0
                  ? 'md:w-[62%]' // 62% on tablet+
                  : 'md:w-[31%]', // 31% on tablet+
              )}
            />
          ))}
        </div>

        {/* Second row - responsive with standard breakpoints */}
        <div className="flex flex-wrap gap-12 mb-12">
          {combinedEntries.slice(2, 4).map((entry, index) => (
            <ContentCard
              key={`${entry.relationTo}-${entry.doc.id || index + 2}`}
              doc={entry.doc}
              relationTo={entry.relationTo}
              showCategories={true}
              aspectRatio={index === 0 ? 'portrait' : 'landscape'}
              isFlipped={true}
              className={cn(
                'w-full', // Full width on mobile
                index === 0
                  ? 'md:w-[31%]' // 31% on tablet+
                  : 'md:w-[62%]', // 62% on tablet+
              )}
            />
          ))}
        </div>

        {/* Additional rows using grid layout - automatically responsive with grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {combinedEntries.slice(4).map((entry, index) => {
            // Determine aspect ratio and flip based on index position
            let aspectRatio: AspectRatio
            let isFlipped: boolean

            switch (index % 4) {
              case 0:
                aspectRatio = 'square'
                isFlipped = false
                break
              case 1:
                aspectRatio = 'landscape'
                isFlipped = true
                break
              case 2:
                aspectRatio = 'portrait'
                isFlipped = false
                break
              default:
                aspectRatio = 'square'
                isFlipped = true
            }

            return (
              <ContentCard
                key={`${entry.relationTo}-${entry.doc.id || index + 4}`}
                doc={entry.doc}
                relationTo={entry.relationTo}
                showCategories={true}
                aspectRatio={aspectRatio}
                isFlipped={isFlipped}
              />
            )
          })}
        </div>
      </div>
    </article>
  )
}
