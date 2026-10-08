'use client'

import type React from 'react'
import { useEffect } from 'react'
import { ChromeTitle } from '@/components/SiteChrome/ChromeTitle'
import { useLenis } from '@/hooks/useLenis'
import type { Work } from '@/payload-types'

const PageClient: React.FC<{ work: Work }> = ({ work }) => {
  const lenis = useLenis()
  const { title } = work
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return title ? <ChromeTitle title={title} /> : null
}

export default PageClient
