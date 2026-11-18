import localFont from 'next/font/local'

/**
 * Geist Pixel Square for the panel readout, without the preload `geist/font/pixel`
 * bakes in: every page route imports the heroes, and only an Instrument page draws it.
 */
export const pixelFont = localFont({
  src: '../../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2',
  variable: '--font-geist-pixel-square',
  weight: '500',
  preload: false,
  fallback: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
  adjustFontFallback: false,
})
