'use client'

import type React from 'react'
import { AskSessionProvider } from '@/features/ask/AskSession'
import { Cursor } from './Cursor'
import { LenisProvider } from './Lenis'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    // Outermost: `InitTheme` has already stamped `<html data-theme>`, and this
    // owns every change to it afterwards.
    <ThemeProvider>
      <LenisProvider>
        {/* One Ask conversation and one journey for the whole visit (/ask). */}
        <AskSessionProvider>{children}</AskSessionProvider>
        <Cursor />
      </LenisProvider>
    </ThemeProvider>
  )
}
