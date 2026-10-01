import type { ComponentType, SVGProps } from 'react'
import { surfaceForPath } from '@/shared/content/surfaces'

/**
 * The chrome's glyphs, drawn for it on a 16px grid at one stroke weight so
 * they sit together in the tab bar, the Ask field and the Ask source rows.
 * Each takes `currentColor`; size them with `size-*`.
 */

type GlyphProps = SVGProps<SVGSVGElement>
export type Glyph = ComponentType<GlyphProps>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 1.3,
  viewBox: '0 0 16 16',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

export function HomeGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} {...props}>
      <path d="M2.75 7 8 2.75 13.25 7v5.75a.5.5 0 0 1-.5.5H9.75V9.75h-3.5v3.5h-3a.5.5 0 0 1-.5-.5V7Z" />
    </svg>
  )
}

export function WorkGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} {...props}>
      <rect height="4.5" rx="1" width="4.5" x="2.5" y="2.5" />
      <rect height="4.5" rx="1" width="4.5" x="9" y="2.5" />
      <rect height="4.5" rx="1" width="4.5" x="2.5" y="9" />
      <rect height="4.5" rx="1" width="4.5" x="9" y="9" />
    </svg>
  )
}

const SHEET = 'M4.25 2.25h5l2.5 2.5v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5V2.75a.5.5 0 0 1 .5-.5Z'

export function PostsGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} {...props}>
      <path d={SHEET} />
      <path d="M6 8h4M6 10.5h4" />
    </svg>
  )
}

export function PageGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} {...props}>
      <path d={SHEET} />
    </svg>
  )
}

export function ContactGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} {...props}>
      <rect height="8.5" rx="1.75" width="11.5" x="2.25" y="3.75" />
      <path d="m2.75 4.75 5.25 4 5.25-4" />
    </svg>
  )
}

/** Ask's mark: a speech bubble with one point of attention. The dot takes the ink as a fill. */
export function AskGlyph(props: GlyphProps) {
  return (
    <svg aria-hidden="true" {...stroke} strokeWidth={1.4} {...props}>
      <path d="M8 2.25c3.31 0 5.75 2.2 5.75 4.9 0 2.71-2.44 4.9-5.75 4.9-.62 0-1.2-.08-1.75-.22L3.1 13.5l.78-2.47C2.84 10.14 2.25 8.72 2.25 7.15 2.25 4.45 4.69 2.25 8 2.25Z" />
      <circle cx="8" cy="7.15" fill="currentColor" r="0.95" stroke="none" />
    </svg>
  )
}

/** Root pages with a glyph of their own; every other root page takes the plain sheet. */
const PAGE_GLYPHS: Record<string, Glyph> = {
  '/': HomeGlyph,
  '/contact': ContactGlyph,
}

/** Collections with a glyph of their own, matched through the content surfaces. */
const SURFACE_GLYPHS: Record<string, Glyph> = {
  works: WorkGlyph,
  posts: PostsGlyph,
}

/**
 * The glyph for a destination, so a tab and an Ask source row that open the
 * same section always wear the same mark: Work for anything under /works,
 * Posts for anything under /posts, Home and Contact for those pages.
 */
export function glyphForPath(path: string): Glyph {
  const surface = surfaceForPath(path)
  return PAGE_GLYPHS[path] ?? (surface && SURFACE_GLYPHS[surface.collection as string]) ?? PageGlyph
}
