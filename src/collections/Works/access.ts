import type { Access } from 'payload'
import { authenticatedOr } from '@/access/authenticatedOr'

/**
 * Read access for works.
 *
 * Team members see everything. Anonymous API consumers (REST/GraphQL and any
 * Local API call with `overrideAccess: false`) and MCP API keys over REST only
 * see published works that are not protected — protected works are never
 * exposed through the public API.
 *
 * Server components that implement the query-param access flow fetch works with
 * the Local API's trusted default (`overrideAccess: true`) and gate rendering
 * through `resolveVisibleWork` / `hasWorkAccess` instead.
 */
export const worksReadAccess: Access = authenticatedOr({
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
})
