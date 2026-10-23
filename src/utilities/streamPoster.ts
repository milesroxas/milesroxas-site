import type { ImageLoaderProps } from 'next/image'

/**
 * Sized posters from a Cloudflare Stream thumbnail URL. Stream's default
 * `thumbnail.jpg` is 640 px wide, a 4× upscale in a retina hero; `width` with
 * `fit=clip` keeps the frame's aspect and renders the size asked for.
 */
export const streamPosterUrl = (thumbnailUrl: string, width: number): string =>
  `${thumbnailUrl}?width=${width}&fit=clip`

/** `next/image` loader for a Stream thumbnail: Stream renders the width the slot asks for. */
export const streamPosterLoader = ({ src, width }: ImageLoaderProps): string =>
  streamPosterUrl(src, width)
