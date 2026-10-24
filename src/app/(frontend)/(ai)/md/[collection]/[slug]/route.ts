import config from '@payload-config'
import { getPayload } from 'payload'
import { buildDocMarkdown } from '@/plugins/aeo/buildLlms'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { markdownResponse } from '../../../headers'

type Args = { params: Promise<{ collection: string; slug: string }> }

/**
 * A document's markdown alternate, reached through the rewrites in
 * next.config.ts: `/posts/<slug>.md`, `/works/<slug>.md`, and content
 * negotiation (`Accept: text/markdown`) on the page itself. The page stays the
 * canonical URL. Pages at the root are not served: `/<slug>.md` would have to
 * be routed beside every root file. The home page has its own (`md/home`).
 */
export async function GET(_request: Request, { params }: Args) {
  const { collection, slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const surface = surfaceByCollection.get(collection)
  if (!surface?.urlPrefix) {
    return markdownResponse(null, '/')
  }

  const markdown = await buildDocMarkdown(await getPayload({ config }), collection, slug)
  return markdownResponse(markdown, surfaceDocPath(surface, slug))
}
