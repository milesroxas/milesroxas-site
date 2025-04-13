import { getServerSideURL } from './getURL'
import { Media } from '../payload-types'

/**
 * Utility function to extract image URL from various possible formats
 *
 * @param imageResource - The image resource which could be a string, Media object, or any object with url or filename
 * @param includeServerUrl - Whether to include the server URL in the result
 * @returns The extracted image URL or empty string if no valid URL found
 */
export const getImageURL = (imageResource: any, includeServerUrl: boolean = false): string => {
  if (!imageResource) return ''

  // If it's already a string URL
  if (typeof imageResource === 'string') return imageResource

  // For Payload Media objects and similar structures
  if (typeof imageResource === 'object' && imageResource !== null) {
    // Check for Payload Media object with url property
    if ('url' in imageResource && typeof imageResource.url === 'string') {
      const url = imageResource.url
      return includeServerUrl ? `${getServerSideURL()}${url}` : url
    }

    // Check for objects with filename property (common in Payload)
    if ('filename' in imageResource && typeof imageResource.filename === 'string') {
      const path = `/media/${imageResource.filename}`
      return includeServerUrl ? `${getServerSideURL()}${path}` : path
    }

    // Handle Payload's sizes field if present
    if ('sizes' in imageResource && imageResource.sizes) {
      const sizes = imageResource.sizes as Record<string, { url?: string }>

      // Try to get optimal size based on common size names
      for (const size of ['large', 'medium', 'thumbnail']) {
        if (sizes[size]?.url) {
          const url = sizes[size]?.url as string
          return includeServerUrl ? `${getServerSideURL()}${url}` : url
        }
      }
    }
  }

  return ''
}
