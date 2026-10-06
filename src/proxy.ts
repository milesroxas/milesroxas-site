import { type NextRequest, NextResponse } from 'next/server'

const ACCESS_COOKIE = 'site_access'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/*
 * Client reports: static pages on their own host, one slug per client and one
 * per report under it (reports.milesroxas.com/<client>/<report>), served from
 * public/reports/<client>/<report>/. Next drops the trailing slash before the
 * proxy runs, so a report links its own files from /<client>/<report>/...
 * The reports are unlisted: every response is noindex.
 */
const REPORTS_HOST_PREFIX = 'reports.'
const REPORT_PAGE = /^\/[a-z0-9-]+\/[a-z0-9-]+$/

/*
 * Addresses shared before reports gained a client slug. The O'Linn progress
 * report went out as /olinn and is open in the client's browser, so the page
 * and the images it loads lazily redirect to where they live now. A `from`
 * ending in a slash matches everything under it; any other matches exactly.
 */
const MOVED_REPORTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: '/olinn', to: '/olinn/progress' },
  { from: '/olinn/img/', to: '/olinn/progress/img/' },
]

function movedReportPath(pathname: string) {
  for (const { from, to } of MOVED_REPORTS) {
    if (from.endsWith('/') ? pathname.startsWith(from) : pathname === from) {
      return to + pathname.slice(from.length)
    }
  }
  return null
}

function noindex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

function reportResponse(request: NextRequest) {
  const { pathname } = request.nextUrl
  const target = request.nextUrl.clone()

  const moved = movedReportPath(pathname)
  if (moved) {
    // Temporary, so /<client> stays free to list that client's reports later.
    target.pathname = moved
    return noindex(NextResponse.redirect(target, 307))
  }

  target.pathname = REPORT_PAGE.test(pathname)
    ? `/reports${pathname}/index.html`
    : `/reports${pathname}`
  return noindex(NextResponse.rewrite(target))
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
