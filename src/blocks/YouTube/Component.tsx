'use client'

import type React from 'react'
import { cn } from '@/utilities/ui'

interface YouTubeBlockProps {
  blockType: 'youTube'
  url: string
  aspectRatio?: 'landscape' | 'square' | 'portrait' | null
  fullWidth?: boolean | null
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    let videoId: string | null = null

    // Handle youtu.be short URLs
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1)
    }
    // Handle youtube.com URLs
    else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      videoId = urlObj.searchParams.get('v')
    }

    if (!videoId) return null

    return `https://www.youtube.com/embed/${videoId}`
  } catch {
    return null
  }
}

export const YouTubeBlock: React.FC<YouTubeBlockProps> = (props) => {
  const { url, aspectRatio = 'landscape', fullWidth = false } = props

  if (!url) return null

  const embedUrl = getYouTubeEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
        Invalid YouTube URL. Please provide a valid YouTube link.
      </div>
    )
  }

  return (
    <div
      className={cn('w-full overflow-hidden rounded-md', {
        container: !fullWidth,
      })}
    >
      <div
        className={cn('relative w-full overflow-hidden rounded-md', {
          'aspect-video': aspectRatio === 'landscape',
          'aspect-square': aspectRatio === 'square',
          'aspect-[9/16]': aspectRatio === 'portrait',
        })}
      >
        <iframe
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  )
}
