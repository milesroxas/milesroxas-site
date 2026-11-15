import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare } from 'geist/font/pixel'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import type React from 'react'

import { ibmPlexSans } from '@/fonts/ibm-plex-sans'
import { cn } from '@/utilities/ui'
import './lab.css'

export const metadata: Metadata = {
  title: 'lab',
  robots: { index: false, follow: false },
}

/** Dev-only generators: a root layout of their own, no site chrome, no Payload. */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        GeistPixelSquare.variable,
        ibmPlexSans.variable,
      )}
      lang="en"
    >
      <body>{children}</body>
    </html>
  )
}
