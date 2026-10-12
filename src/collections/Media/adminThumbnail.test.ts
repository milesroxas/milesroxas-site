import { afterEach, describe, expect, it } from 'vitest'
import { adminThumbnail } from './adminThumbnail'

const env = process.env
afterEach(() => {
  process.env = env
})

describe('adminThumbnail', () => {
  it('uses the Cloudflare image at 300 wide', () => {
    expect(
      adminThumbnail({ doc: { cloudflareImageUrl: 'https://imagedelivery.net/h/id/public' } }),
    ).toBe('https://imagedelivery.net/h/id/w=300,q=85,f=auto')
  })

  it('uses a Stream frame for a video', () => {
    process.env = { ...env, CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: 'x' }
    expect(adminThumbnail({ doc: { cloudflareStreamUid: 'abc' } })).toBe(
      'https://customer-x.cloudflarestream.com/abc/thumbnails/thumbnail.jpg?width=300&fit=clip',
    )
  })

  it('falls back to the size file beside the original', () => {
    expect(
      adminThumbnail({
        doc: {
          url: 'https://media.example.com/key/a%20b.jpg',
          sizes: { thumbnail: { filename: 'a b-300x200.jpg' } },
        },
      }),
    ).toBe('https://media.example.com/key/a%20b-300x200.jpg')
  })

  it('paints nothing for a file with no usable source', () => {
    expect(adminThumbnail({ doc: { url: '/api/media/file/a.pdf' } })).toBeNull()
  })
})
