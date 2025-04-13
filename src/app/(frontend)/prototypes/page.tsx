import React from 'react'
import PageClient from './page.client'
import { ContentCard3D, type AspectRatio } from '@/prototypes/components/contentCard3D'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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

  // Get first post and work for first row
  const firstPost = postEntries.docs[0]
  const firstWork = workEntries.docs[0]

  // Combine remaining works and posts for other rows
  const remainingEntries = [
    ...workEntries.docs.slice(1).map((doc) => ({ doc, relationTo: 'works' as const })),
    ...postEntries.docs.slice(1).map((doc) => ({ doc, relationTo: 'posts' as const })),
  ]

  return (
    <article className="pt-16 pb-24">
      <PageClient />

      <section className="container">
        <h2 className="text-sm uppercase font-mono text-accent mb-8">3D Content Cards</h2>

        {/* First row - responsive with standard breakpoints */}
        <div className="flex flex-wrap gap-12 mb-12">
          {firstPost && (
            <ContentCard3D
              key={`3d-posts-${firstPost?.id}`}
              doc={firstPost}
              relationTo="posts"
              showCategories={true}
              aspectRatio="portrait"
              type="post"
              className="w-full md:w-[31%]"
            />
          )}

          {firstWork && (
            <ContentCard3D
              key={`3d-works-${firstWork?.id}`}
              doc={firstWork}
              relationTo="works"
              showCategories={true}
              aspectRatio="landscape"
              type="work"
              className="w-full md:w-[62%]"
            />
          )}
        </div>

        {/* Second row - using 3D cards */}
        <div className="flex flex-wrap gap-12 mb-12">
          {workEntries.docs[1] && (
            <ContentCard3D
              key={`3d-works-${workEntries.docs[1]?.id}`}
              doc={workEntries.docs[1]}
              relationTo="works"
              showCategories={true}
              aspectRatio="landscape"
              type="work"
              className="w-full md:w-[62%]"
            />
          )}
          {postEntries.docs[1] && (
            <ContentCard3D
              key={`3d-posts-${postEntries.docs[1]?.id}`}
              doc={postEntries.docs[1]}
              relationTo="posts"
              showCategories={true}
              aspectRatio="portrait"
              type="post"
              className="w-full md:w-[31%]"
            />
          )}
        </div>

        {/* Additional rows using grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {remainingEntries.slice(2).map((entry, index) => {
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
              entry.doc && (
                <ContentCard3D
                  key={`3d-${entry.relationTo}-${entry.doc.id || index + 4}`}
                  doc={entry.doc}
                  relationTo={entry.relationTo}
                  showCategories={true}
                  aspectRatio={aspectRatio}
                  isFlipped={isFlipped}
                  fullWidth={true}
                />
              )
            )
          })}
        </div>
      </section>
    </article>
  )
}
