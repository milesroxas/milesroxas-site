import config from '@payload-config'
import { getPayload } from 'payload'
import { buildIndexMarkdown } from '@/plugins/aeo/pageMarkdown'
import { surfaceByCollection } from '@/shared/content/surfaces'
import { markdownResponse } from '../../headers'

type Args = { params: Promise<{ collection: string }> }

/**
 * An index page's markdown alternate (`/works.md`, `/posts.md`, or
 * `Accept: text/markdown` on `/works` and `/posts`): its words and one link per
 * document it lists. The page stays the canonical URL.
 */
export async function GET(_request: Request, { params }: Args) {
  const { collection } = await params
  const markdown = await buildIndexMarkdown(await getPayload({ config }), collection)
  return markdownResponse(markdown, surfaceByCollection.get(collection)?.urlPrefix ?? '/')
}
