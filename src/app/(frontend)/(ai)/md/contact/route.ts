import config from '@payload-config'
import { getPayload } from 'payload'
import { buildContactMarkdown } from '@/plugins/aeo/pageMarkdown'
import { markdownResponse } from '../../headers'

/** The contact page's markdown alternate (`/contact.md`, or `Accept: text/markdown` on `/contact`). */
export async function GET() {
  return markdownResponse(await buildContactMarkdown(await getPayload({ config })), '/contact')
}
