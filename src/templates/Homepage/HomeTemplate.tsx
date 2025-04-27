import React from 'react'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'

import { RenderBlocks } from '@/blocks/RenderBlocks'

import HomeHero from './components/HomeHero'

export default async function HomeTemplate() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  // Fetch the homepage data
  const homepageResult = await payload.find({
    depth: 2,
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const page = homepageResult.docs?.[0]
  const url = '/home'

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  // fetch the latest posts and works for homepage cards
  const postsResult = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 2,
    pagination: false,
    overrideAccess: draft,
  })
  const worksResult = await payload.find({
    collection: 'works',
    depth: 2,
    draft,
    limit: 2,
    pagination: false,
    overrideAccess: draft,
  })

  return (
    <article className="pb-24">
      {draft && <LivePreviewListener />}

      <HomeHero />
      {/* <ContentSceneSetup layout={layout} /> */}
      {/* <HomeTemplateClient posts={posts} works={works} /> */}

      <RenderBlocks blocks={layout} />
    </article>
  )
}
