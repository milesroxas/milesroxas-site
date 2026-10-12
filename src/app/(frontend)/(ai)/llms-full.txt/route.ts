import config from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { LLMS_CACHE_TAG } from '@/plugins/aeo'
import { buildLlmsFullTxt } from '@/plugins/aeo/buildLlms'
import { TEXT_HEADERS } from '../headers'

const getLlmsFullTxt = unstable_cache(
  async () => buildLlmsFullTxt(await getPayload({ config })),
  ['llms-full-txt'],
  { tags: [LLMS_CACHE_TAG, 'global_site-info'] },
)

/** Every public document's text in one file (docs/aeo.md). */
export async function GET() {
  return new Response(await getLlmsFullTxt(), { headers: TEXT_HEADERS })
}
