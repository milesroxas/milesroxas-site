'use client'

import { usePathname } from 'next/navigation'

/**
 * The route path as the site names it. Vercel regenerates the root page's
 * cached HTML with the canonical path `/index`, and Next hands that to
 * `usePathname` on the server while the browser reports `/`: markup keyed on
 * the path (the dock's current tab) then differs between the two and React
 * throws the page away and renders it again (error 418). Read through here,
 * both sides see `/`.
 */
export const normalizeSitePathname = (pathname: string): string =>
  pathname === '/index' ? '/' : pathname

export function useSitePathname(): string {
  return normalizeSitePathname(usePathname())
}
