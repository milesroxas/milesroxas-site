import { describe, expect, it } from 'vitest'
import { articleAuthors, resolveTitle } from './pageTitle'

const NAME = 'Miles Roxas'

describe('resolveTitle', () => {
  it('gives the home page the bare site name', () => {
    expect(resolveTitle({ title: 'Home' }, '/', NAME)).toEqual({
      title: { absolute: NAME },
      text: NAME,
    })
    expect(resolveTitle(null, '/', NAME).text).toBe(NAME)
  })

  it('lets the template add the site name to an ordinary title', () => {
    expect(resolveTitle({ title: 'Posts' }, '/posts', NAME)).toEqual({
      title: 'Posts',
      text: 'Posts | Miles Roxas',
    })
  })

  it('never doubles the site name when the SEO title already leads with it', () => {
    const doc = { title: 'Home', meta: { title: 'Miles Roxas | Design lead and engineer' } }
    expect(resolveTitle(doc, '/', NAME)).toEqual({
      title: { absolute: 'Miles Roxas | Design lead and engineer' },
      text: 'Miles Roxas | Design lead and engineer',
    })
  })

  it('strips a stored trailing suffix so the template adds it once', () => {
    expect(resolveTitle({ meta: { title: 'Work | Miles Roxas' } }, '/works', NAME)).toEqual({
      title: 'Work',
      text: 'Work | Miles Roxas',
    })
  })
})

describe('articleAuthors', () => {
  it('credits the owner by full name, keeps other names, and falls back to the owner', () => {
    expect(articleAuthors(['Miles', 'Ada'], NAME)).toEqual([NAME, 'Ada'])
    expect(articleAuthors([], NAME)).toEqual([NAME])
    expect(articleAuthors(undefined, NAME)).toEqual([NAME])
  })
})
