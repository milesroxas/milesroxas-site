import { resolveOpening, type StoredVisualSlot } from '@/features/immersive/visual/descriptor'
import type { Media } from '@/payload-types'
import { cloudflareImageLoader, isCloudflareImageUrl } from './cloudflareImageLoader'
import { getMediaUrl } from './getMediaURL'
import { populatedDoc } from './relationshipId'

/** The width share cards and structured data ask Cloudflare for (Open Graph's 1200×630). */
const SHARE_WIDTH = 1200

export type ShareImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

/** What a share image is read from: a media document, or the slice of one a Studio look's still carries. */
export type ShareSource = Pick<Media, 'url' | 'width' | 'height'> &
  Partial<Pick<Media, 'alt' | 'cloudflareImageUrl'>>

/**
 * One upload as an absolute image URL for share cards and JSON-LD, or null
 * when the field is empty, holds a bare id, or has no file. Cloudflare Images
 * sources are resized to the share width through a flexible variant
 * (docs/media.md); anything else is served as stored.
 */
export const shareImage = (media: ShareSource | number | null | undefined): ShareImage | null => {
  const doc = populatedDoc<ShareSource>(media)
  if (!doc) return null

  const source = doc.cloudflareImageUrl || getMediaUrl(doc.url)
  if (!source) return null

  const scale = doc.width && doc.width > SHARE_WIDTH ? SHARE_WIDTH / doc.width : 1
  const resized = isCloudflareImageUrl(source)
  const url = resized ? cloudflareImageLoader({ src: source, width: SHARE_WIDTH }) : source
  const factor = resized ? scale : 1

  return {
    url,
    ...(doc.width ? { width: Math.round(doc.width * factor) } : {}),
    ...(doc.height ? { height: Math.round(doc.height * factor) } : {}),
    ...(doc.alt ? { alt: doc.alt } : {}),
  }
}

/** The fields of a routed document a share image is read from. */
export type ShareDoc = {
  meta?: { image?: ShareSource | number | null } | null
  hero?: StoredVisualSlot | null
}

/**
 * A document's share image, in the order docs/aeo.md states: its SEO image,
 * else its hero's upload, else the preview still of the Studio look grounding
 * its hero (`features/immersive/studio/stills`), which the look publishes
 * with and every page that opens on it shares by itself. Nothing found is
 * `null`, and the caller falls back to the site's default.
 */
export const documentShareImage = (doc: ShareDoc | null | undefined): ShareImage | null => {
  if (!doc) return null
  const own = shareImage(doc.meta?.image)
  if (own) return own
  if (!doc.hero) return null
  const { ground, media } = resolveOpening(doc.hero)
  return shareImage(media) ?? shareImage(ground?.descriptor.release?.stills?.preview)
}
