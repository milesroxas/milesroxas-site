'use client'

import type { ReactNode } from 'react'
import { useCursor } from '../context'

export const CursorButton = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <span
      role="none"
      onMouseEnter={() => setVariant('button')}
      onMouseLeave={() => setVariant('default')}
    >
      {children}
    </span>
  )
}

export const CursorSlider = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <span
      role="none"
      onMouseEnter={() => setVariant('slider')}
      onMouseLeave={() => setVariant('default')}
    >
      {children}
    </span>
  )
}
