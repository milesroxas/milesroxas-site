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

/**
 * One upload as an absolute image URL for share cards and JSON-LD, or null
 * when the field is empty, holds a bare id, or has no file. Cloudflare Images
 * sources are resized to the share width through a flexible variant
 * (docs/media.md); anything else is served as stored.
 */
export const shareImage = (media: Media | number | null | undefined): ShareImage | null => {
  const doc = populatedDoc<Media>(media)
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
