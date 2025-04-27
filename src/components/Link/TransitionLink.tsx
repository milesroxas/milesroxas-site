'use client'

import React from 'react'
import Link from 'next/link'
import type { LinkProps } from 'next/link'

// Define the correct type for onNavigate
type OnNavigateEventHandler = (event: { preventDefault: () => void }) => void

interface TransitionLinkProps extends Omit<LinkProps, 'onNavigate'> {
  children: React.ReactNode
  className?: string
  onNavigate?: OnNavigateEventHandler
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  className = '',
  href,
  onNavigate,
  ...linkProps
}) => {
  return (
    <Link href={href} className={className} onNavigate={onNavigate} {...linkProps}>
      {children}
    </Link>
  )
}

export default TransitionLink
