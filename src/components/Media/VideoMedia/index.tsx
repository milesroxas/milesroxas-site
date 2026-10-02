'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaURL'
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

function fallbackSrcFor({ filename, url }: MediaType): string {
  return url && typeof url === 'string'
    ? getMediaUrl(url)
    : getMediaUrl(`/api/media/file/${filename}`)
}

/** Poster improves FCP/LCP by showing an image immediately while video loads */
function posterUrlFor(resource: MediaType) {
  return (
    resource.cloudflareStreamThumbnailUrl ??
    (resource.sizes?.thumbnail?.url ? getMediaUrl(resource.sizes.thumbnail.url) : undefined) ??
    (resource.thumbnailURL ? getMediaUrl(resource.thumbnailURL) : undefined)
  )
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

/** Cloudflare Stream playback through HLS.js (dynamic import to avoid blocking main bundle) */
function useHlsStream(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  resource: MediaProps['resource'],
) {
  const hlsRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !resource || typeof resource !== 'object') return

    const hlsUrl = readyStreamUrl(resource)
    if (!hlsUrl) return

    // Safari supports HLS natively — just set the src
    if (supportsNativeHls()) {
      video.src = hlsUrl
      return
    }

    let cancelled = false
    let hlsInstance: InstanceType<typeof import('hls.js').default> | null = null

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return
      if (!Hls.isSupported()) return

      hlsInstance = new Hls({
        enableWorker: true,
        startLevel: -1,
      })
      hlsInstance.loadSource(hlsUrl)
      hlsInstance.attachMedia(video)
      hlsRef.current = hlsInstance
    })

    return () => {
      cancelled = true
      hlsInstance?.destroy()
      hlsRef.current = null
    }
  }, [resource, videoRef])
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
    fill,
    onClick,
    onLoad,
    resource,
    videoClassName,
    priority = false,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const hasRetriedRef = useRef(false)
  const strategy = useVideoStrategy(priority, resource)
  useHlsStream(videoRef, resource)
  usePlayWhenVisible(videoRef, autoPlay, priority, strategy.shouldAutoplay)

  if (!resource || typeof resource !== 'object') return null

  return (
    <video
      poster={posterUrlFor(resource)}
      autoPlay={autoPlay && strategy.shouldAutoplay}
      // `fill` covers the caller's aspect frame, as ImageMedia's fill image does.
      className={cn(fill && 'absolute inset-0 size-full object-cover', videoClassName)}
      controls={false}
      loop
      muted
      onClick={onClick}
      playsInline
      ref={videoRef}
      preload={strategy.preload}
      onCanPlay={async () => {
        if (autoPlay && strategy.shouldAutoplay) await playIfPaused(videoRef.current)
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
