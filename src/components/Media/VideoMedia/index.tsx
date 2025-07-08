'use client'

import { cn } from '@/utilities/ui'
import React, { useRef } from 'react'

import type { Props as MediaProps } from '../types'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

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
        playsInline
        ref={videoRef}
      >
        <source src={videoUrl} />
      </video>
    )
  }

  return null
}
