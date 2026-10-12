import { cookies, draftMode } from 'next/headers'
import { cache } from 'react'

const ACCESS_COOKIE = 'site_access'

/**
 * Valid access keys, comma-separated in the WORK_ACCESS_KEYS env var.
 * Share links like: yoursite.com/works/<slug>?access=<key>; the proxy turns
 * the key into the `site_access` cookie and redirects to the clean URL.
 */
const VALID_ACCESS_KEYS = (process.env.WORK_ACCESS_KEYS ?? '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean)

/**
 * Whether the visitor may see protected works, or how to find out. Reading the
 * cookie makes the render dynamic, so `resolveVisibleWork` takes the function
 * and calls it only when it meets a protected work: a page of public works
 * stays cached HTML.
 */
export type WorkAccess = boolean | (() => Promise<boolean>)

/**
 * Whether the visitor may see protected works. Draft mode counts as access
 * (it is only enabled for authenticated preview); otherwise the cookie is
 * checked against the configured keys. Memoised per request.
 */
export const hasWorkAccess = cache(async (): Promise<boolean> => {
  const { isEnabled: draft } = await draftMode()
  if (draft) return true

  if (VALID_ACCESS_KEYS.length === 0) return false

  const accessValue = (await cookies()).get(ACCESS_COOKIE)?.value
  return Boolean(accessValue) && VALID_ACCESS_KEYS.includes(accessValue as string)
})
