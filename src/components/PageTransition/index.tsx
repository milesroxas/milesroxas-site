'use client'

import React, { ReactNode } from 'react'
import { useTransitionNavigation } from '@/hooks/useTransitionNavigation'

interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { isNavigating } = useTransitionNavigation()

  return (
    <div
      style={{
        transition: 'opacity 400ms ease-in-out, transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity, transform',
      }}
      className={isNavigating ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}
    >
      {children}
    </div>
  )
}

export default PageTransition
