import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { loopSource } from '@/components/VideoPlayer/loop'
import { isMembersOnly } from '@/fields/visibility'
import type { CtaLinkBlock, Media, Page, Post, Video, Work } from '@/payload-types'
import { readingTimeMinutes } from '@/shared/content/reading-time'
import { hasWorkAccess } from '@/utilities/checkWorkAccess'
import { cloudflareImageLoader, isCloudflareImageUrl } from '@/utilities/cloudflareImageLoader'
import { resolveVisibleWork } from '@/utilities/resolveVisibleWork'
import { streamPosterUrl } from '@/utilities/streamPoster'
import type { CtaMedia, CtaTarget } from './look'

const pad = (n: number) => String(n).padStart(2, '0')
const title = (doc: unknown) =>
  doc && typeof doc === 'object' && 'title' in doc ? String(doc.title) : undefined
const id = (rel: unknown) =>
  typeof rel === 'number'
    ? rel
    : rel && typeof rel === 'object' && 'id' in rel
      ? Number(rel.id)
      : null

const POSTER_WIDTH = 1280

const still = (src: string, width: number, height: number): CtaMedia => ({
  kind: 'image',
  src: isCloudflareImageUrl(src) ? cloudflareImageLoader({ src, width: 1600 }) : src,
  width,
  height,
})

/**
 * What Instrument paints in, from a Media upload: an image as a Cloudflare
 * variant sized for the panel, or a video as its muted loop with Stream's
 * frame to paint until the loop has frames.
 */
const picture = (media: unknown): CtaMedia | undefined => {
  if (!media || typeof media !== 'object') return undefined
  const m = media as Media
  if (m.mimeType?.startsWith('video/')) {
    if (!m.url && !m.cloudflareStreamPlaybackUrl) return undefined
    const thumbnail = m.cloudflareStreamThumbnailUrl
    return {
      kind: 'video',
      resource: {
        cloudflareStreamPlaybackUrl: m.cloudflareStreamPlaybackUrl,
        cloudflareStreamReady: m.cloudflareStreamReady,
        cloudflareStreamThumbnailUrl: m.cloudflareStreamThumbnailUrl,
        filesize: m.filesize,
        thumbnailURL: m.thumbnailURL,
        url: m.url,
      },
      poster: thumbnail ? streamPosterUrl(thumbnail, POSTER_WIDTH) : undefined,
    }
  }
  if (m.mimeType && !m.mimeType.startsWith('image/')) return undefined
  const src = m.cloudflareImageUrl ?? m.url
  if (!src || !m.width || !m.height) return undefined
  return still(src, m.width, m.height)
}

/** A full-length video's loop; while Stream is still at work, its frame as a still. */
const videoLoop = (video: unknown): CtaMedia | undefined => {
  if (!video || typeof video !== 'object') return undefined
  const v = video as Video
  const loop = loopSource(v)
  const thumbnail = loop?.cloudflareStreamThumbnailUrl ?? v.cloudflareStreamThumbnailUrl
  const poster = thumbnail ? streamPosterUrl(thumbnail, POSTER_WIDTH) : undefined
  if (loop) return { kind: 'video', resource: loop, poster }
  return poster && v.width && v.height ? still(poster, v.width, v.height) : undefined
}

/** The block's own media, when the editor set one. */
const ownMedia = (block: CtaLinkBlock) =>
  block.playVideo ? videoLoop(block.video) : picture(block.media)

const date = (iso?: string | null) => (iso ? iso.slice(0, 10) : undefined)

/** The work's place in the work list (`MR–16–W06`), counted over what a visitor can see. */
async function workCode(workId: number) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'works',
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {},
    sort: '_order',
  })
  const at = docs.findIndex((doc) => doc.id === workId)
  return at >= 0 ? `MR–16–W${pad(at + 1)}` : 'MR–16'
}

async function fromWork(block: CtaLinkBlock): Promise<CtaTarget | null> {
  const workId = id(block.work)
  if (!workId) return null
  const payload = await getPayload({ config: configPromise })
  // Trusted read so a protected work still resolves to its public fallback.
  const found = (await payload
    .findByID({ collection: 'works', id: workId, depth: 1, draft: false })
    .catch(() => null)) as Work | null
  const work = found ? await resolveVisibleWork(found, hasWorkAccess, 1) : null
  if (!work?.slug || isMembersOnly(work)) return null

  const capabilities = (work.capabilities ?? []).map(title).filter(Boolean).slice(0, 2)
  const facts = [
    { label: 'client', value: title(work.client) },
    { label: 'industry', value: work.industry ?? undefined },
    { label: 'scope', value: capabilities.join(', ') || undefined },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value))

  return {
    kind: 'work',
    label: 'case study',
    code: await workCode(work.id),
    title: work.title,
    line: work.meta?.description ?? undefined,
    facts,
    action: 'Read the case study',
    href: `/works/${work.slug}`,
    external: false,
    media: picture(work.hero?.media),
  }
}

async function fromPost(block: CtaLinkBlock): Promise<CtaTarget | null> {
  const postId = id(block.post)
  if (!postId) return null
  const payload = await getPayload({ config: configPromise })
  // Public read: drafts and members-only posts stay out.
  const post = (await payload
    .findByID({ collection: 'posts', id: postId, depth: 1, draft: false, overrideAccess: false })
    .catch(() => null)) as Post | null
  if (!post?.slug || post._status !== 'published' || isMembersOnly(post)) return null

  const externalUrl = post.source === 'external' ? post.external?.url : null
  const minutes = post.content ? readingTimeMinutes(post.content) : 0
  const facts = [
    { label: 'published', value: date(post.publishedAt) },
    { label: 'length', value: minutes ? `${minutes} min` : undefined },
    { label: 'topic', value: title((post.categories ?? [])[0]) },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value))

  return {
    kind: 'post',
    label: 'post',
    code: `P–${pad(post.id)}`,
    title: post.title,
    line: post.meta?.description ?? undefined,
    facts,
    action: 'Read the post',
    href: externalUrl || `/posts/${post.slug}`,
    external: Boolean(externalUrl),
    media: picture(post.meta?.image),
  }
}

async function fromPage(block: CtaLinkBlock): Promise<CtaTarget | null> {
  const pageId = id(block.page)
  if (!pageId) return null
  const payload = await getPayload({ config: configPromise })
  // Public read: drafts and members-only pages stay out.
  const page = (await payload
    .findByID({ collection: 'pages', id: pageId, depth: 1, draft: false, overrideAccess: false })
    .catch(() => null)) as Page | null
  if (!page?.slug || page._status !== 'published' || isMembersOnly(page)) return null

  const href = `/${page.slug}`
  return {
    kind: 'page',
    label: 'page',
    code: href,
    title: page.title,
    line: page.meta?.description ?? undefined,
    facts: [],
    action: 'Open the page',
    href,
    external: false,
    media: picture(page.hero?.media) ?? picture(page.meta?.image),
  }
}

function fromUrl(block: CtaLinkBlock): CtaTarget | null {
  if (!block.url || !block.title) return null
  let host = block.url
  try {
    host = new URL(block.url).host.replace(/^www\./, '')
  } catch {
    return null
  }
  return {
    kind: 'external',
    label: 'external',
    code: host,
    title: block.title,
    facts: [],
    action: `Visit ${host}`,
    href: block.url,
    external: true,
  }
}

/** The block's target as plain data, with the editor's overrides on top. Null hides the block. */
export async function resolveCtaTarget(block: CtaLinkBlock): Promise<CtaTarget | null> {
  const kind = block.targetType ?? 'work'
  const base =
    kind === 'work'
      ? await fromWork(block)
      : kind === 'post'
        ? await fromPost(block)
        : kind === 'page'
          ? await fromPage(block)
          : fromUrl(block)
  if (!base) return null
  const facts = (block.facts ?? [])
    .filter((f) => f.label && f.value)
    .map((f) => ({ label: f.label, value: f.value }))
  return {
    ...base,
    title: block.title || base.title,
    line: block.description || base.line,
    action: block.action || base.action,
    media: ownMedia(block) ?? base.media,
    facts: facts.length ? facts : base.facts,
  }
}
