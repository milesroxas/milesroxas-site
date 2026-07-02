import crypto from 'node:crypto'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

// Reject webhooks whose signature timestamp is older than this (replay protection)
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60

/**
 * Verify the Cloudflare Stream webhook signature.
 * See: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
 */
function verifyWebhookSignature(body: string, signatureHeader: string, secret: string): boolean {
  // Header format: time=<unix_time>,sig1=<signature>
  const parts = signatureHeader.split(',')
  const timePart = parts.find((p) => p.startsWith('time='))
  const sigPart = parts.find((p) => p.startsWith('sig1='))

  if (!timePart || !sigPart) return false

  const time = timePart.replace('time=', '')
  const signature = sigPart.replace('sig1=', '')

  const timestamp = Number(time)
  if (!Number.isFinite(timestamp)) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false

  // Build source string: time.body
  const sourceString = `${time}.${body}`

  const expectedSignature = crypto.createHmac('sha256', secret).update(sourceString).digest('hex')

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  // timingSafeEqual throws on length mismatch — check first
  if (signatureBuffer.length !== expectedBuffer.length) return false

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
}

export async function POST(request: Request) {
  const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Cloudflare Webhook] CLOUDFLARE_STREAM_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body = await request.text()
  const signatureHeader = request.headers.get('webhook-signature') ?? ''

  if (!verifyWebhookSignature(body, signatureHeader, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)
  const uid = data.uid as string | undefined
  const readyToStream = data.readyToStream as boolean | undefined

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Find the media document by cloudflareStreamUid
  const { docs } = await payload.find({
    collection: 'media',
    where: { cloudflareStreamUid: { equals: uid } },
    limit: 1,
  })

  if (docs.length === 0) {
    payload.logger.warn(`[Cloudflare Webhook] No media found for Stream UID: ${uid}`)
    return NextResponse.json({ ok: true })
  }

  const mediaDoc = docs[0]

  if (readyToStream) {
    await payload.update({
      collection: 'media',
      id: mediaDoc.id,
      data: { cloudflareStreamReady: true },
      context: { skipCloudflareSync: true },
    })

    payload.logger.info(`[Cloudflare Webhook] Video ready: ${uid} (media ID: ${mediaDoc.id})`)
  }

  return NextResponse.json({ ok: true })
}
