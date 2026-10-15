import configPromise from '@payload-config'
import { Analytics } from '@vercel/analytics/next'
import { GeistMono } from 'geist/font/mono'
import type { Metadata, Viewport } from 'next'
import { unstable_cache } from 'next/cache'
import { IBM_Plex_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Clarity } from '@/components/Clarity'
import { JsonLd } from '@/components/JsonLd'
import { SiteChrome } from '@/components/SiteChrome/SiteChrome'
import { Footer } from '@/Footer/Component'
import type { SiteInfo } from '@/payload-types'
import { Providers } from '@/providers'
import { PostHogProvider } from '@/providers/PostHog'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { siteMetadata } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { personSchema, webSiteSchema } from '@/utilities/schema'
import { cn } from '@/utilities/ui'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
})

/**
 * The Capabilities taxonomy, in its authored order, as the Person's
 * `knowsAbout`. Cached under the `works` tag the taxonomy's hooks revalidate.
 */
const getCapabilityNames = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'capabilities',
      depth: 0,
      pagination: false,
      sort: '_order',
      select: { title: true },
    })
    return docs.map((doc) => doc.title)
  },
  ['capability-names'],
  { revalidate: 600, tags: ['works'] },
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled }, siteInfo, knowsAbout] = await Promise.all([
    draftMode(),
    // Depth 1 like the chrome and the metadata: one cache entry, headshot populated.
    getCachedGlobal('site-info', 1)() as Promise<SiteInfo | null>,
    getCapabilityNames().catch(() => [] as string[]),
  ])

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
        {/* The site's entity anchor, once; page schemas point back at it by @id (docs/aeo.md). */}
        <JsonLd
          data={[personSchema(siteInfo ?? {}, { knowsAbout }), webSiteSchema(siteInfo ?? {})]}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <SiteChrome />
          {/* One landmark for the page's content, so readers and extractors find it without the chrome. */}
          <main id="main">{children}</main>
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

export const generateMetadata = (): Promise<Metadata> => siteMetadata()

// `cover` lets the fixed chrome read the device's live safe-area insets
// (globals.css), so the dock clears the home indicator and rounded corners
// when a phone's browser bars collapse.
export const viewport: Viewport = {
  viewportFit: 'cover',
}
