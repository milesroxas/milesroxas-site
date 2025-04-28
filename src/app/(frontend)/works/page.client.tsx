'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  // This component likely doesn't need to render anything itself,
  // as the main content is handled by the server component page.tsx
  return null // Return null as the component's purpose is primarily effects
}

export default PageClient
