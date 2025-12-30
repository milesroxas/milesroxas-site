import React, { Fragment } from 'react'
import { ImageMedia } from './ImageMedia'
import type { Props } from './types'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props & { className?: string }> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')

  // Always pass className down to the concrete media element so utilities like object-cover apply
  const content = isVideo ? (
    <VideoMedia {...props} className={className} />
  ) : (
    <ImageMedia {...props} className={className} />
  )

  // If an element tag is provided, wrap; otherwise render bare media
  if (htmlElement) {
    return React.createElement(htmlElement, undefined, content)
  }

  return <Fragment>{content}</Fragment>
}
