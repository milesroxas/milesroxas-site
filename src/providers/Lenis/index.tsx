'use client'

import { ReactLenis } from 'lenis/react'
import type React from 'react'

type LenisProviderProps = {
  children: React.ReactNode
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  return <ReactLenis root>{children}</ReactLenis>
}
