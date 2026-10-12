import type { GetAdminThumbnail } from 'payload'
import { getStreamThumbnailUrl } from '@/utilities/cloudflare'
import { cloudflareImageLoader, isCloudflareImageUrl } from '@/utilities/cloudflareImageLoader'
import { streamPosterUrl } from '@/utilities/streamPoster'

const WIDTH = 300

/**
 * The admin list and picker thumbnail. Payload's own (`adminThumbnail:
 * 'thumbnail'`) reads the size's stored URL, which a browser upload leaves
 * empty, and falls back to `/api/media/file/<size>`, a function that looks on
 * a disk nothing was ever written to: one 500 per row per list view. The
 * served assets are the better source anyway: Cloudflare Images for a synced
 * image, a Stream frame for a video (Payload paints videos as a blank tile),
 * else the size file beside the original in the bucket.
 */
export const adminThumbnail: GetAdminThumbnail = ({ doc }) => {
  const imageUrl = doc.cloudflareImageUrl
  if (typeof imageUrl === 'string' && isCloudflareImageUrl(imageUrl)) {
    return cloudflareImageLoader({ src: imageUrl, width: WIDTH })
  }
  const uid = doc.cloudflareStreamUid
  if (typeof uid === 'string' && uid) {
    try {
      return streamPosterUrl(getStreamThumbnailUrl(uid), WIDTH)
    } catch {
      // Stream subdomain unset: fall through to the file.
    }
  }
  const sizes = doc.sizes as { thumbnail?: { filename?: string | null } | null } | undefined
  const sizeFilename = sizes?.thumbnail?.filename
  const url = doc.url
  if (typeof url === 'string' && url.startsWith('http') && sizeFilename) {
    return `${url.slice(0, url.lastIndexOf('/') + 1)}${encodeURIComponent(sizeFilename)}`
  }
  return null
}
