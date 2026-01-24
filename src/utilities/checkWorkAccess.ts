/**
 * Check if user has access to protected works based on query param
 */
export function hasWorkAccess(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): boolean {
  // Check for the access query param
  if (searchParams instanceof URLSearchParams) {
    return searchParams.has('access')
  }

  // Handle Next.js searchParams object
  return 'access' in searchParams && searchParams.access !== undefined
}

/**
 * Get the access query param value
 */
export function getAccessParam(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): string | null {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get('access')
  }

  const value = searchParams.access
  if (Array.isArray(value)) {
    return value[0] || null
  }
  return value || null
}
