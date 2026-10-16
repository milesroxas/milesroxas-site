/**
 * Sized posters from a Cloudflare Stream thumbnail URL. Stream's default
 * `thumbnail.jpg` is 640 px wide, a 4× upscale in a retina hero; `width` with
 * `fit=clip` keeps the frame's aspect and renders the size asked for.
 */
const POSTER_WIDTHS = [640, 1280, 1920] as const

export const streamPosterUrl = (thumbnailUrl: string, width: number): string =>
  `${thumbnailUrl}?width=${width}&fit=clip`

export const streamPosterSrcSet = (thumbnailUrl: string): string =>
  POSTER_WIDTHS.map((width) => `${streamPosterUrl(thumbnailUrl, width)} ${width}w`).join(', ')
