import config from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { LLMS_CACHE_TAG } from '@/plugins/aeo'
import { buildLlmsTxt } from '@/plugins/aeo/buildLlms'
import { TEXT_HEADERS } from '../headers'

const getLlmsTxt = unstable_cache(
  async () => buildLlmsTxt(await getPayload({ config })),
  ['llms-txt'],
  { tags: [LLMS_CACHE_TAG, 'global_site-info'] },
)

/** The site for agents, in the llmstxt.org shape (docs/aeo.md). */
export async function GET() {
  return new Response(await getLlmsTxt(), { headers: TEXT_HEADERS })
}
