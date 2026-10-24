import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import type { CollectionSlug, GlobalSlug, Plugin } from 'payload'
import type { Home, Page, Post, Work } from '@/payload-types'
import { HOME_SURFACE, surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { getServerSideURL } from '@/utilities/getURL'

/** Documents that carry the manual SEO tab (`src/collections/shared/seoTab.ts`). */
export const SEO_COLLECTIONS: CollectionSlug[] = ['pages', 'posts', 'works']
export const SEO_GLOBALS: GlobalSlug[] = [HOME_SURFACE.global, 'works-index']

/** The page's own title: the root layout's title template adds " | Miles Roxas". */
export const generateTitle: GenerateTitle<Post | Page | Work | Home> = ({ doc }) => doc?.title ?? ''

/** Globals with an SEO tab publish at a fixed path. */
const GLOBAL_PATHS: Partial<Record<GlobalSlug, string>> = {
  [HOME_SURFACE.global]: HOME_SURFACE.path,
  'works-index': '/works',
}

/** The document's public URL: a global at its path, a document by its collection's surface. */
export const generateURL: GenerateURL<Post | Page | Work> = ({
  doc,
  collectionSlug,
  globalSlug,
}) => {
  const url = getServerSideURL()
  if (globalSlug) return `${url}${GLOBAL_PATHS[globalSlug] ?? ''}`
  const surface = collectionSlug ? surfaceByCollection.get(collectionSlug) : undefined
  if (!doc?.slug || !surface) return url
  return `${url}${surfaceDocPath(surface, doc.slug)}`
}

/**
 * plugin-seo 3.90 answers its generate endpoints with 403 unless the document's
 * collection or global is listed in its config, and listing one also injects a
 * second `meta` group beside the manual SEO tab (payloadcms/payload#18311).
 * The admin's Auto-generate button then does nothing and blanks a saved title.
 * Run the plugin for its endpoints and translations, then hand the collections
 * and globals back as they came in so nothing is injected. Drop this wrapper once
 * @payloadcms/plugin-seo ships the fix merged in payloadcms/payload#18427.
 */
export const seo: Plugin = async (config) => {
  const withSeo = await seoPlugin({
    collections: SEO_COLLECTIONS,
    globals: SEO_GLOBALS,
    generateTitle,
    generateURL,
  })(config)
  return { ...withSeo, collections: config.collections, globals: config.globals }
}
