import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  /** Video only. Defaults to true; pass false when playback is driven externally. */
  autoPlay?: boolean
  /** Video only. The native controls; off for a loop, on for the full player after a click. */
  controls?: boolean
  /** Video only. Defaults to true: a loop plays muted. The full player passes false, after the click that allows it. */
  muted?: boolean
  /** Video only. Defaults to true. */
  loop?: boolean
  /** Video only. */
  onEnded?: () => void
  className?: string
  /** CORS mode for the media request: `anonymous` lets WebGL sample the element. */
  crossOrigin?: 'anonymous'
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  /** Video only. The poster's width in px, from the frame it fills; a priority video defaults to 1920, any other to 1280. */
  posterWidth?: number
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  videoClassName?: string
}

/**
 * The fields `VideoMedia` reads: a Media document, or a Video document's
 * loop or full source shaped like one (`components/VideoPlayer`).
 */
export type VideoResource = Pick<
  MediaType,
  | 'cloudflareStreamPlaybackUrl'
  | 'cloudflareStreamReady'
  | 'cloudflareStreamThumbnailUrl'
  | 'filesize'
  | 'thumbnailURL'
  | 'url'
>

export type VideoProps = Omit<Props, 'resource'> & {
  resource?: VideoResource | string | number | null
}
