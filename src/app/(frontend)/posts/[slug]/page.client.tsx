'use client'

import { useEffect } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { restoreChrome } from '@/stores/chromeStore'

/** Arriving on a post: the chrome comes back and the page starts at its top. */
export default function PageClient() {
  const lenis = useLenis()

  useEffect(() => {
    restoreChrome()
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return null
}
