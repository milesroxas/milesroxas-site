import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
  CollectionSlug,
  TypeWithID,
} from 'payload'

type RoutedDoc = TypeWithID & { _status?: 'draft' | 'published' | null; slug?: string | null }

/** What an afterOperation hook receives, however its collection is typed. */
type OperationArg = { operation: string; args: unknown; result: unknown }

/**
 * The documents a live save left unpublished: an unpublish, whichever client
 * sent it (the admin button, a scheduled job, MCP). A draft save (autosave,
 * Save draft) never changes the live document and is skipped.
 *
 * afterChange's `previousDoc` cannot tell the two apart: it is the latest
 * version, which is a draft as soon as one autosave follows a publish, so an
 * unpublish looked like a draft-to-draft save and busted nothing.
 */
export const unpublishedByOperation = <T extends { _status?: string | null }>({
  operation,
  args,
  result,
}: OperationArg): T[] => {
  if (operation !== 'update' && operation !== 'updateByID') return []
  if ((args as { draft?: boolean }).draft) return []
  const docs = operation === 'update' ? (result as { docs: T[] }).docs : [result as T]
  return docs.filter((doc) => doc._status !== 'published')
}

type RevalidateDocumentOptions = {
  /** Singular noun for the log line ("post", "work"). */
  noun: string
  /** The public path a document renders at, from its slug. */
  pathFor: (slug: string | null | undefined) => string
  /** Indexes, sitemaps and tags that list the document, busted with its path. */
  revalidateLists: () => void
}

/**
 * Hooks that bust a routed document's page and the lists it appears in: on
 * publish (afterChange), on unpublish (afterOperation), and on delete.
 */
export const revalidateDocument = <TSlug extends CollectionSlug>({
  noun,
  pathFor,
  revalidateLists,
}: RevalidateDocumentOptions) => {
  const afterChange: CollectionAfterChangeHook<RoutedDoc> = ({
    doc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate && doc._status === 'published') {
      const path = pathFor(doc.slug)

      payload.logger.info(`Revalidating ${noun} at path: ${path}`)

      revalidatePath(path)
      revalidateLists()
    }
    return doc
  }

  const afterOperation: CollectionAfterOperationHook<TSlug> = (arg) => {
    const {
      req: { payload, context },
      result,
    } = arg
    if (context.disableRevalidate) return result

    const docs = unpublishedByOperation<RoutedDoc>(arg)
    if (docs.length === 0) return result

    for (const doc of docs) {
      const path = pathFor(doc.slug)

      payload.logger.info(`Revalidating unpublished ${noun} at path: ${path}`)

      revalidatePath(path)
    }
    revalidateLists()

    return result
  }

  const afterDelete: CollectionAfterDeleteHook<RoutedDoc> = ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) {
      revalidatePath(pathFor(doc?.slug))
      revalidateLists()
    }

    return doc
  }

  return { afterChange, afterOperation, afterDelete }
}
