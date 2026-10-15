'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaURL'
import { streamPosterUrl } from '@/utilities/streamPoster'
import { cn } from '@/utilities/ui'
import { getVideoLoadingStrategy } from '@/utilities/videoOptimization'

import type { Props as MediaProps } from '../types'

type VideoStrategy = ReturnType<typeof getVideoLoadingStrategy>

/** Check if the browser natively supports HLS (Safari, iOS). */
function supportsNativeHls(): boolean {
  const video = document.createElement('video')
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

/** The Cloudflare Stream HLS URL, once the stream is ready to play. */
function readyStreamUrl(resource: MediaType): string | undefined {
  const hlsUrl = resource.cloudflareStreamPlaybackUrl as string | undefined
  const isReady = resource.cloudflareStreamReady as boolean | undefined
  return hlsUrl && isReady ? hlsUrl : undefined
}

/**
 * Mbps for Safari's native player, which offers no rendition control: Stream's
 * `clientBandwidthHint` pins the manifest to the rendition nearest this value,
 * so pick it from the frame the video renders in.
 */
export function bandwidthHintFor(video: HTMLVideoElement): number {
  const width = (video.clientWidth || window.innerWidth) * (window.devicePixelRatio || 1)
  if (width <= 800) return 1.5
  if (width <= 1500) return 3
  return 6
}

/**
 * hls.js opens every video at 240p: its default bandwidth guess is 0.5 Mbps and
 * it only climbs after measuring segments. These loops play muted in a sized
 * frame, so assume a fast line and let the frame's own size cap the rendition.
 * The cap counts device pixels up to 1.5x: at the full ratio a 270px portrait
 * on a phone asked for the 1280 rendition, 1.7 MB before the page had its
 * scripts. Nothing loads until the element is asked to play (eager: at once).
 */
export const hlsConfigFor = (eager: boolean) => ({
  enableWorker: true,
  abrEwmaDefaultEstimate: 6_000_000,
  capLevelToPlayerSize: true,
  maxDevicePixelRatio: 1.5,
  autoStartLoad: eager,
})

function fallbackSrcFor({ url }: MediaType): string {
  return getMediaUrl(url)
}

/**
 * Asks a paused video to fetch its opening frames without playing them, so a
 * later `play()` starts at once. A carousel warms the slides beside the
 * active one. Dispatched on the element because the carousel drives its
 * videos through DOM refs; `VideoMedia` listens (`useWarm`, `useHlsStream`).
 */
export const WARM_EVENT = 'mediawarm'
export const warmVideo = (video: HTMLVideoElement): void => {
  video.dispatchEvent(new Event(WARM_EVENT))
}

/**
 * The poster paints the frame until the first segment lands, and is the LCP
 * element in a hero. Stream's default thumbnail is 640 px wide, so a retina
 * hero asks for 1920 and any other frame 1280 (`poster` takes one URL); a
 * caller that knows its frame is narrower says so with `posterWidth`.
 */
function posterUrlFor(resource: MediaType, priority: boolean, posterWidth?: number) {
  const streamThumbnail = resource.cloudflareStreamThumbnailUrl
  if (streamThumbnail) {
    return streamPosterUrl(streamThumbnail, posterWidth ?? (priority ? 1920 : 1280))
  }
  return resource.thumbnailURL ? getMediaUrl(resource.thumbnailURL) : undefined
}

async function playIfPaused(video: HTMLVideoElement | null) {
  if (!video?.paused) return
  try {
    await video.play()
  } catch {
    // Autoplay can be blocked in edge cases; nothing to do.
  }
}

/** Reloads and plays once per element after a playback error. */
async function retryOnce(video: HTMLVideoElement | null, hasRetriedRef: React.RefObject<boolean>) {
  if (!video || hasRetriedRef.current) return
  hasRetriedRef.current = true
  try {
    video.load()
    await video.play()
  } catch {
    // If retry fails, let the browser surface the failure (poster/fallback).
  }
}

/** Priority videos start with their final strategy; the rest decide on mount (needs navigator). */
function useVideoStrategy(priority: boolean, resource: MediaProps['resource']) {
  const [strategy, setStrategy] = useState<VideoStrategy>(() => ({
    preload: priority ? 'auto' : 'metadata',
    shouldAutoplay: priority,
    shouldLoadSource: priority,
  }))

  useEffect(() => {
    if (priority) return
    const result = getVideoLoadingStrategy(
      priority,
      resource && typeof resource === 'object' ? (resource.filesize ?? undefined) : undefined,
    )
    setStrategy(result)
  }, [priority, resource])

  return strategy
}

/**
 * Cloudflare Stream playback through hls.js (dynamic import to avoid blocking
 * the main bundle). The source attaches after the import and a manifest fetch,
 * and a `play()` from the carousel's settle or the visibility observer can land
 * before then, on an element with no source. The intent is kept from the
 * element's own play/pause events and honoured once the manifest is parsed.
 */
function useHlsStream(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  resource: MediaProps['resource'],
  eager: boolean,
) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || !resource || typeof resource !== 'object') return

    const hlsUrl = readyStreamUrl(resource)
    if (!hlsUrl) return

    if (supportsNativeHls()) {
      video.src = `${hlsUrl}?clientBandwidthHint=${bandwidthHintFor(video)}`
      return
    }

    let cancelled = false
    let hlsInstance: InstanceType<typeof import('hls.js').default> | null = null
    let manifestParsed = false
    let loading = eager
    let wantsPlay = !video.paused
    let warm = false

    const startLoad = () => {
      if (loading || !manifestParsed) return
      loading = true
      hlsInstance?.startLoad()
    }
    const onPlay = () => {
      wantsPlay = true
      startLoad()
    }
    const onPause = () => {
      wantsPlay = false
    }
    const onWarm = () => {
      warm = true
      startLoad()
    }
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener(WARM_EVENT, onWarm)

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return
      if (!Hls.isSupported()) return

      hlsInstance = new Hls(hlsConfigFor(eager))
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        manifestParsed = true
        if (!wantsPlay && !warm) return
        startLoad()
        if (wantsPlay) void playIfPaused(video)
      })
      hlsInstance.loadSource(hlsUrl)
      hlsInstance.attachMedia(video)
    })

    return () => {
      cancelled = true
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener(WARM_EVENT, onWarm)
      hlsInstance?.destroy()
    }
  }, [eager, resource, videoRef])
}

/**
 * The native player's warm: `preload` goes to `auto`, and an element that has
 * fetched nothing yet is asked to load, since a player parked by `none` does
 * not always notice the change. hls.js owns its element's loading, so this
 * stays out of its way (`useHlsStream` handles the warm there).
 */
function useWarm(videoRef: React.RefObject<HTMLVideoElement | null>, hasStream: boolean) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || (hasStream && !supportsNativeHls())) return
    const onWarm = () => {
      video.preload = 'auto'
      if (video.readyState === HTMLMediaElement.HAVE_NOTHING && video.paused) video.load()
    }
    video.addEventListener(WARM_EVENT, onWarm)
    return () => video.removeEventListener(WARM_EVENT, onWarm)
  }, [hasStream, videoRef])
}

/** For non-priority videos, start playback when the element becomes visible */
function usePlayWhenVisible(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  autoPlay: boolean,
  priority: boolean,
  shouldAutoplay: boolean,
) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || !autoPlay || priority || shouldAutoplay) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
          observer.disconnect()
        }
      },
      { rootMargin: '50px', threshold: 0.01 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [autoPlay, priority, shouldAutoplay, videoRef])
}

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    autoPlay = true,
    crossOrigin,
    fill,
    onClick,
    onLoad,
    posterWidth,
    resource,
    videoClassName,
    priority = false,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const hasRetriedRef = useRef(false)
  const strategy = useVideoStrategy(priority, resource)
  const eager = autoPlay && strategy.shouldAutoplay
  useHlsStream(videoRef, resource, eager)
  useWarm(videoRef, Boolean(resource && typeof resource === 'object' && readyStreamUrl(resource)))
  usePlayWhenVisible(videoRef, autoPlay, priority, strategy.shouldAutoplay)

  if (!resource || typeof resource !== 'object') return null

  return (
    <video
      poster={posterUrlFor(resource, priority, posterWidth)}
      autoPlay={eager}
      // `fill` covers the caller's aspect frame, as ImageMedia's fill image does.
      className={cn(fill && 'absolute inset-0 size-full object-cover', videoClassName)}
      controls={false}
      crossOrigin={crossOrigin}
      loop
      muted
      onClick={onClick}
      playsInline
      ref={videoRef}
      // Safari's native HLS treats `metadata` as the first segment of every
      // video on the page, all competing with the images; nothing loads until
      // a slide or the visibility observer asks to play.
      preload={eager ? strategy.preload : 'none'}
      onCanPlay={async () => {
        if (eager) await playIfPaused(videoRef.current)
      }}
      onLoadedData={() => {
        onLoad?.()
      }}
      onError={() => retryOnce(videoRef.current, hasRetriedRef)}
    >
      {!readyStreamUrl(resource) && <source src={fallbackSrcFor(resource)} type="video/mp4" />}
    </video>
  )
}
