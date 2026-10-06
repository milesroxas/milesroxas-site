import { type NextRequest, NextResponse } from 'next/server'

const ACCESS_COOKIE = 'site_access'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/*
 * Client reports: static pages on their own host, one slug per client
 * (reports.milesroxas.com/<slug>), served from public/reports/<slug>/.
 * Next drops the trailing slash before the proxy runs, so a report links its
 * own files from /<slug>/... The reports are unlisted: every response is noindex.
 */
const REPORTS_HOST_PREFIX = 'reports.'
const REPORT_PAGE = /^\/[a-z0-9-]+$/

function reportResponse(request: NextRequest) {
  const { pathname } = request.nextUrl
  const target = request.nextUrl.clone()
  target.pathname = REPORT_PAGE.test(pathname)
    ? `/reports${pathname}/index.html`
    : `/reports${pathname}`

  const response = NextResponse.rewrite(target)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export function proxy(request: NextRequest) {
  if (request.headers.get('host')?.startsWith(REPORTS_HOST_PREFIX)) {
    return reportResponse(request)
  }

  const requestHeaders = new Headers(request.headers)
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
