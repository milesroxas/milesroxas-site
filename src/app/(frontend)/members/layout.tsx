import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/** The members area is per visitor: never in search results, never cached. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MembersLayout({ children }: { children: ReactNode }) {
  return children
}
