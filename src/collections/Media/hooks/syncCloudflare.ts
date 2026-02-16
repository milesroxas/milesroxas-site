import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const syncCloudflareUpload: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  // Skip if this update was triggered by the hook itself
  if (context?.skipCloudflareSync) return doc

  const mimeType = doc.mimeType as string | undefined
  if (!mimeType) return doc

  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')

  if (!isImage && !isVideo) return doc

  // Lazily import to keep this server-only and avoid circular deps
  const { uploadImageToCloudflare, uploadVideoToStream, getImageDeliveryUrl } = await import(
    '../../../utilities/cloudflare'
  )

  try {
    if (isImage && !doc.cloudflareImageId) {
      const imageUrl = doc.url as string
      if (!imageUrl) return doc

      const result = await uploadImageToCloudflare(imageUrl, {
        payloadId: String(doc.id),
        filename: doc.filename ?? '',
      })

      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          cloudflareImageId: result.id,
          cloudflareImageUrl: getImageDeliveryUrl(result.id),
        },
        context: { skipCloudflareSync: true },
      })

      doc.cloudflareImageId = result.id
      doc.cloudflareImageUrl = getImageDeliveryUrl(result.id)
    }

    if (isVideo && !doc.cloudflareStreamUid) {
      const videoUrl = doc.url as string
      if (!videoUrl) return doc

      const result = await uploadVideoToStream(videoUrl, {
        payloadId: String(doc.id),
        filename: doc.filename ?? '',
      })

      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          cloudflareStreamUid: result.uid,
          cloudflareStreamPlaybackUrl: result.playbackUrl,
          cloudflareStreamReady: false,
        },
        context: { skipCloudflareSync: true },
      })

      doc.cloudflareStreamUid = result.uid
      doc.cloudflareStreamPlaybackUrl = result.playbackUrl
      doc.cloudflareStreamReady = false
    }
  } catch (error) {
    console.error('[Cloudflare] Upload failed:', error)
    // Don't throw — the file is still on Vercel Blob as fallback
  }

  return doc
}

export const syncCloudflareDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  const { deleteCloudflareImage, deleteStreamVideo } = await import('../../../utilities/cloudflare')

  try {
    if (doc.cloudflareImageId) {
      await deleteCloudflareImage(doc.cloudflareImageId as string)
    }
    if (doc.cloudflareStreamUid) {
      await deleteStreamVideo(doc.cloudflareStreamUid as string)
    }
  } catch (error) {
    console.error('[Cloudflare] Delete failed:', error)
  }
}
