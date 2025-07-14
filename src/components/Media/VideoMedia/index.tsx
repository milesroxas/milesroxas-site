'use client'

import { cn } from '@/utilities/ui'
import React, { useRef } from 'react'

import type { Props as MediaProps } from '../types'

export interface VideoMediaProps extends MediaProps {
  onLoadedData?: () => void
}

export const VideoMedia: React.FC<VideoMediaProps> = (props) => {
  const { onClick, resource, videoClassName, onLoadedData } = props

  const videoRef = useRef<HTMLVideoElement>(null)

  if (resource && typeof resource === 'object') {
    const videoUrl = resource.url || ''

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        onLoadedData={onLoadedData}
        playsInline
        ref={videoRef}
      >
        <source src={videoUrl} />
      </video>
    )
  }

  return null
}
