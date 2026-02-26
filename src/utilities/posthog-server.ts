import { PostHog } from 'posthog-node'

export interface CaptureServerEventOptions {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}

export async function captureServerEvent(options: CaptureServerEventOptions): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key) return

  const posthog = new PostHog(key, { host })

  posthog.capture({
    distinctId: options.distinctId,
    event: options.event,
    properties: options.properties,
  })

  await posthog.shutdown()
}
