import { getServerSideURL } from '@/utilities/getURL'

/**
 * Response headers the agent-facing text routes share: an hour at the CDN,
 * a day of stale service while the next copy builds, never cached by the
 * browser itself.
 */
const CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

export const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': CACHE_CONTROL,
}

const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'Cache-Control': CACHE_CONTROL,
}

/**
 * A page's markdown alternate, or a 404 when the page has none. The HTML page
 * stays the canonical URL, and the answer varies with `Accept` because the
 * page's own URL negotiates it (next.config.ts).
 */
export const markdownResponse = (markdown: string | null, canonicalPath: string): Response =>
  markdown
    ? new Response(markdown, {
        headers: {
          ...MARKDOWN_HEADERS,
          Link: `<${getServerSideURL()}${canonicalPath}>; rel="canonical"`,
          Vary: 'Accept',
        },
      })
    : new Response('Not found', { status: 404 })
