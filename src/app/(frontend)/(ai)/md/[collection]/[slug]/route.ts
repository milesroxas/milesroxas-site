import config from '@payload-config'
import { getPayload } from 'payload'
import { buildDocMarkdown } from '@/plugins/aeo/buildLlms'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { getServerSideURL } from '@/utilities/getURL'
import { MARKDOWN_HEADERS } from '../../../headers'

type Args = { params: Promise<{ collection: string; slug: string }> }

/**
 * A document's markdown alternate, reached through the rewrites in
 * next.config.ts: `/posts/<slug>.md`, `/works/<slug>.md`, and content
 * negotiation (`Accept: text/markdown`) on the page itself. The page stays the
 * canonical URL. Only the surfaces with a URL prefix are served: pages at the
 * root would need `/<slug>.md` to be routed too, and nothing asks for it.
 */
export async function GET(_request: Request, { params }: Args) {
  const { collection, slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const surface = surfaceByCollection.get(collection)
  if (!surface?.urlPrefix) return new Response('Not found', { status: 404 })

  const markdown = await buildDocMarkdown(await getPayload({ config }), collection, slug)
  if (!markdown) return new Response('Not found', { status: 404 })

  return new Response(markdown, {
    headers: {
      ...MARKDOWN_HEADERS,
      Link: `<${getServerSideURL()}${surfaceDocPath(surface, slug)}>; rel="canonical"`,
      Vary: 'Accept',
    },
  })
}
