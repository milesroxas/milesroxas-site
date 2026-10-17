import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utilities/cloudflare', () => ({
  deleteCloudflareImage: vi.fn(async () => {}),
  deleteStreamVideo: vi.fn(async () => {}),
  getImageDeliveryUrl: (id: string) => `https://imagedelivery.net/hash/${id}/public`,
  getStreamVideoStatus: vi.fn(async () => ({ ready: true })),
  uploadImageToCloudflare: vi.fn(async () => ({ id: 'img-1', variants: [] })),
  uploadVideoToStream: vi.fn(async () => ({ uid: 'vid-1', playbackUrl: 'https://stream/vid-1' })),
}))

import * as cf from '@/utilities/cloudflare'
import {
  hasStaleAssets,
  isSynced,
  originUrl,
  sweepMedia,
  syncKind,
  syncMediaToCloudflare,
  writeCloudflareFields,
} from './cloudflare'

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

const image = {
  id: 1,
  filename: 'a.jpg',
  mimeType: 'image/jpeg',
  url: 'https://media.example.com/key/a.jpg',
  _objectKey: 'key',
}

beforeEach(() => vi.clearAllMocks())

describe('syncKind', () => {
  it('routes by MIME family', () => {
    expect(syncKind('image/webp')).toBe('image')
    expect(syncKind('video/mp4')).toBe('video')
    expect(syncKind('application/pdf')).toBeNull()
    expect(syncKind(undefined)).toBeNull()
  })
})

describe('originUrl', () => {
  it('accepts only an absolute URL', () => {
    expect(originUrl({ id: 1, url: '/api/media/file/a.jpg' })).toBeNull()
    expect(originUrl(image)).toBe(image.url)
  })
})

describe('isSynced', () => {
  it('needs the asset of its kind', () => {
    expect(isSynced(image)).toBe(false)
    expect(isSynced({ ...image, cloudflareImageId: 'x' })).toBe(true)
    expect(isSynced({ id: 2, mimeType: 'video/mp4', cloudflareImageId: 'x' })).toBe(false)
    expect(isSynced({ id: 3, mimeType: 'application/pdf' })).toBe(true)
  })
})

describe('hasStaleAssets', () => {
  const synced = { ...image, cloudflareImageId: 'img-0' }
  it('is false without a previous file or without assets', () => {
    expect(hasStaleAssets(synced, undefined)).toBe(false)
    expect(hasStaleAssets(image, { ...image, filename: 'b.jpg' })).toBe(false)
  })
  it('sees a new filename or a new object folder', () => {
    expect(hasStaleAssets(synced, { ...image, filename: 'b.jpg' })).toBe(true)
    expect(hasStaleAssets(synced, { ...image, _objectKey: 'old' })).toBe(true)
    expect(hasStaleAssets(synced, image)).toBe(false)
  })
})

describe('syncMediaToCloudflare', () => {
  it('ignores files Cloudflare has no product for', async () => {
    expect(
      await syncMediaToCloudflare({ id: 9, mimeType: 'application/pdf' }, undefined, logger),
    ).toBeNull()
    expect(cf.uploadImageToCloudflare).not.toHaveBeenCalled()
  })

  it('uploads a new image from its Blob URL and answers every field', async () => {
    const fields = await syncMediaToCloudflare(image, undefined, logger)
    expect(cf.uploadImageToCloudflare).toHaveBeenCalledWith(image.url, {
      payloadId: '1',
      filename: 'a.jpg',
    })
    expect(fields).toEqual({
      cloudflareImageId: 'img-1',
      cloudflareImageUrl: 'https://imagedelivery.net/hash/img-1/public',
      cloudflareStreamUid: null,
      cloudflareStreamPlaybackUrl: null,
      cloudflareStreamReady: false,
    })
  })

  it('uploads a video to Stream, not yet ready', async () => {
    const video = {
      id: 2,
      filename: 'v.mp4',
      mimeType: 'video/mp4',
      url: 'https://media.example.com/v.mp4',
    }
    const fields = await syncMediaToCloudflare(video, undefined, logger)
    expect(fields).toMatchObject({ cloudflareStreamUid: 'vid-1', cloudflareStreamReady: false })
    expect(cf.uploadImageToCloudflare).not.toHaveBeenCalled()
  })

  it('writes nothing when the asset already exists', async () => {
    expect(
      await syncMediaToCloudflare({ ...image, cloudflareImageId: 'x' }, undefined, logger),
    ).toBeNull()
  })

  it('purges the old asset and uploads the replacement in one pass', async () => {
    const previous = { ...image, _objectKey: 'old', cloudflareImageId: 'img-0' }
    const fields = await syncMediaToCloudflare(
      { ...image, cloudflareImageId: 'img-0' },
      previous,
      logger,
    )
    expect(cf.deleteCloudflareImage).toHaveBeenCalledWith('img-0')
    expect(fields).toMatchObject({ cloudflareImageId: 'img-1' })
  })

  it('warns and skips when the save has no Blob URL yet', async () => {
    expect(
      await syncMediaToCloudflare({ ...image, url: '/api/media/file/a.jpg' }, undefined, logger),
    ).toBeNull()
    expect(logger.warn).toHaveBeenCalled()
    expect(cf.uploadImageToCloudflare).not.toHaveBeenCalled()
  })

  it('lets an upload failure through to the caller', async () => {
    vi.mocked(cf.uploadImageToCloudflare).mockRejectedValueOnce(new Error('down'))
    await expect(syncMediaToCloudflare(image, undefined, logger)).rejects.toThrow('down')
  })
})

describe('writeCloudflareFields', () => {
  it("writes the row directly, in the caller's transaction, with no hook in the loop", async () => {
    const updateOne = vi.fn(async () => ({}))
    const payload = { db: { updateOne } } as unknown as Parameters<typeof writeCloudflareFields>[0]
    const req = { transactionID: 7 } as unknown as Parameters<typeof writeCloudflareFields>[3]
    await writeCloudflareFields(payload, 1, { cloudflareStreamReady: true }, req)
    expect(updateOne).toHaveBeenCalledWith({
      collection: 'media',
      id: 1,
      data: { cloudflareStreamReady: true },
      req,
      returning: false,
    })
  })
})

describe('sweepMedia', () => {
  const video = { id: 2, filename: 'v.mp4', mimeType: 'video/mp4', cloudflareStreamUid: 'vid-0' }
  const fakePayload = (unsynced: object[], unready: object[]) => {
    const updateOne = vi.fn(async () => ({}))
    const find = vi.fn(async ({ where }: { where: { or?: unknown; and?: unknown } }) => ({
      docs: where.or ? unsynced : unready,
    }))
    return { payload: { db: { updateOne }, find, logger } as never, updateOne }
  }

  it('syncs the unsynced, marks the encoded videos ready, and counts failures', async () => {
    const { payload, updateOne } = fakePayload([image], [video, { ...video, id: 3 }])
    vi.mocked(cf.getStreamVideoStatus)
      .mockResolvedValueOnce({ ready: true } as never)
      .mockRejectedValueOnce(new Error('x'))
    const result = await sweepMedia(payload)
    expect(result).toEqual({ failed: 1, ready: 1, synced: 1 })
    expect(updateOne).toHaveBeenCalledTimes(2)
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        data: expect.objectContaining({ cloudflareImageId: 'img-1' }),
      }),
    )
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, data: { cloudflareStreamReady: true } }),
    )
  })

  it('leaves a video Stream is still encoding alone', async () => {
    const { payload, updateOne } = fakePayload([], [video])
    vi.mocked(cf.getStreamVideoStatus).mockResolvedValueOnce({ ready: false } as never)
    expect(await sweepMedia(payload)).toEqual({ failed: 0, ready: 0, synced: 0 })
    expect(updateOne).not.toHaveBeenCalled()
  })

  it('writes nothing on a dry run', async () => {
    const { payload, updateOne } = fakePayload([image], [video])
    await sweepMedia(payload, { dryRun: true })
    expect(updateOne).not.toHaveBeenCalled()
    expect(cf.uploadImageToCloudflare).not.toHaveBeenCalled()
    expect(cf.getStreamVideoStatus).not.toHaveBeenCalled()
  })
})
