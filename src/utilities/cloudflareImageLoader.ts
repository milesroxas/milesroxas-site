import type { ImageLoader } from 'next/image'

const DELIVERY = /^https:\/\/imagedelivery\.net\/[^/]+\/[^/]+\//

/** Cloudflare's default when a caller names none; `f=auto` picks AVIF or WebP from the Accept header. */
const DEFAULT_QUALITY = 85

/** A Cloudflare Images delivery URL (`https://imagedelivery.net/<hash>/<id>/<variant>`). */
export const isCloudflareImageUrl = (src: string): boolean => DELIVERY.test(src)

/**
 * `next/image` loader for Cloudflare Images: swaps the stored variant
 * (`public`) for a flexible one, so Cloudflare resizes per breakpoint and
 * Vercel's optimizer never touches the bytes. Flexible variants are on for
 * the account since 2026-10-07 (docs/media.md).
 */
export const cloudflareImageLoader: ImageLoader = ({ src, width, quality }) => {
  const base = src.match(DELIVERY)?.[0]
  if (!base) return src
  return `${base}w=${width},q=${quality ?? DEFAULT_QUALITY},f=auto`
}
