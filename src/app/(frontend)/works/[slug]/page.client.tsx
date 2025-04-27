'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { usePageAnimationStore } from '@/templates/shared/usePageAnimationStore'
import { LenisProvider } from '@/providers/Lenis'
import { useLenis } from '@/hooks/useLenis'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const { restoreFrame } = usePageAnimationStore()
  const lenis = useLenis()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  useEffect(() => {
    restoreFrame()
    lenis?.scrollTo(0, { immediate: true })
  }, [restoreFrame, lenis])

  // This doesn't need to wrap content
  // The transition effect is applied to the parent layout
  return null
}

export default PageClient
