import { afterEach, describe, expect, it } from 'vitest'
import { r2FileUrl, r2PublicBase } from './r2'

const env = process.env

afterEach(() => {
  process.env = env
})

describe('r2FileUrl', () => {
  it('joins the folder and the filename under the public base, segment by segment', () => {
    process.env = { ...env, R2_PUBLIC_URL: 'https://media.example.com/' }
    expect(r2FileUrl({ filename: 'a b.jpg', prefix: 'works/6b0e-f999' })).toBe(
      'https://media.example.com/works/6b0e-f999/a%20b.jpg',
    )
    expect(r2FileUrl({ filename: 'a.jpg' })).toBe('https://media.example.com/a.jpg')
  })

  it('answers the proxied file route when no public base is set, and never throws', () => {
    process.env = { ...env, R2_PUBLIC_URL: '' }
    expect(r2FileUrl({ filename: 'a b.jpg', prefix: 'key' })).toBe('/api/media/file/a%20b.jpg')
    expect(() => r2PublicBase()).toThrow('R2_PUBLIC_URL')
  })
})
