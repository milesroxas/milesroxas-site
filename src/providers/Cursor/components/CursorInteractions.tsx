'use client'

import type { ReactNode } from 'react'
import { useCursor } from '../CursorProvider'

export const CursorText = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <span
      role="none"
      onMouseEnter={() => setVariant('text')}
      onMouseLeave={() => setVariant('default')}
    >
      {children}
    </span>
  )
}

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

export const CursorLink = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <span
      role="none"
      onMouseEnter={() => setVariant('link')}
      onMouseLeave={() => setVariant('default')}
    >
      {children}
    </span>
  )
}

export const CursorMedia = ({ children }: { children: ReactNode }) => {
  const { setVariant } = useCursor()

  return (
    <span
      role="none"
      onMouseEnter={() => setVariant('media')}
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
