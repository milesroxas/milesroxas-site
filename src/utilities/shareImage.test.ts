import { describe, expect, it } from 'vitest'
import { STREAK_FIELD_EFFECT } from '@/features/immersive/studio/effects'
import { emptyRecipe, snapshotRecipe } from '@/features/immersive/studio/recipe'
import type { Media } from '@/payload-types'
import { documentShareImage, shareImage } from './shareImage'

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

describe('documentShareImage', () => {
  const still = {
    filename: 'still.webp',
    url: 'https://files.example.com/still.webp',
    mimeType: 'image/webp',
    width: 1200,
    height: 630,
    updatedAt: '',
  }
  const poster = { ...still, width: 1600, height: 900 }
  const look = {
    id: 3,
    sourceHash: 'a'.repeat(64),
    snapshot: snapshotRecipe(STREAK_FIELD_EFFECT, emptyRecipe(STREAK_FIELD_EFFECT)),
    posters: { dark: poster, light: poster },
  }
  const hero = (studio: unknown, media: unknown = null) => ({
    media,
    visualType: 'streakField',
    shader: { studio, preset: 'signal-v1' },
  })

  it('takes the SEO image first, then the hero upload', () => {
    expect(
      documentShareImage({ meta: { image: media({}) }, hero: hero(null, media({ url: 'x' })) })
        ?.url,
    ).toBe('https://files.example.com/photo.jpg')
    expect(
      documentShareImage({
        meta: {},
        hero: hero(null, media({ url: 'https://files.example.com/hero.jpg' })),
      })?.url,
    ).toBe('https://files.example.com/hero.jpg')
  })

  it('shares the preview still of the look grounding the hero, and nothing without one', () => {
    const withStill = hero({ ...look, stills: { preview: still } })
    expect(documentShareImage({ hero: withStill })).toEqual({
      url: still.url,
      width: 1200,
      height: 630,
    })
    expect(documentShareImage({ hero: hero({ ...look }) })).toBeNull()
    expect(documentShareImage({ hero: hero(5) })).toBeNull()
    expect(documentShareImage(null)).toBeNull()
  })
})
