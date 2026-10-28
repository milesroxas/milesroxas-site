/** The members area's routes, in one place for links, redirects and emails. */
export const MEMBERS_PATHS = {
  home: '/members',
  signIn: '/members/sign-in',
  join: '/members/join',
  forgotPassword: '/members/forgot-password',
  resetPassword: '/members/reset-password',
  verify: '/members/verify',
  account: '/members/account',
} as const

/**
 * A `next` destination is only ever a path on this site: anything else (an
 * absolute URL, `//host`, a backslash trick) falls back to the members home,
 * so a sign-in link cannot be turned into an open redirect.
 */
export function safeNext(next: unknown, fallback: string = MEMBERS_PATHS.home): string {
  if (typeof next !== 'string' || !next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.includes('\\')) return fallback
  return next
}

/** A members route that returns to `next` afterwards. */
export const withNext = (path: string, next?: string | null) =>
  next && next !== MEMBERS_PATHS.home ? `${path}?next=${encodeURIComponent(next)}` : path
