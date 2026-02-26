'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key) return

    posthog.init(key, {
      api_host: host,
      defaults: '2026-01-30',
    })
  }, [])

  return null
}
