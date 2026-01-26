import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'site_access'

/**
 * Valid access keys - add your secret keys here
 * Share links like: yoursite.com?access=portfolio-2024
 */
const VALID_ACCESS_KEYS = ['portfolio']

/**
 * Check if user has access to protected works
 * Checks both query param (for initial visit) and cookie (for subsequent navigation)
 */
export async function hasWorkAccess(
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>,
): Promise<boolean> {
  const accessValue = await getAccessParam(searchParams)
  return accessValue !== null && VALID_ACCESS_KEYS.includes(accessValue)
}

/**
 * Get the access value from query param or cookie
 */
export async function getAccessParam(
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>,
): Promise<string | null> {
  // Check query param first
  if (searchParams) {
    if (searchParams instanceof URLSearchParams) {
      const value = searchParams.get('access')
      if (value) return value
    } else {
      const value = searchParams.access
      if (value) return Array.isArray(value) ? value[0] : value
    }
  }

  // Fall back to cookie
  const cookieStore = await cookies()
  const accessCookie = cookieStore.get(ACCESS_COOKIE)
  return accessCookie?.value || null
}
