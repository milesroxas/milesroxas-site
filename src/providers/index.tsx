'use client'

import type React from 'react'
import { useResetAnimationOnRouteChange } from '@/stores/animationStore'
import { CursorProvider } from './Cursor/CursorProvider'
import { LenisProvider } from './Lenis'

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
