import { cookies, headers } from 'next/headers'

const ACCESS_COOKIE = 'site_access'

/**
 * Valid access keys - add your secret keys here
 * Share links like: yoursite.com?access=portfolio
 */
const VALID_ACCESS_KEYS = ['portfolio']

/**
 * Check if user has access to protected works
 * Checks URL query param (for initial visit) and cookie (for subsequent navigation)
 */
export async function hasWorkAccess(): Promise<boolean> {
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
