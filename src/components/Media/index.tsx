import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')

  if (htmlElement === null) {
    return isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />
  }

  const content = isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />

  return React.createElement(htmlElement, { className }, content)
}
