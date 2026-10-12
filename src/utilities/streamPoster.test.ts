import { describe, expect, it } from 'vitest'
import { streamPosterSrcSet, streamPosterUrl } from './streamPoster'

const base = 'https://customer-x.cloudflarestream.com/abc/thumbnails/thumbnail.jpg'

describe('stream posters', () => {
  it('asks Stream for the width and keeps the frame whole', () => {
    expect(streamPosterUrl(base, 1920)).toBe(`${base}?width=1920&fit=clip`)
  })

  it('offers one candidate per width', () => {
    expect(streamPosterSrcSet(base)).toBe(
      `${base}?width=640&fit=clip 640w, ${base}?width=1280&fit=clip 1280w, ${base}?width=1920&fit=clip 1920w`,
    )
  })
})
