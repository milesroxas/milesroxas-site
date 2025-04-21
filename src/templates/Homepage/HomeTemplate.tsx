import React from 'react'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'

import { RenderHero } from '@/heros/RenderHero'
import { RenderBlocks } from '@/blocks/RenderBlocks'

import PageTransition from '@/components/PageTransition'

import HomeTemplateClient from './HomeTemplate.client'
export default async function HomeTemplate() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  // Fetch the homepage data
  const homepageResult = await payload.find({
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

  // Fetch works and posts for the content cards
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

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <PageTransition>
      <article className="pb-24">
        {draft && <LivePreviewListener />}
        {/* <RenderHero {...hero} />
        <RenderBlocks blocks={layout} /> */}

        <HomeTemplateClient posts={postEntries.docs} works={workEntries.docs} />
      </article>
    </PageTransition>
  )
}
