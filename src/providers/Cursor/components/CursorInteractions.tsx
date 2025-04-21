'use client'

import { ReactNode } from 'react'
import { useCursor } from '../CursorProvider'

export const CursorText = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <div onMouseEnter={() => setVariant('text')} onMouseLeave={() => setVariant('default')}>
      {children}
    </div>
  )
}

export const CursorButton = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <div onMouseEnter={() => setVariant('button')} onMouseLeave={() => setVariant('default')}>
      {children}
    </div>
  )
}

export const CursorLink = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <div onMouseEnter={() => setVariant('link')} onMouseLeave={() => setVariant('default')}>
      {children}
    </div>
  )
}

export const CursorMedia = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <div onMouseEnter={() => setVariant('media')} onMouseLeave={() => setVariant('default')}>
      {children}
    </div>
  )
}
