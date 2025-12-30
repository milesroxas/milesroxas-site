// components/ClientBlockWrapper.tsx
'use client'

import type React from 'react'
import { type ThemeOption, useBlockTheme } from '@/hooks/useBlockTheme'

type AnyBlock = Record<string, unknown>

type Props<P> = {
  Component: React.ComponentType<P>
  block: P & { theme?: ThemeOption }
}

export function ClientBlockWrapper<P extends AnyBlock>({ Component, block }: Props<P>) {
  // resolve light/dark/system in one place
  const applied = useBlockTheme(block.theme ?? 'system')

  // full-width or other wrapper-level logic
  const isFull = (block as unknown as { containerWidth?: string }).containerWidth === 'fullWidth'

  return (
    <div data-theme={applied} className={`block-wrapper ${isFull ? 'w-full' : ''}`}>
      <Component {...(block as P)} />
    </div>
  )
}
