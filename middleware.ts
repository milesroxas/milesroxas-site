import { type NextRequest, NextResponse } from 'next/server'

const ACCESS_COOKIE = 'site_access'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)

  // Add the full URL to headers so we can access query params in server components
  requestHeaders.set('x-url', request.url)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Check for access param in URL
  const accessParam = request.nextUrl.searchParams.get('access')

  if (accessParam) {
    // Set cookie when access param is present - persists access across navigation
    response.cookies.set(ACCESS_COOKIE, accessParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
