import { cookies, draftMode, headers } from 'next/headers'

const ACCESS_COOKIE = 'site_access'

/**
 * Valid access keys, comma-separated in the WORK_ACCESS_KEYS env var.
 * Share links like: yoursite.com?access=<key>
 */
const VALID_ACCESS_KEYS = (process.env.WORK_ACCESS_KEYS ?? '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean)

/**
 * Check if the visitor may see protected works.
 * Draft mode counts as access (it is only enabled for authenticated preview),
 * otherwise the URL query param (initial visit) and cookie (subsequent
 * navigation) are checked against the configured access keys.
 */
export async function hasWorkAccess(): Promise<boolean> {
  const { isEnabled: draft } = await draftMode()
  if (draft) return true

  if (VALID_ACCESS_KEYS.length === 0) return false

  const accessValue = await getAccessValue()
  return accessValue !== null && VALID_ACCESS_KEYS.includes(accessValue)
}

/**
 * Get the access value from URL query param or cookie
 */
async function getAccessValue(): Promise<string | null> {
  // Check URL query param first (for initial visit with ?access=...)
  const headersList = await headers()
  const url = headersList.get('x-url')

  if (url) {
    try {
      const urlObj = new URL(url)
      const accessParam = urlObj.searchParams.get('access')
      if (accessParam) return accessParam
    } catch {
      // Invalid URL, continue to cookie check
    }
  }

  // Fall back to cookie (for subsequent navigation)
  const cookieStore = await cookies()
  const accessCookie = cookieStore.get(ACCESS_COOKIE)
  return accessCookie?.value || null
}
