import type { AccessArgs, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { MEMBERS_TEASER, publishedContentRead } from './members'

const read = (user: unknown, context: Record<string, unknown> = {}, where?: object) =>
  publishedContentRead(where as never)({
    req: { user, context } as unknown as PayloadRequest,
  } as AccessArgs)

const hidesMembersOnly = { visibility: { not_equals: 'members' } }

describe('publishedContentRead', () => {
  it('lets the team read everything', () => {
    expect(read({ id: 1, collection: 'users' })).toBe(true)
  })

  it('shows an anonymous reader published, public documents only', () => {
    expect(read(null)).toEqual({ and: [{ _status: { equals: 'published' } }, hidesMembersOnly] })
  })

  it('treats an MCP key over REST as anonymous', () => {
    expect(read({ id: 9, collection: 'payload-mcp-api-keys' })).toEqual({
      and: [{ _status: { equals: 'published' } }, hidesMembersOnly],
    })
  })

  it('shows a member published documents, members-only ones included', () => {
    expect(read({ id: 2, collection: 'members' })).toEqual({
      and: [{ _status: { equals: 'published' } }],
    })
  })

  it('includes members-only documents for a teaser read, still published only', () => {
    expect(read(null, MEMBERS_TEASER)).toEqual({ and: [{ _status: { equals: 'published' } }] })
  })

  it('keeps the collection condition for everyone but the team', () => {
    const notProtected = { isProtected: { not_equals: true } }
    expect(read({ id: 2, collection: 'members' }, {}, notProtected)).toEqual({
      and: [{ _status: { equals: 'published' } }, notProtected],
    })
  })
})
