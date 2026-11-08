import { describe, expect, it } from 'vitest'
import {
  MAX_VIDEO_BYTES,
  paragraph,
  parseSignRequest,
  parseVideoData,
  videoCollectionOf,
} from './agentMedia.shared'

const status = (run: () => unknown): number | undefined => {
  try {
    run()
  } catch (error) {
    return (error as { status?: number }).status
  }
  return undefined
}

describe('videoCollectionOf', () => {
  it('names the two homes a video has and nothing else', () => {
    expect(videoCollectionOf('videos')).toBe('videos')
    expect(videoCollectionOf('media')).toBe('media')
    expect(videoCollectionOf('pages')).toBeNull()
    expect(videoCollectionOf(undefined)).toBeNull()
  })
})

describe('parseSignRequest', () => {
  const body = { filename: 'walkthrough.mp4', filesize: 1024, mimeType: 'video/mp4' }

  it('takes the collection from the route, never the body', () => {
    expect(parseSignRequest({ ...body, collectionSlug: 'pages' }, 'videos')).toEqual({
      collectionSlug: 'videos',
      filename: 'walkthrough.mp4',
      filesize: 1024,
      mimeType: 'video/mp4',
    })
  })

  it('refuses an image type: images have their own road', () => {
    expect(status(() => parseSignRequest({ ...body, mimeType: 'image/png' }, 'media'))).toBe(415)
  })

  it('refuses a file over the ceiling before anything is signed', () => {
    expect(
      status(() => parseSignRequest({ ...body, filesize: MAX_VIDEO_BYTES + 1 }, 'videos')),
    ).toBe(413)
  })

  it('needs a filename and a whole number of bytes', () => {
    expect(status(() => parseSignRequest({ ...body, filename: ' ' }, 'videos'))).toBe(400)
    expect(status(() => parseSignRequest({ ...body, filesize: '1024' }, 'videos'))).toBe(400)
    expect(status(() => parseSignRequest(null, 'videos'))).toBe(400)
  })
})

describe('parseVideoData', () => {
  it('keeps only the title and the loop bounds, and sends nothing it was not given', () => {
    expect(parseVideoData({})).toEqual({})
    expect(parseVideoData({ title: ' Walkthrough ', loop: { start: 4, length: 10 } })).toEqual({
      title: 'Walkthrough',
      loop: { start: 4, length: 10 },
    })
    expect(parseVideoData({ loop: { start: '2' } })).toEqual({ loop: { start: 2 } })
  })

  it('holds the loop to what the admin allows', () => {
    expect(status(() => parseVideoData({ loop: { length: 1 } }))).toBe(400)
    expect(status(() => parseVideoData({ loop: { length: 31 } }))).toBe(400)
    expect(status(() => parseVideoData({ loop: { start: -1 } }))).toBe(400)
  })

  it('points alt text at the loop collection', () => {
    expect(status(() => parseVideoData({ alt: 'A screen recording' }))).toBe(400)
  })
})

describe('paragraph', () => {
  it('is one plain paragraph of Lexical rich text', () => {
    const caption = paragraph('Hello')
    expect(caption.root.children).toHaveLength(1)
    expect(caption.root.children[0]?.children[0]?.text).toBe('Hello')
  })
})
