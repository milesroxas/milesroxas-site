/**
 * The IndexNow key file (indexnow.org). Hosted at a fixed path and named in
 * each submission's `keyLocation`, so rotating the key is an env change
 * (INDEXNOW_KEY) with no commit. Not found until the key is set.
 */
export function GET() {
  const key = process.env.INDEXNOW_KEY
  if (!key) return new Response('Not found', { status: 404 })

  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  })
}
