import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { cache } from 'react'
import { slugWhere } from '@/app/(frontend)/slug-where'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentsButton } from '@/features/contents'
import { MembersGate } from '@/features/members/MembersGate'
import { isGated } from '@/features/members/session'
import { isMembersOnly } from '@/fields/visibility'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { breadcrumbSchema, faqPageSchema, webPageSchema } from '@/utilities/schema'
import PageClient from './page.client'

// Cached HTML, regenerated every ten minutes and on publish (revalidatePage).
export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    // Contact has its own route (contact/page.tsx).
    ?.filter((doc) => {
      return doc.slug !== 'contact'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  const url = `/${slug}`

  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    slug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, showContents } = page
  // A members-only page renders per request; without a session, its opening and the gate.
  const gated = await isGated(page)

  return (
    <article className="pb-24">
      <JsonLd
        data={[
          webPageSchema(page, url),
          breadcrumbSchema([{ name: page.title, path: url }]),
          ...(gated ? [] : [faqPageSchema(layout)]),
        ]}
      />
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero {...hero} />
      {gated ? <MembersGate kind="page" next={url} /> : <RenderBlocks blocks={layout} />}
      {!gated && showContents && <ContentsButton />}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  // Root pages have no `.md` route (`/<slug>.md` would shadow files).
  return generateMeta({ doc: page, pathname: `/${slug}`, noIndex: isMembersOnly(page) })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // Trusted fetch so protected works referenced in blocks stay populated for
  // render-time gating (RenderBlocks → processLayoutBlocks). depth 3 is
  // required to populate media on works nested inside blocks.
  const result = await payload.find({
    collection: 'pages',
    draft,
    depth: 3,
    limit: 1,
    pagination: false,
    where: slugWhere(slug, draft),
  })

  return result.docs?.[0] || null
})
