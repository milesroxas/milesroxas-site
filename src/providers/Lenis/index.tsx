'use client'

import { Lenis as ReactLenis } from '@studio-freight/react-lenis'
import type React from 'react'

type LenisProviderProps = {
  children: React.ReactNode
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  return <ReactLenis root>{children}</ReactLenis>
}
