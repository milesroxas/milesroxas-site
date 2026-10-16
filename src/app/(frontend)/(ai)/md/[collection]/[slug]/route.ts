import config from '@payload-config'
import { getPayload } from 'payload'
import { buildDocMarkdown } from '@/plugins/aeo/buildLlms'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { markdownResponse } from '../../../headers'

type Args = { params: Promise<{ collection: string; slug: string }> }

/**
 * A document's markdown alternate, reached through the rewrites in
 * next.config.ts: `/posts/<slug>.md`, `/works/<slug>.md`, `/index.md` for the
 * home page, and content negotiation (`Accept: text/markdown`) on the page
 * itself. The page stays the canonical URL. Of the pages at the root only home
 * is served: `/<slug>.md` would have to be routed beside every root file.
 */
export async function GET(_request: Request, { params }: Args) {
  const { collection, slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const surface = surfaceByCollection.get(collection)
  if (!surface || (!surface.urlPrefix && slug !== surface.homeSlug)) {
    return markdownResponse(null, '/')
  }

  const markdown = await buildDocMarkdown(await getPayload({ config }), collection, slug)
  return markdownResponse(markdown, surfaceDocPath(surface, slug))
}
