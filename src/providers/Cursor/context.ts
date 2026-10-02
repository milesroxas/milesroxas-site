'use client'

import { createContext, useContext } from 'react'

export type CursorVariant = 'default' | 'text' | 'button' | 'link' | 'media' | 'slider'

interface CursorContextType {
  variant: CursorVariant
  setVariant: (variant: CursorVariant) => void
  customText?: string
  setCustomText: (text: string | undefined) => void
}

export const CursorContext = createContext<CursorContextType>({
  variant: 'default',
  setVariant: () => {},
  customText: undefined,
  setCustomText: () => {},
})

export const useCursor = () => useContext(CursorContext)
