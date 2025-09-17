'use client'

import React from 'react'
import { LenisProvider } from './Lenis'
import { CursorProvider } from './Cursor/CursorProvider'
import { useResetAnimationOnRouteChange } from '@/stores/animationStore'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Use the animation reset hook to automatically reset on route changes
  useResetAnimationOnRouteChange()

  return (
    <LenisProvider>
      <CursorProvider>{children}</CursorProvider>
    </LenisProvider>
  )
}
