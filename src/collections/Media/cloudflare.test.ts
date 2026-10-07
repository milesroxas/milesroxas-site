import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utilities/cloudflare', () => ({
  deleteCloudflareImage: vi.fn(async () => {}),
  deleteStreamVideo: vi.fn(async () => {}),
  getImageDeliveryUrl: (id: string) => `https://imagedelivery.net/hash/${id}/public`,
  uploadImageToCloudflare: vi.fn(async () => ({ id: 'img-1', variants: [] })),
  uploadVideoToStream: vi.fn(async () => ({ uid: 'vid-1', playbackUrl: 'https://stream/vid-1' })),
}))

import * as cf from '@/utilities/cloudflare'
import { blobUrl, hasStaleAssets, isSynced, syncKind, syncMediaToCloudflare } from './cloudflare'

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

const image = {
  id: 1,
  filename: 'a.jpg',
  mimeType: 'image/jpeg',
  url: 'https://store.public.blob.vercel-storage.com/key/a.jpg',
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

describe('blobUrl', () => {
  it('accepts only an absolute URL', () => {
    expect(blobUrl({ id: 1, url: '/api/media/file/a.jpg' })).toBeNull()
    expect(blobUrl(image)).toBe(image.url)
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
    const video = { id: 2, filename: 'v.mp4', mimeType: 'video/mp4', url: 'https://blob/v.mp4' }
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
