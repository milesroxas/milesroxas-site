'use client'

import type React from 'react'
import { useRef } from 'react'
import { getMediaUrl } from '@/utilities/getMediaURL'
import { cn } from '@/utilities/ui'
import type { Props as MediaProps } from '../types'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  const hasRetriedRef = useRef(false)

  if (resource && typeof resource === 'object') {
    const { filename } = resource

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
        preload="metadata"
        onCanPlay={async () => {
          const video = videoRef.current
          if (!video || !video.paused) return
          try {
            await video.play()
          } catch {
            // Autoplay can be blocked in edge cases; nothing to do.
          }
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
        <source src={getMediaUrl(`/api/media/file/${filename}`)} type="video/mp4" />
      </video>
    )
  }

  return null
}
