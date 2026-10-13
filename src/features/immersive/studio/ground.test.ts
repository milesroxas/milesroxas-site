import { describe, expect, it } from 'vitest'
import { STUDIO_GROUND } from './effect'
import { groundAttributes, hasGround, lookGround, sameGround, studioGround } from './ground'

describe('a look ground', () => {
  it('keeps a valid face, lowercased, and drops the rest', () => {
    expect(lookGround({ dark: '#0A0A0A', light: 'white' })).toEqual({ dark: '#0a0a0a' })
    expect(lookGround({ dark: '', light: null })).toEqual({})
    expect(lookGround({ dark: '#abc' })).toEqual({})
    expect(lookGround(null)).toEqual({})
    expect(lookGround('#0a0a0a')).toEqual({})
  })

  it('falls back to the site background per face', () => {
    expect(studioGround({ dark: '#0a0a0a' }, 'dark')).toBe('#0a0a0a')
    expect(studioGround({ dark: '#0a0a0a' }, 'light')).toBe(STUDIO_GROUND.light)
    expect(studioGround(undefined, 'dark')).toBe(STUDIO_GROUND.dark)
  })

  it('compares face by face, with an absent face equal to an empty one', () => {
    expect(sameGround({}, undefined)).toBe(true)
    expect(sameGround({ dark: '#0a0a0a' }, { dark: '#0a0a0a' })).toBe(true)
    expect(sameGround({ dark: '#0a0a0a' }, { dark: '#0a0a0a', light: '#ffffff' })).toBe(false)
    expect(hasGround({})).toBe(false)
    expect(hasGround({ light: '#ffffff' })).toBe(true)
  })

  it('marks a frame only when the look sets a face, carrying each set face as a custom property', () => {
    expect(groundAttributes({})).toEqual({})
    expect(groundAttributes(undefined)).toEqual({})
    expect(groundAttributes({ light: '#ffffff' })).toEqual({
      'data-visual-ground': '',
      style: { '--visual-ground-light': '#ffffff', '--visual-ground-dark': undefined },
    })
  })
})
