import type { Metadata } from 'next'

import type { Config, Media, Page, Post, Work, WorksIndex } from '../payload-types'
import { getMediaUrl } from './getMediaURL'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = `${serverUrl}/website-template-OG.webp`

  if (image && typeof image === 'object' && 'url' in image) {
    url = getMediaUrl(image.sizes?.og?.url || image.url) || url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Work> | Partial<WorksIndex> | null
  /** Where the document publishes, for `og:url`. */
  pathname?: string
}): Promise<Metadata> => {
  const { doc, pathname = '/' } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? `${doc?.meta?.title} | Miles Roxas` : 'Miles Roxas'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: pathname,
    }),
    robots: doc?.meta?.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    title,
  }
}
