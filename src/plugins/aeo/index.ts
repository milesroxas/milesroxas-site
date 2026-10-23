import { revalidatePath, revalidateTag } from 'next/cache.js'
import { after } from 'next/server'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
  CollectionSlug,
  Config,
  Plugin,
} from 'payload'
import { unpublishedByOperation } from '@/collections/shared/revalidateDocument'
import { CONTENT_SURFACES, type ContentSurface, surfaceDocPath } from '@/shared/content/surfaces'
import { getServerSideURL } from '@/utilities/getURL'
import { indexNowEnabled, submitToIndexNow } from './indexNow'

/** The cache tag /llms.txt and /llms-full.txt are built under. */
export const LLMS_CACHE_TAG = 'llms-txt'

const SITEMAP_PATH = '/sitemap.xml'

type SurfaceDoc = { id: number | string; _status?: string | null; slug?: string | null }

const isPublished = (doc: SurfaceDoc | undefined) => doc?._status === 'published'

/** What a visible publish changes: the sitemap, and the two llms documents. */
const revalidatePublicListings = () => {
  revalidatePath(SITEMAP_PATH)
  revalidateTag(LLMS_CACHE_TAG, 'max')
}

const revalidateListings: CollectionAfterChangeHook<SurfaceDoc> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate && isPublished(doc)) revalidatePublicListings()
  return doc
}

// An unpublish is only visible to afterOperation (collections/shared/revalidateDocument).
const revalidateListingsOnUnpublish: CollectionAfterOperationHook = (arg) => {
  if (!arg.req.context.disableRevalidate && unpublishedByOperation(arg).length) {
    revalidatePublicListings()
  }
  return arg.result
}

const revalidateListingsOnDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidatePublicListings()
  return doc
}

/**
 * Runs an IndexNow submission after the editor's publish response when a
 * request scope exists, and inline otherwise (scripts, jobs).
 */
const submitDeferred = async (run: () => Promise<void>): Promise<void> => {
  try {
    after(run)
  } catch {
    await run()
  }
}

const docUrl = (surface: ContentSurface, slug: string) =>
  `${getServerSideURL()}${surfaceDocPath(surface, slug)}`

/**
 * Pings IndexNow on the publish events that change what engines should fetch:
 * publish and a slug change (the old URL is submitted so engines drop it).
 * Draft saves and autosaves never reach the submit call.
 */
const indexNowAfterChange =
  (surface: ContentSurface): CollectionAfterChangeHook<SurfaceDoc> =>
  async ({ doc, previousDoc, req: { payload, context } }) => {
    if (context.disableRevalidate || !indexNowEnabled()) return doc

    const urls: string[] = []
    if (isPublished(doc) && doc.slug) urls.push(docUrl(surface, doc.slug))

    const moved = isPublished(doc) && isPublished(previousDoc) && previousDoc.slug !== doc.slug
    if (moved && previousDoc.slug) urls.push(docUrl(surface, previousDoc.slug))

    if (urls.length) await submitDeferred(() => submitToIndexNow(payload, urls))
    return doc
  }

/** Pings IndexNow with the URL of each work, post or page an unpublish took down. */
const indexNowAfterOperation =
  (surface: ContentSurface): CollectionAfterOperationHook =>
  async (arg) => {
    const {
      req: { payload, context },
      result,
    } = arg
    if (context.disableRevalidate || !indexNowEnabled()) return result

    const urls = unpublishedByOperation<SurfaceDoc>(arg).flatMap((doc) =>
      doc.slug ? [docUrl(surface, doc.slug)] : [],
    )
    if (urls.length) await submitDeferred(() => submitToIndexNow(payload, urls))
    return result
  }

const indexNowAfterDelete =
  (surface: ContentSurface): CollectionAfterDeleteHook<SurfaceDoc> =>
  async ({ doc, req: { payload, context } }) => {
    if (context.disableRevalidate || !indexNowEnabled() || !doc?.slug) return doc
    const url = docUrl(surface, doc.slug)
    await submitDeferred(() => submitToIndexNow(payload, [url]))
    return doc
  }

/**
 * Answer-engine optimization (docs/aeo.md), ported from sas-site's plugin.
 * Hooks every public content surface so that a publish, unpublish, slug
 * change or delete refreshes /sitemap.xml, /llms.txt and /llms-full.txt and,
 * in production with INDEXNOW_KEY set, tells the IndexNow engines which URL
 * changed. The documents themselves are served by the route handlers in
 * src/app/(frontend)/(ai)/ and src/app/sitemap.ts, from ./buildLlms.ts and
 * ./publicDocs.ts. JSON-LD and page metadata are wired per route
 * (utilities/schema.ts, utilities/generateMeta.ts), not here.
 */
export const aeoPlugin =
  (): Plugin =>
  (config: Config): Config => {
    const surfaces = new Map<CollectionSlug, ContentSurface>(
      CONTENT_SURFACES.map((surface) => [surface.collection, surface]),
    )

    return {
      ...config,
      collections: (config.collections ?? []).map((collection) => {
        const surface = surfaces.get(collection.slug as CollectionSlug)
        if (!surface) return collection

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange ?? []),
              revalidateListings,
              indexNowAfterChange(surface),
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete ?? []),
              revalidateListingsOnDelete,
              indexNowAfterDelete(surface),
            ],
            afterOperation: [
              ...(collection.hooks?.afterOperation ?? []),
              revalidateListingsOnUnpublish,
              indexNowAfterOperation(surface),
            ],
          },
        }
      }),
    }
  }
