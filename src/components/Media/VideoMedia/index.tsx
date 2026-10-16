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

/** The most device pixels a rendition is chosen for: a muted loop reads fine at 1.5x. */
const MAX_DEVICE_PIXEL_RATIO = 1.5

/**
 * The frame's size in device pixels, up to `MAX_DEVICE_PIXEL_RATIO`: the
 * element's own box, or the frame around it while the element has none (the
 * hero's video, early in its wipe). Zero when neither has a box yet.
 */
function frameDevicePixels(video: HTMLVideoElement): { width: number; height: number } {
  const scale = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
  const own = video.getBoundingClientRect()
  const frame = video.parentElement?.getBoundingClientRect()
  return {
    width: (own.width || frame?.width || 0) * scale,
    height: (own.height || frame?.height || 0) * scale,
  }
}

/**
 * Stream's ladder, Mbps by the rendition's long edge, from its own manifests
 * (240p 0.27, 360p 0.40, 480p 0.60, 720p 1.2, 1080p 2.5; a landscape 1080p
 * runs higher). `clientBandwidthHint` pins the native player (Safari, and
 * Chrome, which answers `canPlayType` for HLS now) to the rendition nearest
 * the value, the only control it offers, so the hint names the rendition the
 * frame needs. A frame with no box yet gets the top of the ladder.
 */
const HINT_LADDER: ReadonlyArray<[longEdge: number, mbps: number]> = [
  [426, 0.3],
  [640, 0.45],
  [852, 0.65],
  [1280, 1.3],
  [1920, 3],
]
const HINT_TOP_MBPS = 6

export function bandwidthHintFor(video: HTMLVideoElement): number {
  const { width, height } = frameDevicePixels(video)
  const longEdge = Math.max(width, height)
  if (!longEdge) return HINT_TOP_MBPS
  return HINT_LADDER.find(([edge]) => longEdge <= edge)?.[1] ?? HINT_TOP_MBPS
}

/**
 * hls.js opens every video at 240p: its default bandwidth guess is 0.5 Mbps and
 * it only climbs after measuring segments. These loops play muted in a sized
 * frame, so assume a fast line and let the frame's own size cap the rendition
 * (`capLevelToFrame` at load start, hls.js's own cap for later switches).
 * Nothing loads until `startLoad`: at manifest parse for an eager video, on
 * play or warm for the rest.
 */
export const hlsConfig = {
  enableWorker: true,
  abrEwmaDefaultEstimate: 6_000_000,
  capLevelToPlayerSize: true,
  maxDevicePixelRatio: MAX_DEVICE_PIXEL_RATIO,
  autoStartLoad: false,
} as const

type HlsLevels = {
  levels: ReadonlyArray<{ width: number; height: number }>
  autoLevelCapping: number
}

/**
 * hls.js measures the element once, at manifest parse, and lifts its cap when
 * the box is 0 × 0; the hero's video has no box yet that early in the wipe,
 * so ABR's opening estimate picked 720p for a 270 px frame. Measured here at
 * the moment the load starts instead, from the element or the frame around
 * it, with hls.js's own rule: the first level at least as wide or as tall as
 * the box in device pixels.
 */
export function capLevelToFrame(hls: HlsLevels, video: HTMLVideoElement): void {
  const { width, height } = frameDevicePixels(video)
  if (!width && !height) return
  const index = hls.levels.findIndex((level) => level.width >= width || level.height >= height)
  hls.autoLevelCapping = index === -1 ? hls.levels.length - 1 : index
}

function fallbackSrcFor({ url }: MediaType): string {
  return getMediaUrl(url)
}

/**
 * Asks a paused video to fetch its opening frames without playing them, so a
 * later `play()` starts at once. A carousel warms the slides beside the
 * active one. Dispatched on the element because the carousel drives its
 * videos through DOM refs; `VideoMedia` listens (`useWarm`, `useHlsStream`).
 */
const WARM_EVENT = 'mediawarm'
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
    let loading = false
    let wantsPlay = !video.paused
    let warm = false

    const startLoad = () => {
      if (loading || !manifestParsed || !hlsInstance) return
      loading = true
      capLevelToFrame(hlsInstance, video)
      hlsInstance.startLoad()
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

      hlsInstance = new Hls(hlsConfig)
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        manifestParsed = true
        if (!eager && !wantsPlay && !warm) return
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
