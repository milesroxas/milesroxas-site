import { publishedContentRead } from '@/access/members'

/**
 * Read access for works: `publishedContentRead`, and a protected work is
 * never read through the public API, by members either.
 *
 * Server components that implement the query-param access flow fetch works with
 * the Local API's trusted default (`overrideAccess: true`) and gate rendering
 * through `resolveVisibleWork` / `hasWorkAccess` instead.
 */
export const worksReadAccess = publishedContentRead({ isProtected: { not_equals: true } })
