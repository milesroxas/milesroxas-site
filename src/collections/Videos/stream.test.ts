import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utilities/cloudflare', () => ({
  clipStreamVideo: vi.fn(async () => ({ uid: 'loop-1' })),
  deleteCloudflareImage: vi.fn(async () => {}),
  deleteStreamVideo: vi.fn(async () => {}),
  getStreamVideoStatus: vi.fn(async () => ({
    ready: true,
    duration: 90,
    width: 1920,
    height: 1080,
    error: null,
  })),
  uploadVideoToStream: vi.fn(async () => ({ uid: 'vid-1', playbackUrl: 'https://stream/vid-1' })),
}))

import * as cf from '@/utilities/cloudflare'
import { formatSeconds, loopRange, stageOf } from './stage'
import { advanceAndStore, advanceVideo, sweepVideos, writeVideoFields } from './stream'

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

const uploaded = {
  id: 1,
  title: 'Walkthrough',
  filename: 'walkthrough.mp4',
  mimeType: 'video/mp4',
  url: 'https://media.example.com/key/walkthrough.mp4',
  _objectKey: 'key',
}
const encoding = { ...uploaded, cloudflareStreamUid: 'vid-0', cloudflareStreamReady: false }
const encoded = { ...encoding, cloudflareStreamReady: true, duration: 90 }
const clipped = { ...encoded, loopUid: 'loop-0', loopReady: false }
const ready = { ...clipped, loopReady: true }

beforeEach(() => vi.clearAllMocks())

describe('loopRange', () => {
  it('cuts the default eight seconds from the start once the duration is known', () => {
    expect(loopRange(uploaded)).toBeNull()
    expect(loopRange(encoded)).toEqual({ start: 0, end: 8 })
  })

  it('loops a source no longer than the loop whole', () => {
    expect(loopRange({ ...encoded, duration: 8 })).toBeNull()
    expect(loopRange({ ...encoded, duration: 8.5 })).toEqual({ start: 0, end: 8 })
  })

  it("follows the editor's start and length, clamped to the video and the length's range", () => {
    expect(loopRange({ ...encoded, loop: { start: 30, length: 5 } })).toEqual({
      start: 30,
      end: 35,
    })
    expect(loopRange({ ...encoded, loop: { start: 88, length: 10 } })).toEqual({
      start: 80,
      end: 90,
    })
    expect(loopRange({ ...encoded, loop: { start: -3, length: 1 } })).toEqual({
      start: 0,
      end: 3,
    })
    expect(loopRange({ ...encoded, loop: { start: null, length: 60 } })).toEqual({
      start: 0,
      end: 30,
    })
  })
})

describe('stageOf', () => {
  it('reads the stage from the flags, and a recorded failure over any of them', () => {
    expect(stageOf(uploaded)).toBe('pending')
    expect(stageOf(encoding)).toBe('encoding')
    expect(stageOf(encoded)).toBe('cutting')
    expect(stageOf(clipped)).toBe('encodingLoop')
    expect(stageOf(ready)).toBe('ready')
    expect(stageOf({ ...encoding, streamError: 'bad file' })).toBe('failed')
  })
})

describe('formatSeconds', () => {
  it('reads as m:ss', () => {
    expect(formatSeconds(90)).toBe('1:30')
    expect(formatSeconds(5.4)).toBe('0:05')
    expect(formatSeconds(3600)).toBe('60:00')
  })
})

describe('advanceVideo', () => {
  it('copies a new file to Stream and stops there', async () => {
    expect(await advanceVideo(uploaded, { logger })).toEqual({
      cloudflareStreamUid: 'vid-1',
      cloudflareStreamReady: false,
      loopUid: null,
      loopReady: false,
      streamError: null,
    })
    expect(cf.uploadVideoToStream).toHaveBeenCalledWith(uploaded.url, {
      name: 'Walkthrough',
      payloadId: '1',
    })
    expect(cf.getStreamVideoStatus).not.toHaveBeenCalled()
  })

  it('warns and writes nothing when the save has no origin URL yet', async () => {
    expect(
      await advanceVideo({ ...uploaded, url: '/api/videos/file/x.mp4' }, { logger }),
    ).toBeNull()
    expect(logger.warn).toHaveBeenCalled()
    expect(cf.uploadVideoToStream).not.toHaveBeenCalled()
  })

  it('leaves a video Stream is still encoding alone, but clears an old failure', async () => {
    vi.mocked(cf.getStreamVideoStatus).mockResolvedValueOnce({
      ready: false,
      duration: null,
      width: null,
      height: null,
      error: null,
    })
    expect(await advanceVideo(encoding, { logger })).toBeNull()
    vi.mocked(cf.getStreamVideoStatus).mockResolvedValueOnce({
      ready: false,
      duration: null,
      width: null,
      height: null,
      error: null,
    })
    expect(await advanceVideo({ ...encoding, streamError: 'down' }, { logger })).toEqual({
      streamError: null,
    })
  })

  it('marks an encoded video ready with its size, and cuts the loop in the same pass', async () => {
    expect(await advanceVideo(encoding, { logger })).toEqual({
      cloudflareStreamReady: true,
      duration: 90,
      width: 1920,
      height: 1080,
      loopUid: 'loop-1',
      loopReady: false,
      streamError: null,
    })
    expect(cf.clipStreamVideo).toHaveBeenCalledWith('vid-0', 0, 8, {
      name: 'Walkthrough (loop)',
      payloadId: '1',
    })
  })

  it('lets a short video be its own loop', async () => {
    vi.mocked(cf.getStreamVideoStatus).mockResolvedValueOnce({
      ready: true,
      duration: 6,
      width: 1280,
      height: 720,
      error: null,
    })
    expect(await advanceVideo(encoding, { logger })).toMatchObject({
      cloudflareStreamReady: true,
      duration: 6,
      loopReady: true,
    })
    expect(cf.clipStreamVideo).not.toHaveBeenCalled()
  })

  it('marks the loop ready once Stream has encoded it', async () => {
    expect(await advanceVideo(clipped, { logger })).toEqual({ loopReady: true, streamError: null })
    expect(cf.getStreamVideoStatus).toHaveBeenCalledWith('loop-0')
    expect(await advanceVideo(ready, { logger })).toBeNull()
    expect(cf.getStreamVideoStatus).toHaveBeenCalledTimes(1)
  })

  it("throws Stream's reason when it gave up, for the caller to record", async () => {
    vi.mocked(cf.getStreamVideoStatus).mockResolvedValueOnce({
      ready: false,
      duration: null,
      width: null,
      height: null,
      error: 'ERR_INVALID_INPUT',
    })
    await expect(advanceVideo(encoding, { logger })).rejects.toThrow('ERR_INVALID_INPUT')
  })

  it('starts over when the file was replaced, purging the old source and loop', async () => {
    const replaced = { ...ready, _objectKey: 'new', url: 'https://media.example.com/new/w.mp4' }
    expect(await advanceVideo(replaced, { previousDoc: ready, logger })).toEqual({
      cloudflareStreamUid: 'vid-1',
      cloudflareStreamReady: false,
      duration: null,
      width: null,
      height: null,
      loopUid: null,
      loopReady: false,
      streamError: null,
    })
    expect(cf.deleteStreamVideo).toHaveBeenCalledWith('loop-0')
    expect(cf.deleteStreamVideo).toHaveBeenCalledWith('vid-0')
  })

  it('recuts when the editor moves the loop, and not when the move changes nothing', async () => {
    const moved = { ...ready, loop: { start: 20, length: 6 } }
    expect(await advanceVideo(moved, { previousDoc: ready, logger })).toEqual({
      loopUid: 'loop-1',
      loopReady: false,
      streamError: null,
    })
    expect(cf.deleteStreamVideo).toHaveBeenCalledWith('loop-0')
    expect(cf.clipStreamVideo).toHaveBeenCalledWith('vid-0', 20, 26, expect.any(Object))

    vi.clearAllMocks()
    const same = { ...ready, loop: { start: 0, length: 8 } }
    expect(await advanceVideo(same, { previousDoc: ready, logger })).toBeNull()
    expect(cf.deleteStreamVideo).not.toHaveBeenCalled()
  })
})

const fakePayload = (docs: Record<string, unknown>[] = []) => {
  const updateOne = vi.fn(async () => ({}))
  const find = vi.fn(async () => ({ docs }))
  return { payload: { db: { updateOne }, find, logger } as never, updateOne, find }
}

describe('writeVideoFields', () => {
  it("writes the row directly, in the caller's transaction, with no hook in the loop", async () => {
    const { payload, updateOne } = fakePayload()
    const req = { transactionID: 7 } as never
    await writeVideoFields(payload, 1, { loopReady: true }, req)
    expect(updateOne).toHaveBeenCalledWith({
      collection: 'videos',
      id: 1,
      data: { loopReady: true },
      req,
      returning: false,
    })
  })
})

describe('advanceAndStore', () => {
  it('stores what the pass learned and answers the document as it stands', async () => {
    const { payload, updateOne } = fakePayload()
    const next = await advanceAndStore(payload, clipped, { logger })
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: { loopReady: true, streamError: null } }),
    )
    expect(stageOf(next)).toBe('ready')
  })

  it('records a failure on the row instead of throwing', async () => {
    vi.mocked(cf.clipStreamVideo).mockRejectedValueOnce(new Error('clip refused'))
    const { payload, updateOne } = fakePayload()
    const next = await advanceAndStore(payload, encoded, { logger })
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ data: { streamError: 'clip refused' } }),
    )
    expect(stageOf(next)).toBe('failed')
    expect(logger.error).toHaveBeenCalled()
  })
})

describe('sweepVideos', () => {
  it('takes every unfinished video a step and counts what moved', async () => {
    vi.mocked(cf.getStreamVideoStatus)
      .mockResolvedValueOnce({ ready: true, duration: 90, width: 1, height: 1, error: null })
      .mockResolvedValueOnce({
        ready: false,
        duration: null,
        width: null,
        height: null,
        error: null,
      })
      .mockRejectedValueOnce(new Error('x'))
    const { payload, find } = fakePayload([encoding, { ...clipped, id: 2 }, { ...clipped, id: 3 }])
    expect(await sweepVideos(payload)).toEqual({ advanced: 1, failed: 1 })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'videos', where: { loopReady: { not_equals: true } } }),
    )
  })

  it('asks nothing on a dry run', async () => {
    const { payload, updateOne } = fakePayload([encoding])
    expect(await sweepVideos(payload, { dryRun: true })).toEqual({ advanced: 0, failed: 0 })
    expect(updateOne).not.toHaveBeenCalled()
    expect(cf.getStreamVideoStatus).not.toHaveBeenCalled()
  })
})
