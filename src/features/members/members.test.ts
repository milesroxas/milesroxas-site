import { describe, expect, it } from 'vitest'
import { hasMemberHint, MEMBER_HINT_SCRIPT } from './hint'
import { MEMBERS_PATHS, safeNext, withNext } from './paths'
import { toTeaser } from './teaser'

describe('safeNext', () => {
  it('keeps a path on this site', () => {
    expect(safeNext('/posts/a-post')).toBe('/posts/a-post')
    expect(safeNext('/works/x?y=1')).toBe('/works/x?y=1')
  })

  it('refuses anything that could leave the site', () => {
    for (const next of ['https://evil.test', '//evil.test', '/\\evil.test', 'posts', '', null]) {
      expect(safeNext(next)).toBe(MEMBERS_PATHS.home)
    }
  })
})

describe('withNext', () => {
  it('carries the destination, and leaves it off for the members home', () => {
    expect(withNext('/members/sign-in', '/posts/a b')).toBe(
      '/members/sign-in?next=%2Fposts%2Fa%20b',
    )
    expect(withNext('/members/sign-in', MEMBERS_PATHS.home)).toBe('/members/sign-in')
  })
})

describe('toTeaser', () => {
  it('keeps the opening and drops the body, including fields it has never heard of', () => {
    const teaser = toTeaser({
      id: 1,
      title: 'A post',
      hero: { type: 'editorial' },
      meta: { description: 'd' },
      content: { root: {} },
      layout: [{ blockType: 'content' }],
      intro: { body: {} },
      somethingNew: 'secret',
    })
    expect(teaser).toEqual({
      id: 1,
      title: 'A post',
      hero: { type: 'editorial' },
      meta: { description: 'd' },
    })
  })
})

describe('member hint', () => {
  it('reads the cookie among others', () => {
    expect(hasMemberHint('a=1; member=1; b=2')).toBe(true)
    expect(hasMemberHint('member=10; notmember=1')).toBe(false)
    expect(hasMemberHint('')).toBe(false)
  })

  it('stamps the attribute from the head script', () => {
    // biome-ignore lint/suspicious/noDocumentCookie: the head script reads document.cookie
    document.cookie = 'member=1'
    new Function(MEMBER_HINT_SCRIPT)()
    expect(document.documentElement.hasAttribute('data-member')).toBe(true)
    // biome-ignore lint/suspicious/noDocumentCookie: clears the cookie set above
    document.cookie = 'member=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.documentElement.removeAttribute('data-member')
  })
})
