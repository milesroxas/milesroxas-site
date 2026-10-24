import config from '@payload-config'
import { getPayload } from 'payload'
import { buildHomeMarkdown } from '@/plugins/aeo/buildLlms'
import { HOME_SURFACE } from '@/shared/content/surfaces'
import { markdownResponse } from '../../headers'

/** The home page's markdown alternate (`/index.md`, or `Accept: text/markdown` on `/`). */
export async function GET() {
  return markdownResponse(await buildHomeMarkdown(await getPayload({ config })), HOME_SURFACE.path)
}
