import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypeWithID } from 'payload'

type RoutedDoc = TypeWithID & { _status?: 'draft' | 'published' | null; slug?: string | null }

type RevalidateDocumentOptions = {
  /** Singular noun for the log line ("post", "work"). */
  noun: string
  /** The public path a document renders at, from its slug. */
  pathFor: (slug: string | null | undefined) => string
  /** Indexes, sitemaps and tags that list the document, busted with its path. */
  revalidateLists: () => void
}

/**
 * afterChange and afterDelete hooks that bust a routed document's page and the
 * lists it appears in: on publish, on unpublish (the old path), and on delete.
 */
export const revalidateDocument = <T extends RoutedDoc>({
  noun,
  pathFor,
  revalidateLists,
}: RevalidateDocumentOptions) => {
  const afterChange: CollectionAfterChangeHook<T> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate) {
      if (doc._status === 'published') {
        const path = pathFor(doc.slug)

        payload.logger.info(`Revalidating ${noun} at path: ${path}`)

        revalidatePath(path)
        revalidateLists()
      }

      // If the document was previously published, we need to revalidate the old path
      if (previousDoc?._status === 'published' && doc._status !== 'published') {
        const oldPath = pathFor(previousDoc.slug)

        payload.logger.info(`Revalidating old ${noun} at path: ${oldPath}`)

        revalidatePath(oldPath)
        revalidateLists()
      }
    }
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<T> = ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) {
      revalidatePath(pathFor(doc?.slug))
      revalidateLists()
    }

    return doc
  }

  return { afterChange, afterDelete }
}
