'use client'

import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ThreeCanvasProvider } from './ThreeCanvas'
import { LoadingProvider } from './LoadingProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <ThreeCanvasProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </ThreeCanvasProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
