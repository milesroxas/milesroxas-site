import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'

import type React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Clarity } from '@/components/Clarity'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { PostHogProvider } from '@/providers/PostHog'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import './globals.css'

import { SiteFrame } from '@/SiteFrame/Component'
import FrameRestorer from '@/SiteFrame/FrameRestorer'
import { getServerSideURL } from '@/utilities/getURL'

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
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <Header />
          <SiteFrame>{children}</SiteFrame>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Footer />
          <FrameRestorer />
        </Providers>
        <Analytics />
        <Clarity />
        <PostHogProvider />
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
