import React from 'react'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'

import { RenderBlocks } from '@/blocks/RenderBlocks'

import { RenderHero } from '@/heros/RenderHero'

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

  return (
    <article className="pb-24">
      {draft && <LivePreviewListener />}

      {/* <HomeHero /> */}
      {/* <ContentSceneSetup layout={layout} /> */}
      {/* <HomeTemplateClient posts={posts} works={works} /> */}
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}
