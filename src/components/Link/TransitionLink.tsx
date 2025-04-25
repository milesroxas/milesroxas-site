'use client'

import React from 'react'
import Link from 'next/link'
import { useTransitionNavigation } from '../../hooks/useTransitionNavigation'
import type { LinkProps } from 'next/link'

// Define the correct type for onNavigate
type OnNavigateEventHandler = (event: { preventDefault: () => void }) => void

interface TransitionLinkProps extends Omit<LinkProps, 'onNavigate'> {
  children: React.ReactNode
  className?: string
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  className = '',
  href,
  ...linkProps
}) => {
  const { handleNavigate } = useTransitionNavigation()

  // Type cast the handler to match Next.js expected type
  const typedNavigateHandler: OnNavigateEventHandler = handleNavigate as OnNavigateEventHandler

  return (
    <Link href={href} className={className} onNavigate={typedNavigateHandler} {...linkProps}>
      {children}
    </Link>
  )
}

export default TransitionLink
