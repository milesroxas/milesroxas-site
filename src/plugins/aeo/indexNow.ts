import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Submissions only make sense from the canonical production host: a preview
 * or local URL fails key validation and pollutes the engines' queues.
 * VERCEL_ENV (not NODE_ENV, which is 'production' in preview builds too)
 * names a real production deployment.
 */
export const indexNowEnabled = (): boolean =>
  Boolean(process.env.INDEXNOW_KEY) && process.env.VERCEL_ENV === 'production'

/**
 * Push changed URLs to the shared IndexNow endpoint; the participating engines
 * (Bing and Copilot, Yandex, Naver, Seznam, Amazonbot, the Internet Archive)
 * propagate among themselves. Google does not take IndexNow. A submission is a
 * hint, not a transaction: failures are logged, never thrown, never retried.
 * 202 is accepted with key validation pending.
 */
export async function submitToIndexNow(payload: Payload, urls: string[]): Promise<void> {
  if (!indexNowEnabled() || urls.length === 0) return

  const siteUrl = getServerSideURL()

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key: process.env.INDEXNOW_KEY,
        keyLocation: `${siteUrl}/indexnow.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 200 || res.status === 202) {
      payload.logger.info(`IndexNow: submitted ${urls.join(', ')}`)
    } else {
      payload.logger.warn(`IndexNow: status ${res.status} submitting ${urls.join(', ')}`)
    }
  } catch (err) {
    payload.logger.warn({ msg: 'IndexNow: submission failed', err })
  }
}
