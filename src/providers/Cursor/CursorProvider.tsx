'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Cursor from './Component'

// Types
export type CursorVariant = 'default' | 'text' | 'button' | 'link' | 'media'

interface CursorContextType {
  variant: CursorVariant
  setVariant: (variant: CursorVariant) => void
}

// Cursor Context
export const CursorContext = createContext<CursorContextType>({
  variant: 'default',
  setVariant: () => {},
})

// Cursor Provider
export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<CursorVariant>('default')

  return (
    <CursorContext.Provider value={{ variant, setVariant }}>
      {children}
      <Cursor />
    </CursorContext.Provider>
  )
}

// Custom Hook for Cursor Context
export const useCursor = () => useContext(CursorContext)
