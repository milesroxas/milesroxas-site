import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { IBM_Plex_Sans } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { Header } from '@/Header/Component'
import './globals.css'

import { getServerSideURL } from '@/utilities/getURL'
import CanvasLayout from '@/r3f/canvas/CanvasLayout'
import { SiteFrame } from '@/SiteFrame/Component'
import PageTransition from '@/components/PageTransition'
// Initialize the font at the module scope
const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(ibmPlexSans.className)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <Providers>
          <Header />
          <SiteFrame>
            <PageTransition>{children}</PageTransition>
          </SiteFrame>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <CanvasLayout />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
