'use client'

import React from 'react'
import dynamic from 'next/dynamic'

import { HeaderThemeProvider } from './HeaderTheme'
import { LenisProvider } from './Lenis'
import { ThemeProvider } from './Theme'
// Import GlobalCanvasProvider dynamically with no SSR
const GlobalCanvasProvider = dynamic(
  () => import('./ThreeCanvas').then((mod) => mod.GlobalCanvasProvider),
  { ssr: false },
)

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
