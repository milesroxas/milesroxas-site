'use client'

import { type ReactNode, useState } from 'react'
import Cursor from './Component'
import { CursorContext, type CursorVariant } from './context'

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
