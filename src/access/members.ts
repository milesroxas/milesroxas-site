import type { Access, PayloadRequest, Where } from 'payload'

type Principal = PayloadRequest['user']

/** A team member (`users`). MCP keys authenticate as `req.user` too and are not one. */
export const isTeam = (user: Principal): boolean => user?.collection === 'users'

/** A signed-in site member (`members`): reads members-only content, never the admin. */
export const isMember = (user: Principal): boolean => user?.collection === 'members'

/**
 * Local API `context` for a read that shows members-only documents as teasers:
 * a listing that draws them as locked cards, a route that renders the sign-in
 * gate in place of the body. REST and GraphQL cannot set it, so the public API
 * never sees members-only documents.
 */
export const MEMBERS_TEASER = { membersTeaser: true } as const

/**
 * Read access for a public content collection (Pages, Posts, Works), with any
 * extra condition the collection adds (`where`).
 *
 * - Team: everything.
 * - Members: published documents, members-only ones included.
 * - Everyone else (anonymous visitors, MCP keys over REST, any read with
 *   `overrideAccess: false` and no user): published, public documents. The
 *   sitemap, llms.txt, the markdown alternates and the Ask corpus all read
 *   this way, so a members-only document never reaches them.
 * - A Local API read carrying `MEMBERS_TEASER`: as a member, so the caller
 *   can draw the lock or the gate itself.
 */
export const publishedContentRead =
  (where?: Where): Access =>
  ({ req }) => {
    if (isTeam(req.user)) return true

    const and: Where[] = [{ _status: { equals: 'published' } }]
    if (where) and.push(where)
    if (!isMember(req.user) && !req.context?.membersTeaser) {
      and.push({ visibility: { not_equals: 'members' } })
    }
    return { and }
  }
