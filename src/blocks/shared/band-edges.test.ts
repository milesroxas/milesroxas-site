import { describe, expect, it } from 'vitest'
import { bandEdges } from './band-edges'

describe('bandEdges', () => {
  it('marks nothing on a page-surface run', () => {
    expect(bandEdges(['default', null, undefined])).toEqual([undefined, undefined, undefined])
  })

  it('marks only the outer edges of a run of one painted surface', () => {
    expect(bandEdges(['default', 'inverted', 'inverted', 'inverted', 'default'])).toEqual([
      'bottom',
      'top',
      undefined,
      'bottom',
      'top',
    ])
  })

  it('marks both edges between two painted surfaces', () => {
    expect(bandEdges(['neutral', 'brand'])).toEqual(['top bottom', 'top bottom'])
  })

  it('treats the page surface as standing before the first band and after the last', () => {
    expect(bandEdges(['inverted'])).toEqual(['top bottom'])
  })
})
