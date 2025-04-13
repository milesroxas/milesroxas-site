'use client'

import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { GlobalCanvasProvider } from './ThreeCanvas'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <GlobalCanvasProvider>{children}</GlobalCanvasProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
