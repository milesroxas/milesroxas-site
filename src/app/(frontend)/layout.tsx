import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { IBM_Plex_Sans } from 'next/font/google'

import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Providers } from '@/providers'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { Header } from '@/Header/Component'
import './globals.css'

import { getServerSideURL } from '@/utilities/getURL'
import CanvasLayout from '@/r3f/canvas/CanvasLayout'
import { SiteFrame } from '@/SiteFrame/Component'
import FrameRestorer from '@/SiteFrame/FrameRestorer'
import Script from 'next/script'

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
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {/* Add Clarity script properly using next/script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.CLARITY_ID || ''}");
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <Providers>
          <Header />
          <SiteFrame>{children}</SiteFrame>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <CanvasLayout />
          <Footer />
          <FrameRestorer />
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
