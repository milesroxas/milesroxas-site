'use client'

import React, { ReactNode } from 'react'
import { useTransitionNavigation } from '../../hooks/useTransitionNavigation'

interface PageTransitionProps {
  children: ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { isNavigating } = useTransitionNavigation()

  return (
    <div
      style={{ transition: 'all 300ms ease-in-out' }}
      className={isNavigating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    >
      {children}
    </div>
  )
}

export default PageTransition
