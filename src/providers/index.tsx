'use client'

import type React from 'react'
import { AskSessionProvider } from '@/features/ask/AskSession'
import { useResetAnimationOnRouteChange } from '@/stores/animationStore'
import { CursorProvider } from './Cursor/CursorProvider'
import { LenisProvider } from './Lenis'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Use the animation reset hook to automatically reset on route changes
  useResetAnimationOnRouteChange()

  return (
    // Outermost: `InitTheme` has already stamped `<html data-theme>`, and this
    // owns every change to it afterwards.
    <ThemeProvider>
      <LenisProvider>
        <CursorProvider>
          {/* One Ask conversation and one journey for the whole visit (/ask). */}
          <AskSessionProvider>{children}</AskSessionProvider>
        </CursorProvider>
      </LenisProvider>
    </ThemeProvider>
  )
}
