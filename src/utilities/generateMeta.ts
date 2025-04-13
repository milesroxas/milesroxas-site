import type { Metadata } from 'next'

import type { Media, Page, Post, Work, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getImageURL } from './getImageURL'
import { getServerSideURL } from './getURL'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Work> | null
}): Promise<Metadata> => {
  const { doc } = args

  // Generate appropriate image URL for OpenGraph
  let ogImage = getServerSideURL() + '/website-template-OG.webp' // Default image

  if (doc?.meta?.image) {
    const imageUrl = getImageURL(doc.meta.image, true)

    // Use the image URL only if it's not empty and appears to be a URL
    // (handles case where image might be a database ID string)
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
      ogImage = imageUrl
    }
  }

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: [{ url: ogImage }],
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
