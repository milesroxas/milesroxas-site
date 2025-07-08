'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)

  const pathname = usePathname()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <header {...(theme ? { 'data-theme': theme } : {})}>
      <HeaderNav data={data} />
    </header>
  )
}
