'use client'

import type React from 'react'
import { useEffect } from 'react'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import { outboundLink } from '@/components/SiteChrome/outbound'
import { useLenis } from '@/hooks/useLenis'
import type { Work } from '@/payload-types'
import { useChromeStore } from '@/stores/chromeStore'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  const lenis = useLenis()
  const { title } = work
  const href = work.link?.url ?? null
  const label = work.link?.label ?? null
  const setLink = useChromeStore((state) => state.setLink)
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  // The dock offers the work's live site while this page is up.
  useEffect(() => {
    setLink(outboundLink({ url: href, label }))
    return () => setLink(null)
  }, [href, label, setLink])

  return title ? <ChromeTitle title={title} /> : null
}

export default PageClient
