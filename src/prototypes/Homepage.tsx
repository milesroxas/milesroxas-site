import React from 'react'
import PageClient from './Homepage.client'
import { ContentCard3D } from '@/prototypes/components/contentCard3D'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import PageTransition from '@/components/PageTransition'

export default async function Homepage() {
  const payload = await getPayload({ config: configPromise })

  const workEntries = await payload.find({
    collection: 'works',
    depth: 1,
    limit: 10,
  })

  const postEntries = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 10,
  })

  return (
    <PageTransition>
      <article className="pt-16 pb-24">
        <PageClient />

        <section className="container">
          {/* First row - responsive with standard breakpoints */}
          <div className="flex flex-wrap gap-12 mb-12">
            {postEntries.docs[0] && (
              <ContentCard3D
                key={`3d-posts-${postEntries.docs[0]?.id}`}
                doc={postEntries.docs[0]}
                relationTo="posts"
                showCategories={true}
                aspectRatio="portrait"
                type="post"
                className="w-full md:w-[31%]"
              />
            )}

            {workEntries.docs[0] && (
              <ContentCard3D
                key={`3d-works-${workEntries.docs[0]?.id}`}
                doc={workEntries.docs[0]}
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
        </section>
      </article>
    </PageTransition>
  )
}
