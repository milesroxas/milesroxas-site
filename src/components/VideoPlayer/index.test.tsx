import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { encodingVideoFixture, videoDocFixture } from '@/stories/fixtures'
import { loopSource, VideoPlayer } from './index'

class FakeHls {
  static isSupported = () => true
  static Events = { MANIFEST_PARSED: 'hlsManifestParsed' }
  on = vi.fn()
  startLoad = vi.fn()
  loadSource = vi.fn()
  attachMedia = vi.fn()
  destroy = vi.fn()
}
vi.mock('hls.js', () => ({ default: FakeHls }))

beforeEach(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: () => Promise.resolve(),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'load', { configurable: true, value: () => {} })
})
afterEach(cleanup)

describe('loopSource', () => {
  it('plays the clip once ready, with its own first frame, and nothing before', () => {
    expect(loopSource(videoDocFixture)).toMatchObject({
      cloudflareStreamPlaybackUrl: videoDocFixture.loopPlaybackUrl,
      cloudflareStreamThumbnailUrl: videoDocFixture.loopThumbnailUrl,
      cloudflareStreamReady: true,
    })
    expect(loopSource(encodingVideoFixture)).toBeNull()
  })

  it('loops a short video whole', () => {
    const short = { ...videoDocFixture, duration: 6, loopUid: null, loopPlaybackUrl: null }
    expect(loopSource(short)?.cloudflareStreamPlaybackUrl).toBe(
      videoDocFixture.cloudflareStreamPlaybackUrl,
    )
  })
})

describe('VideoPlayer', () => {
  it('loops muted under a play button that names the video, with its length', () => {
    const { container } = render(<VideoPlayer video={videoDocFixture} />)
    const button = screen.getByRole('button', { name: 'Play Content page scroll' })
    expect(button.textContent).toContain('1:30')
    expect(button.dataset.cursor).toBe('play')
    const video = container.querySelector('video') as HTMLVideoElement
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.controls).toBe(false)
    expect(button.style.aspectRatio).toBe('1920 / 1080')
  })

  it('swaps in the whole video with sound and controls on click, and the loop returns when it ends', () => {
    const { container } = render(<VideoPlayer video={videoDocFixture} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('button')).toBeNull()
    const video = container.querySelector('video') as HTMLVideoElement
    expect(video.controls).toBe(true)
    expect(video.muted).toBe(false)
    expect(video.loop).toBe(false)
    fireEvent.ended(video)
    expect(screen.getByRole('button', { name: 'Play Content page scroll' })).toBeTruthy()
  })

  it('shows the poster alone while Stream is still encoding', () => {
    const { container } = render(<VideoPlayer video={encodingVideoFixture} />)
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('img')?.getAttribute('src')).toContain('thumbnail.jpg')
    expect(screen.getByRole('button').textContent).not.toContain(':')
  })
})
