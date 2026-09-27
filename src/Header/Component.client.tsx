'use client'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  /** Site Info › Ask › Hide Ask. */
  askHidden?: boolean
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ askHidden, data }) => {
  /* Storing the value in a useState to avoid hydration errors */

  return (
    <header>
      <HeaderNav askHidden={askHidden} data={data} />
    </header>
  )
}
