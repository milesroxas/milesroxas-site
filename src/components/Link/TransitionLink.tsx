'use client'

import React from 'react'
import Link from 'next/link'
import { useTransitionNavigation } from '../../hooks/useTransitionNavigation'
import type { LinkProps } from 'next/link'

interface TransitionLinkProps extends Omit<LinkProps, 'onClick'> {
  children: React.ReactNode
  className?: string
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  className = '',
  href,
  ...linkProps
}) => {
  const { isNavigating, navigate } = useTransitionNavigation()

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        navigate(href.toString())
      }}
      {...linkProps}
    >
      {children}
    </Link>
  )
}

export default TransitionLink
