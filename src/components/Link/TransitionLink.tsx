'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { usePageTransition } from '@/hooks/usePageTransition'

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
  const { navigate } = usePageTransition()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call any consumer onClick first to allow preventDefault
      linkProps?.onClick?.(e)

      if (e.defaultPrevented) return
      if (onNavigate) return // Let consumer control navigation

      e.preventDefault()
      const to =
        typeof href === 'string'
          ? href
          : href && typeof href === 'object' && 'pathname' in href
            ? (href.pathname as string) || ''
            : ''
      if (to) navigate(to)
    },
    [href, navigate, onNavigate, linkProps],
  )

  return (
    <Link
      href={href}
      className={className}
      onNavigate={onNavigate}
      onClick={handleClick}
      {...linkProps}
    >
      {children}
    </Link>
  )
}

export default TransitionLink
