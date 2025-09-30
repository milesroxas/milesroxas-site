import React from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export interface MediaProps extends Props {
  onLoad?: () => void
  onLoadedData?: () => void
  onError?: () => void
}

export const Media: React.FC<MediaProps> = (props) => {
  const {
    className,
    htmlElement = 'div',
    resource,
    onLoad,
    onLoadedData,
    onError: _onError,
  } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')

  if (htmlElement === null) {
    return isVideo ? (
      <VideoMedia {...props} onLoadedData={onLoadedData} />
    ) : (
      <ImageMedia {...props} onLoad={onLoad} />
    )
  }

  const content = isVideo ? (
    <VideoMedia {...props} onLoadedData={onLoadedData} />
  ) : (
    <ImageMedia {...props} onLoad={onLoad} />
  )

  return React.createElement(htmlElement, { className }, content)
}
