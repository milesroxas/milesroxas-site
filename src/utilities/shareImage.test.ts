import { describe, expect, it } from 'vitest'
import type { Media } from '@/payload-types'
import { shareImage } from './shareImage'

const media = (overrides: Partial<Media>): Media =>
  ({
    id: 1,
    updatedAt: '',
    createdAt: '',
    url: 'https://files.example.com/photo.jpg',
    width: 2400,
    height: 1600,
    alt: 'A photo',
    ...overrides,
  }) as Media

describe('shareImage', () => {
  it('asks Cloudflare for the share width and scales the stored size to match', () => {
    const image = shareImage(
      media({ cloudflareImageUrl: 'https://imagedelivery.net/hash/id/public' }),
    )
    expect(image).toEqual({
      url: 'https://imagedelivery.net/hash/id/w=1200,q=85,f=auto',
      width: 1200,
      height: 800,
      alt: 'A photo',
    })
  })

  it('serves a stored file as it is, at its own size', () => {
    expect(shareImage(media({}))).toEqual({
      url: 'https://files.example.com/photo.jpg',
      width: 2400,
      height: 1600,
      alt: 'A photo',
    })
  })

  it('is nothing for an empty field, a bare id, or an upload with no file', () => {
    expect(shareImage(null)).toBeNull()
    expect(shareImage(7)).toBeNull()
    expect(shareImage(media({ url: null }))).toBeNull()
  })
})
