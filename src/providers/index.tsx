'use client'

import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { LenisProvider } from './Lenis'
import { ThemeProvider } from './Theme'
import { GlobalCanvasProvider } from './ThreeCanvas'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <LenisProvider>
          <GlobalCanvasProvider>{children}</GlobalCanvasProvider>
        </LenisProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
