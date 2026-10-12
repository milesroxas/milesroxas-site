import { describe, expect, it } from 'vitest'
import { normalizeSitePathname } from './use-site-pathname'

describe('normalizeSitePathname', () => {
  it('reads the root page as / whichever path the server rendered it under', () => {
    expect(normalizeSitePathname('/index')).toBe('/')
    expect(normalizeSitePathname('/')).toBe('/')
  })

  it('leaves every other path alone', () => {
    expect(normalizeSitePathname('/works')).toBe('/works')
    expect(normalizeSitePathname('/works/index')).toBe('/works/index')
    expect(normalizeSitePathname('/posts/index-fund')).toBe('/posts/index-fund')
  })
})
