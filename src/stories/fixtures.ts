/**
 * Shared Storybook fixtures shaped like Payload CMS documents.
 *
 * These mirror the generated types in `src/payload-types.ts` so stories render
 * components exactly as they would with real CMS data. Keep them minimal —
 * only the fields components actually read.
 */
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { CardPostData } from '@/components/Card/Posts/Component'
import type { CardWorkData } from '@/components/Card/Works/Component'
import type { Media, Page } from '@/payload-types'

const textNode = (text: string, format = 0) => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const paragraphNode = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  type: 'paragraph',
  version: 1,
})

const headingNode = (text: string, tag: 'h1' | 'h2' | 'h3' = 'h2') => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  type: 'heading',
  version: 1,
})

/**
 * Assignable both to `DefaultTypedEditorState` (RichText component) and to the
 * generated Payload rich-text field types, which add an index signature.
 */
export type RichTextFixture = DefaultTypedEditorState & { [k: string]: unknown }

/** Build a valid Lexical editor state from plain content nodes. */
export const lexicalState = (nodes: Record<string, unknown>[]): RichTextFixture =>
  ({
    root: {
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
    // Hand-built node literals can't satisfy Lexical's serialized node unions
    // structurally, but they match the runtime shape the converters expect.
  }) as unknown as RichTextFixture

export const simpleRichText = lexicalState([
  headingNode('A heading inside rich text'),
  paragraphNode(
    'This paragraph comes from a Lexical editor state fixture, matching what Payload stores for rich text fields.',
  ),
])

export const paragraphRichText = lexicalState([
  paragraphNode('A single supporting paragraph rendered from CMS rich text.'),
])

/** Image document served from `public/` via Storybook's staticDirs. */
export const imageMedia: Media = {
  id: 1,
  alt: 'Open graph placeholder artwork',
  url: '/website-template-OG.webp',
  filename: 'website-template-OG.webp',
  mimeType: 'image/webp',
  filesize: 128_000,
  width: 1200,
  height: 630,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

export const postCardData: CardPostData = {
  slug: 'designing-with-motion',
  title: 'Designing with Motion',
  hero: {
    type: 'lowImpact',
    media: imageMedia,
  },
  meta: {
    title: 'Designing with Motion',
    description:
      'How motion design decisions shape the feel of an interface, and where to draw the line between delight and distraction.',
    image: imageMedia,
  },
}

export const workCardData: CardWorkData = {
  slug: 'brand-refresh',
  title: 'Brand Refresh',
  hero: {
    type: 'lowImpact',
    media: imageMedia,
    richText: paragraphRichText,
  },
  meta: {
    title: 'Brand Refresh',
    description: 'A full identity and web refresh for a growing studio.',
    image: imageMedia,
  },
}

export const pageHero: Page['hero'] = {
  type: 'mediumImpact',
  richText: simpleRichText,
  links: [
    {
      id: 'link-1',
      link: {
        type: 'custom',
        url: '/works',
        label: 'View work',
        appearance: 'default',
      },
    },
    {
      id: 'link-2',
      link: {
        type: 'custom',
        url: '/contact',
        label: 'Get in touch',
        appearance: 'outline',
      },
    },
  ],
  media: imageMedia,
}
