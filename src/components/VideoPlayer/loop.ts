import { stageOf } from '@/collections/Videos/stage'
import type { VideoResource } from '@/components/Media/types'
import type { Video } from '@/payload-types'

/** The whole video as `VideoMedia` plays it: Stream's manifest once encoded, the stored file before. */
export const fullSource = (video: Video): VideoResource => ({
  cloudflareStreamPlaybackUrl: video.cloudflareStreamPlaybackUrl,
  cloudflareStreamReady: video.cloudflareStreamReady,
  cloudflareStreamThumbnailUrl: video.cloudflareStreamThumbnailUrl,
  filesize: video.filesize,
  url: video.url,
})

/**
 * The loop: the clip Stream cut, with its own first frame as the poster, or
 * the source itself when it is short enough to loop whole. `null` until
 * Stream has finished, so a long video never streams whole to fill a frame.
 * Server-safe, so a server block can hand the loop to a client look.
 */
export const loopSource = (video: Video): VideoResource | null => {
  if (stageOf(video) !== 'ready') return null
  if (!video.loopUid) return fullSource(video)
  return {
    cloudflareStreamPlaybackUrl: video.loopPlaybackUrl,
    cloudflareStreamReady: true,
    cloudflareStreamThumbnailUrl: video.loopThumbnailUrl ?? video.cloudflareStreamThumbnailUrl,
    url: video.url,
  }
}
