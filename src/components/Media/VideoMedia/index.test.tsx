import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { videoFixture } from '@/stories/fixtures'
import { bandwidthHintFor, hlsConfigFor, VideoMedia, warmVideo } from './index'

type Listener = () => void

const instances: FakeHls[] = []

class FakeHls {
  static isSupported = () => true
  static Events = { MANIFEST_PARSED: 'hlsManifestParsed' }
  config: Record<string, unknown>
  listeners = new Map<string, Listener>()
  startLoad = vi.fn()
  loadSource = vi.fn()
  attachMedia = vi.fn()
  destroy = vi.fn()
  constructor(config: Record<string, unknown>) {
    this.config = config
    instances.push(this)
  }
  on(event: string, listener: Listener) {
    this.listeners.set(event, listener)
  }
  parseManifest() {
    this.listeners.get(FakeHls.Events.MANIFEST_PARSED)?.()
  }
}

vi.mock('hls.js', () => ({ default: FakeHls }))

const readyVideo = {
  ...videoFixture,
  cloudflareStreamUid: 'abc',
  cloudflareStreamPlaybackUrl: 'https://customer-x.cloudflarestream.com/abc/manifest/video.m3u8',
  cloudflareStreamReady: true,
}

/** jsdom's media element has no playback: `play()` only announces itself, as a browser's does. */
const play = vi.fn(function (this: HTMLMediaElement) {
  this.dispatchEvent(new Event('play'))
  return Promise.resolve()
})
const pause = vi.fn(function (this: HTMLMediaElement) {
  this.dispatchEvent(new Event('pause'))
})
const load = vi.fn()

const renderReady = async () => {
  const { container } = render(<VideoMedia autoPlay={false} resource={readyVideo} />)
  const video = container.querySelector('video') as HTMLVideoElement
  await vi.waitFor(() => expect(instances).toHaveLength(1))
  return { video, hls: instances[0] as FakeHls }
}

beforeEach(() => {
  instances.length = 0
  play.mockClear()
  pause.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: play })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pause })
  load.mockClear()
  Object.defineProperty(HTMLMediaElement.prototype, 'load', { configurable: true, value: load })
})

afterEach(cleanup)

describe('VideoMedia over Cloudflare Stream', () => {
  it('a play() that lands before the manifest is honoured once it parses', async () => {
    const { video, hls } = await renderReady()
    expect(hls.loadSource).toHaveBeenCalledWith(readyVideo.cloudflareStreamPlaybackUrl)
    expect(hls.config.autoStartLoad).toBe(false)

    // The carousel settles on this slide before hls.js has attached.
    video.play()
    expect(hls.startLoad).not.toHaveBeenCalled()

    hls.parseManifest()
    expect(hls.startLoad).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(2)
  })

  it('a slide paused again before the manifest stays paused and loads nothing', async () => {
    const { video, hls } = await renderReady()
    video.play()
    video.pause()
    hls.parseManifest()
    expect(hls.startLoad).not.toHaveBeenCalled()
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('a play() after the manifest starts loading once', async () => {
    const { video, hls } = await renderReady()
    hls.parseManifest()
    expect(hls.startLoad).not.toHaveBeenCalled()
    video.play()
    video.play()
    expect(hls.startLoad).toHaveBeenCalledTimes(1)
  })

  it('a warm before the manifest starts the load once it parses, without playing', async () => {
    const { video, hls } = await renderReady()
    warmVideo(video)
    expect(hls.startLoad).not.toHaveBeenCalled()
    hls.parseManifest()
    expect(hls.startLoad).toHaveBeenCalledTimes(1)
    expect(play).not.toHaveBeenCalled()
    expect(load).not.toHaveBeenCalled()
  })

  it('a warm after the manifest starts the load once', async () => {
    const { video, hls } = await renderReady()
    hls.parseManifest()
    warmVideo(video)
    warmVideo(video)
    expect(hls.startLoad).toHaveBeenCalledTimes(1)
    expect(play).not.toHaveBeenCalled()
  })

  it('renders no mp4 source once Stream is ready, and the mp4 before', () => {
    const ready = render(<VideoMedia autoPlay={false} resource={readyVideo} />)
    expect(ready.container.querySelector('source')).toBeNull()
    ready.unmount()
    const raw = render(<VideoMedia autoPlay={false} resource={videoFixture} />)
    expect(raw.container.querySelector('source')?.getAttribute('src')).toContain('flower.mp4')
  })
})

describe('VideoMedia on the native player', () => {
  it("a warm raises preload and asks an untouched element to load (Safari's HLS)", async () => {
    const canPlayType = HTMLMediaElement.prototype.canPlayType
    Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
      configurable: true,
      value: () => 'maybe',
    })
    try {
      const { container } = render(<VideoMedia autoPlay={false} resource={readyVideo} />)
      const video = container.querySelector('video') as HTMLVideoElement
      await vi.waitFor(() => expect(video.getAttribute('src')).toContain('clientBandwidthHint'))
      expect(instances).toHaveLength(0)
      expect(video.preload).toBe('none')
      warmVideo(video)
      expect(video.preload).toBe('auto')
      expect(load).toHaveBeenCalledTimes(1)
      expect(play).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
        configurable: true,
        value: canPlayType,
      })
    }
  })

  it('a warm loads a plain mp4 the same way', () => {
    const { container } = render(<VideoMedia autoPlay={false} resource={videoFixture} />)
    const video = container.querySelector('video') as HTMLVideoElement
    warmVideo(video)
    expect(video.preload).toBe('auto')
    expect(load).toHaveBeenCalledTimes(1)
  })
})

describe('rendition choice', () => {
  it('hls.js starts from a fast-line estimate capped to the frame', () => {
    expect(hlsConfigFor(false)).toMatchObject({
      abrEwmaDefaultEstimate: 6_000_000,
      capLevelToPlayerSize: true,
      autoStartLoad: false,
    })
    expect(hlsConfigFor(true).autoStartLoad).toBe(true)
  })

  it("Safari's hint follows the rendered width in device pixels", () => {
    const video = document.createElement('video')
    const widthOf = (px: number) =>
      Object.defineProperty(video, 'clientWidth', { configurable: true, value: px })
    window.devicePixelRatio = 2
    widthOf(360)
    expect(bandwidthHintFor(video)).toBe(1.5)
    widthOf(640)
    expect(bandwidthHintFor(video)).toBe(3)
    widthOf(960)
    expect(bandwidthHintFor(video)).toBe(6)
  })
})
