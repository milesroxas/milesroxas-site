'use client'

import { useEffect } from 'react'
import { whenIdle } from '@/utilities/whenIdle'

/**
 * PostHog, fetched once the main thread is free: the SDK is 300 KB before
 * its extensions, and a static import put it in the chunk every page waits
 * on. Surveys and dead-click capture are off (neither is used; together they
 * were another 130 KB on every visit). Session replay stays: it is the site's
 * one recorder.
 */
export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
    if (!key) return

    let cancelled = false
    const cancelIdle = whenIdle(() => {
      import('posthog-js').then(({ default: posthog }) => {
        if (cancelled || posthog.__loaded) return
        posthog.init(key, {
          api_host: host,
          defaults: '2026-01-30',
          disable_surveys: true,
          capture_dead_clicks: false,
        })
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [])

  return null
}
