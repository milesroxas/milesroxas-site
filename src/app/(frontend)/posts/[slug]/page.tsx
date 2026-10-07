import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText/Legacy'
import { ContentsButton } from '@/features/contents'
import { RenderHero } from '@/heros/RenderHero'
import type { Post as PostDoc } from '@/payload-types'
import { ExternalArticle } from '@/sections/ExternalArticle'
import { WorkIntro } from '@/sections/WorkIntro'
import { externalArticle } from '@/utilities/externalArticle'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 12,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

/**
 * The body renders until the post is composed: the composer's posts transform
 * (scripts/compose-layouts.ts) splits it into `layout`, and both at once would
 * print the article twice.
 */
function PostBody({ post }: { post: PostDoc }) {
  if (!post.content || post.layout?.length) return null
  return (
    <div className="flex flex-col items-start gap-4 pt-8 pb-32 md:pt-12 lg:pt-32">
      <div className="container">
        <div className="max-w-3xl md:pl-32">
          <RichText data={post.content} enableGutter={false} className="text-tertiary-foreground" />
        </div>
      </div>
    </div>
  )
}

function MorePosts({ post }: { post: PostDoc }) {
  if (post.hideRelatedPosts || !post.relatedPosts || post.relatedPosts.length === 0) return null
  return (
    <section className="bg-tertiary py-12">
      <h2 className="container pb-4 text-lead text-tertiary-foreground leading-snug">More posts</h2>
      <RelatedPosts docs={post.relatedPosts.filter((post) => typeof post === 'object')} />
    </section>
  )
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = `/posts/${slug}`
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  // An external post keeps any body it had before it was switched; only the link out renders.
  const external = externalArticle(post)

  return (
    <article className="bg-tertiary pt-24 pb-12 text-tertiary-foreground md:pt-0 md:pb-32">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <PageClient post={post} />
      {post.hero && <RenderHero {...post.hero} />}
      {post.intro?.body && <WorkIntro body={post.intro.body} title={post.intro.title} />}

      {external ? (
        <ExternalArticle {...external} />
      ) : (
        <>
          <PostBody post={post} />
          {/* Composition (docs/composer-roadmap.md, Phase 3): Sections after the
              article body. Each band paints its own surface. */}
          <RenderBlocks blocks={post.layout} />
        </>
      )}
      <MorePosts post={post} />
      {!external && post.showContents && <ContentsButton />}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
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
