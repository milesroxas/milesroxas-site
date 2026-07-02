import type { Access, Where } from 'payload'

/**
 * Read access for works.
 *
 * Authenticated users see everything. Anonymous API consumers (REST/GraphQL and
 * any Local API call with `overrideAccess: false`) only see published works that
 * are not protected — protected works are never exposed through the public API.
 *
 * Server components that implement the query-param access flow fetch works with
 * the Local API's trusted default (`overrideAccess: true`) and gate rendering
 * through `resolveVisibleWork` / `hasWorkAccess` instead.
 */
export const worksReadAccess: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  const publishedAndUnprotected: Where = {
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      {
        isProtected: {
          not_equals: true,
        },
      },
    ],
  }

  return publishedAndUnprotected
}
