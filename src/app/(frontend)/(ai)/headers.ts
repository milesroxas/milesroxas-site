/**
 * Response headers the agent-facing text routes share: an hour at the CDN,
 * a day of stale service while the next copy builds, never cached by the
 * browser itself.
 */
export const CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'

export const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': CACHE_CONTROL,
}

export const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'Cache-Control': CACHE_CONTROL,
}
