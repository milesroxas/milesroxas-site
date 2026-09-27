import { describe, expect, it } from 'vitest'
import { surfaceForPath } from './surfaces'

describe('surfaceForPath', () => {
  it('names the section a document path sits under', () => {
    expect(surfaceForPath('/works/brand-development-at-the-executive-level')?.collection).toBe(
      'works',
    )
    expect(surfaceForPath('/posts/emotional-architecture')?.title).toBe('Posts')
  })

  it('matches a prefix on its own, but never a longer segment that starts the same', () => {
    expect(surfaceForPath('/works')?.collection).toBe('works')
    expect(surfaceForPath('/worksheets')).toBeNull()
  })

  it('has no section for root pages or the homepage', () => {
    expect(surfaceForPath('/contact')).toBeNull()
    expect(surfaceForPath('/')).toBeNull()
  })
})
