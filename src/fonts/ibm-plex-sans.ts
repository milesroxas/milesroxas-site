import localFont from 'next/font/local'

// Self-hosted: Google Fonts intermittently returns extensionless file URLs that
// next/font/google cannot parse at build time (vercel/next.js#99114).
export const ibmPlexSans = localFont({
  src: './ibm-plex-sans-latin.woff2',
  weight: '300 700',
  display: 'swap',
  variable: '--font-ibm-plex-sans',
})
