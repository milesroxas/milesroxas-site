'use client'

import type React from 'react'
import { AskSessionProvider } from '@/features/ask/AskSession'
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
      <CursorProvider>
        {/* One Ask conversation and one journey for the whole visit (/ask). */}
        <AskSessionProvider>{children}</AskSessionProvider>
      </CursorProvider>
    </LenisProvider>
  )
}
