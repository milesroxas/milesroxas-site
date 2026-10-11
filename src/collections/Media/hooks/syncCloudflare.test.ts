import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utilities/cloudflare', () => ({
  deleteCloudflareImage: vi.fn(async () => {}),
  deleteStreamVideo: vi.fn(async () => {}),
  getImageDeliveryUrl: (id: string) => `https://imagedelivery.net/hash/${id}/public`,
  getStreamPlaybackUrl: (uid: string) => `https://stream/${uid}`,
  getStreamThumbnailUrl: (uid: string) => `https://stream/${uid}/thumb`,
  uploadImageToCloudflare: vi.fn(async () => ({ id: 'img-1', variants: [] })),
  uploadVideoToStream: vi.fn(async () => ({ uid: 'vid-1', playbackUrl: 'https://stream/vid-1' })),
}))

import * as cf from '@/utilities/cloudflare'
import { syncCloudflareUpload } from './syncCloudflare'

type Args = Parameters<typeof syncCloudflareUpload>[0]

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

const makeReq = () => {
  const updateOne = vi.fn(async () => ({}))
  const context: Record<string, unknown> = {}
  const req = { context, payload: { db: { updateOne }, logger } }
  return { req, updateOne, context }
}

const run = (req: unknown, doc: Record<string, unknown>, context = {}) =>
  syncCloudflareUpload({ doc, previousDoc: {}, req, context, operation: 'create' } as Args)

const image = {
  id: 1,
  filename: 'a.jpg',
  mimeType: 'image/jpeg',
  url: 'https://store.public.blob.vercel-storage.com/key/a.jpg',
}

beforeEach(() => vi.clearAllMocks())

describe('syncCloudflareUpload', () => {
  it('writes the Cloudflare fields to the row in the request transaction and onto the doc', async () => {
    const { req, updateOne } = makeReq()
    const doc = { ...image }
    const out = await run(req, doc)
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        id: 1,
        data: expect.objectContaining({ cloudflareImageId: 'img-1' }),
        req,
      }),
    )
    expect(out).toMatchObject({ cloudflareImageId: 'img-1' })
  })

  it('leaves nothing on req.context, so the next file saved on the same request syncs too', async () => {
    const { req, context } = makeReq()
    await run(req, { ...image })
    await run(req, { ...image, id: 2 })
    expect(context).toEqual({})
    expect(cf.uploadImageToCloudflare).toHaveBeenCalledTimes(2)
  })

  it("skips the storage plugin's nested metadata update", async () => {
    const { req, updateOne } = makeReq()
    await run(req, { ...image }, { skipCloudStorage: true })
    expect(updateOne).not.toHaveBeenCalled()
    expect(cf.uploadImageToCloudflare).not.toHaveBeenCalled()
  })

  it('logs a failed upload and still returns the doc', async () => {
    vi.mocked(cf.uploadImageToCloudflare).mockRejectedValueOnce(new Error('down'))
    const { req, updateOne } = makeReq()
    const out = await run(req, { ...image })
    expect(updateOne).not.toHaveBeenCalled()
    expect(out).not.toHaveProperty('cloudflareImageId')
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ msg: '[Cloudflare] Upload failed', id: 1 }),
    )
  })
})
