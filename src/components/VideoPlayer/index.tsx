'use client'

import { IconPlayerPlayFilled } from '@tabler/icons-react'
import NextImage from 'next/image'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { formatSeconds, stageOf } from '@/collections/Videos/stage'
import type { VideoResource } from '@/components/Media/types'
import { VideoMedia } from '@/components/Media/VideoMedia'
import type { Video } from '@/payload-types'
import { cursorTarget } from '@/providers/Cursor/variants'
import { streamPosterLoader } from '@/utilities/streamPoster'
import { cn } from '@/utilities/ui'

/**
 * A full-length video in a block (docs/media.md, "Videos"): its loop plays
 * muted in the frame with a play button over it, and a click swaps in the
 * whole video with sound and the native controls, in the same frame. The
 * frame takes the video's own aspect ratio, so neither the swap nor the
 * poster moves the page; a caller that owns the frame passes `fill` and the
 * full video letterboxes inside it. When the video ends, the loop returns.
 */
export type VideoPlayerProps = {
  video: Video
  className?: string
  /** Cover the caller's aspect frame, as `Media`'s `fill` does. */
  fill?: boolean
  priority?: boolean
  posterWidth?: number
  videoClassName?: string
}

/** The whole video as `VideoMedia` plays it: Stream's manifest once encoded, the stored file before. */
const fullSource = (video: Video): VideoResource => ({
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

const DEFAULT_RATIO = '16 / 9'

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  className,
  fill = false,
  priority = false,
  posterWidth,
  videoClassName,
}) => {
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    if (playing) playerRef.current?.focus()
  }, [playing])

  const loop = loopSource(video)
  const poster = video.cloudflareStreamThumbnailUrl
  const frameClassName = cn(
    fill ? 'absolute inset-0 size-full' : 'relative w-full',
    'overflow-hidden',
    className,
  )
  const frameStyle = fill
    ? undefined
    : {
        aspectRatio:
          video.width && video.height ? `${video.width} / ${video.height}` : DEFAULT_RATIO,
      }

  if (playing) {
    return (
      <div className={cn(frameClassName, 'bg-black')} style={frameStyle}>
        <VideoMedia
          autoPlay
          controls
          fill
          loop={false}
          muted={false}
          onEnded={() => setPlaying(false)}
          priority
          ref={playerRef}
          resource={fullSource(video)}
          videoClassName={cn('object-contain', videoClassName)}
        />
      </div>
    )
  }

  return (
    <button
      {...cursorTarget('play')}
      aria-label={`Play ${video.title}`}
      className={cn(
        frameClassName,
        'group bg-muted focus-visible:outline-ring block cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2',
      )}
      onClick={() => setPlaying(true)}
      style={frameStyle}
      type="button"
    >
      {loop ? (
        <VideoMedia
          fill
          posterWidth={posterWidth}
          priority={priority}
          resource={loop}
          videoClassName={cn('object-cover', videoClassName)}
        />
      ) : poster ? (
        <NextImage
          alt=""
          className="object-cover"
          fill
          loader={streamPosterLoader}
          priority={priority}
          sizes={`${posterWidth ?? 1280}px`}
          src={poster}
        />
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none">
          <IconPlayerPlayFilled className="ml-0.5 size-6" />
        </span>
      </span>
      {typeof video.duration === 'number' && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-0.5 font-mono text-xs text-white tabular-nums backdrop-blur-sm"
        >
          {formatSeconds(video.duration)}
        </span>
      )}
    </button>
  )
}
