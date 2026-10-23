import { describe, expect, it } from 'vitest'
import { streamPosterLoader, streamPosterUrl } from './streamPoster'

const base = 'https://customer-x.cloudflarestream.com/abc/thumbnails/thumbnail.jpg'

describe('stream posters', () => {
  it('asks Stream for the width and keeps the frame whole', () => {
    expect(streamPosterUrl(base, 1920)).toBe(`${base}?width=1920&fit=clip`)
  })

  it('renders the width next/image asks for', () => {
    expect(streamPosterLoader({ src: base, width: 1280, quality: 75 })).toBe(
      `${base}?width=1280&fit=clip`,
    )
  })
})
