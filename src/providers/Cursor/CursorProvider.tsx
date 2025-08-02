'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Cursor from './Component'

// Types
export type CursorVariant = 'default' | 'text' | 'button' | 'link' | 'media' | 'slider'

interface CursorContextType {
  variant: CursorVariant
  setVariant: (variant: CursorVariant) => void
  customText?: string
  setCustomText: (text: string | undefined) => void
}

// Cursor Context
export const CursorContext = createContext<CursorContextType>({
  variant: 'default',
  setVariant: () => {},
  customText: undefined,
  setCustomText: () => {},
})

// Cursor Provider
export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<CursorVariant>('default')
  const [customText, setCustomText] = useState<string | undefined>(undefined)

  return (
    <CursorContext.Provider value={{ variant, setVariant, customText, setCustomText }}>
      {children}
      <Cursor />
    </CursorContext.Provider>
  )
}

// Custom Hook for Cursor Context
export const useCursor = () => useContext(CursorContext)
