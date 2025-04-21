'use client'

import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { LenisProvider } from './Lenis'
import { ThemeProvider } from './Theme'
import { CursorProvider } from './Cursor/CursorProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <LenisProvider>
          <CursorProvider>{children}</CursorProvider>
        </LenisProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
