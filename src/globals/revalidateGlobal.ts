import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook, GlobalSlug } from 'payload'

/**
 * Busts a singleton page's path and its `getCachedGlobal` tag when it
 * publishes or unpublishes; a saved draft changes nothing public.
 */
export const revalidatePublishedGlobal =
  (slug: GlobalSlug, path: string): GlobalAfterChangeHook =>
  ({ doc, previousDoc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      const published = doc._status === 'published'
      const unpublished = previousDoc?._status === 'published' && !published

      if (published || unpublished) {
        payload.logger.info(`Revalidating ${slug} at path: ${path}`)
        revalidatePath(path)
        revalidateTag(`global_${slug}`, 'max')
      }
    }
    return doc
  }
