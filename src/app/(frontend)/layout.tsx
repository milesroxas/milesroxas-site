import { Analytics } from '@vercel/analytics/next'
import { GeistMono } from 'geist/font/mono'
import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'

import type React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Clarity } from '@/components/Clarity'
import { SiteChrome } from '@/components/SiteChrome/SiteChrome'
import { Footer } from '@/Footer/Component'
import { Providers } from '@/providers'
import { PostHogProvider } from '@/providers/PostHog'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import './globals.css'

import { getServerSideURL } from '@/utilities/getURL'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(ibmPlexSans.className, ibmPlexSans.variable, GeistMono.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <SiteChrome />
          {children}
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Footer />
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
