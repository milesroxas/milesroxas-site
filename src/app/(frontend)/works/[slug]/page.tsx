import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PasswordProtectedWorkWrapper } from '@/components/PasswordProtectedWork/PasswordProtectedWorkWrapper'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const works = await payload.find({
    collection: 'works',
    draft: false,
    limit: 10,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      industry: true,
      role: true,
      deliverables: true,
      title: true,
    },
  })

  const params = works.docs
    ?.filter((doc) => {
      return doc.slug !== 'works'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Work({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = `/works/${slug}`

  const work = await queryWorkBySlug({ slug })

  if (!work) return <PayloadRedirects url={url} />

  const hero = work?.hero
  const layout = work?.layout || []

  return (
    <>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PasswordProtectedWorkWrapper work={work}>
        <article className="relative z-10">
          {hero && <RenderHero {...hero} />}
          <PageClient work={work} />
          <RenderBlocks blocks={layout} />
        </article>
      </PasswordProtectedWorkWrapper>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const work = await queryWorkBySlug({ slug })

  return generateMeta({ doc: work })
}

const queryWorkBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'works',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  return result.docs?.[0] || null
})
