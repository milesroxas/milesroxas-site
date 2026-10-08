import { describe, expect, it } from 'vitest'
import { cloudflareImageLoader, isCloudflareImageUrl } from './cloudflareImageLoader'

const cf = 'https://imagedelivery.net/hash_1/abc-123/public'

describe('isCloudflareImageUrl', () => {
  it('matches delivery URLs only', () => {
    expect(isCloudflareImageUrl(cf)).toBe(true)
    expect(isCloudflareImageUrl('https://store.public.blob.vercel-storage.com/a.jpg')).toBe(false)
    expect(isCloudflareImageUrl('/images/streak-field/a.webp')).toBe(false)
  })
})

describe('cloudflareImageLoader', () => {
  it('replaces the variant with a flexible one', () => {
    expect(cloudflareImageLoader({ src: cf, width: 640, quality: 75 })).toBe(
      'https://imagedelivery.net/hash_1/abc-123/w=640,q=75,f=auto',
    )
  })
  it('defaults the quality and leaves other URLs alone', () => {
    expect(cloudflareImageLoader({ src: cf, width: 320 })).toMatch(/w=320,q=85,f=auto$/)
    expect(cloudflareImageLoader({ src: '/a.png', width: 320 })).toBe('/a.png')
  })
})
