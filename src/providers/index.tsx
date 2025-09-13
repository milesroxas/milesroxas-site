'use client'

import React from 'react'
import { LenisProvider } from './Lenis'
import { CursorProvider } from './Cursor/CursorProvider'
import { TransitionProvider } from './TransitionProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <LenisProvider>
      <TransitionProvider>
        <CursorProvider>{children}</CursorProvider>
      </TransitionProvider>
    </LenisProvider>
  )
}
