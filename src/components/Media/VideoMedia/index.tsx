'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { getMediaUrl } from '@/utilities/getMediaURL'
import { cn } from '@/utilities/ui'
import { getVideoLoadingStrategy } from '@/utilities/videoOptimization'

import type { Props as MediaProps } from '../types'

/** Check if the browser natively supports HLS (Safari, iOS). */
function supportsNativeHls(): boolean {
  const video = document.createElement('video')
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, onLoad, resource, videoClassName, priority = false } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<{ destroy: () => void } | null>(null)
  const hasRetriedRef = useRef(false)
  const [strategy, setStrategy] = useState<{
    preload: 'none' | 'metadata' | 'auto'
    shouldAutoplay: boolean
    shouldLoadSource: boolean
  }>(() => ({
    preload: priority ? 'auto' : 'metadata',
    shouldAutoplay: priority,
    shouldLoadSource: priority,
  }))

  // Determine loading strategy on mount (needs navigator). Skip for priority — initial state is correct.
  useEffect(() => {
    if (priority) return
    const result = getVideoLoadingStrategy(
      priority,
      resource && typeof resource === 'object' ? (resource.filesize ?? undefined) : undefined,
    )
    setStrategy(result)
  }, [priority, resource])

  // Set up HLS.js for Cloudflare Stream playback (dynamic import to avoid blocking main bundle)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !resource || typeof resource !== 'object') return

    const hlsUrl = resource.cloudflareStreamPlaybackUrl as string | undefined
    const isReady = resource.cloudflareStreamReady as boolean | undefined
    if (!hlsUrl || !isReady) return

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
  }, [resource])

  // For non-priority videos, start playback when the element becomes visible
  useEffect(() => {
    const video = videoRef.current
    if (!video || priority || strategy.shouldAutoplay) return

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
  }, [priority, strategy.shouldAutoplay])

  if (resource && typeof resource === 'object') {
    const { filename, url } = resource
    const hlsUrl = resource.cloudflareStreamPlaybackUrl as string | undefined
    const isReady = resource.cloudflareStreamReady as boolean | undefined
    const useCloudflare = hlsUrl && isReady
    const fallbackSrc =
      url && typeof url === 'string' ? getMediaUrl(url) : getMediaUrl(`/api/media/file/${filename}`)

    // Poster improves FCP/LCP by showing an image immediately while video loads
    const posterUrl =
      resource.cloudflareStreamThumbnailUrl ??
      (resource.sizes?.thumbnail?.url ? getMediaUrl(resource.sizes.thumbnail.url) : undefined) ??
      (resource.thumbnailURL ? getMediaUrl(resource.thumbnailURL) : undefined)

    return (
      <video
        poster={posterUrl}
        autoPlay={strategy.shouldAutoplay}
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
        preload={strategy.preload}
        onCanPlay={async () => {
          const video = videoRef.current
          if (!video || !video.paused) return
          if (!strategy.shouldAutoplay) return
          try {
            await video.play()
          } catch {
            // Autoplay can be blocked in edge cases; nothing to do.
          }
        }}
        onLoadedData={() => {
          onLoad?.()
        }}
        onError={async () => {
          const video = videoRef.current
          if (!video || hasRetriedRef.current) return
          hasRetriedRef.current = true
          try {
            video.load()
            await video.play()
          } catch {
            // If retry fails, let the browser surface the failure (poster/fallback).
          }
        }}
      >
        {!useCloudflare && <source src={fallbackSrc} type="video/mp4" />}
      </video>
    )
  }

  return null
}
