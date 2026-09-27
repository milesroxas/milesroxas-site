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
import { TEXT_STYLE_STATE_KEY, type TextStyle } from '@/components/RichText/text-styles'
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

/*
 * Lexical builders ported from sas-site (`src/blocks/fixtures.ts`) for the
 * composition block stories. They produce the minimal serialized shapes
 * RichText needs; compose them with `richText(...)`.
 */

type SerializedNode = Record<string, unknown>

export const TEXT_FORMAT_BOLD = 1

/** `style` is a content-column text style (Eyebrow, Small), stored as node state. */
export const text = (content: string, format = 0, style?: TextStyle): SerializedNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: content,
  version: 1,
  ...(style ? { $: { [TEXT_STYLE_STATE_KEY]: style } } : {}),
})

export const listItem = (...children: SerializedNode[]): SerializedNode => ({
  type: 'listitem',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  value: 1,
  version: 1,
})

export const unorderedList = (...items: SerializedNode[]): SerializedNode => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((item, index) => ({ ...item, value: index + 1 })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

export const paragraph = (...children: SerializedNode[]): SerializedNode => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

export const heading = (
  tag: 'h1' | 'h2' | 'h3' | 'h4',
  ...children: SerializedNode[]
): SerializedNode => ({
  type: 'heading',
  tag,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

/**
 * A Lexical block node (a component the editor added from the toolbar).
 * `fields` is the block's own document, `blockType` included.
 */
export const blockNode = (fields: Record<string, unknown>): SerializedNode => ({
  type: 'block',
  fields,
  format: '',
  version: 2,
})

export const richText = (...children: SerializedNode[]): RichTextFixture => lexicalState(children)

/**
 * A content-column body (Split, Split narrow): a kicker, copy, an h4 label
 * over a ruled list and a small note. The Actions row joins it with the
 * rich-text toolbar blocks (Phase 3).
 */
export const contentColumnFixture: RichTextFixture = richText(
  paragraph(text('What I do', 0, 'eyebrow')),
  paragraph(
    text(
      'Design and engineering for brands that want their site to feel as considered as their product.',
    ),
  ),
  heading('h4', text('Included')),
  unorderedList(
    listItem(text('Website strategy and UX')),
    listItem(text('Design and development')),
    listItem(text('Motion and WebGL')),
  ),
  paragraph(text('Engagements run from a focused sprint to a standing retainer.', 0, 'small')),
)

/** `imageMedia` with a Lexical caption, for blocks that render one. */
export const mediaFixture: Media = {
  ...imageMedia,
  caption: richText(
    paragraph(text('A caption for the media block, rendered from Lexical rich text.')),
  ),
}

/**
 * A single-color SVG mark as the Insight list renders it (a mask over the
 * text color), inlined as a data URL so the story needs no upload and no
 * network. `updatedAt` is empty on purpose: `getMediaUrl` appends it as a
 * cache tag, and a query string after `</svg>` would break the data URL.
 */
const svgMarkFixture = (id: number, alt: string, body: string): Media => ({
  id,
  alt,
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">${body}</svg>`,
  )}`,
  filename: `${id}.svg`,
  mimeType: 'image/svg+xml',
  width: 28,
  height: 28,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
})

/** Six marks for Insight list stories, in reading order. */
export const insightMarkFixtures = {
  twoCirclesDashed: svgMarkFixture(
    20,
    'Two overlapping circles, one dashed',
    '<circle cx="9" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.25"/><circle cx="19" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="2 3"/>',
  ),
  twoCircles: svgMarkFixture(
    21,
    'Two overlapping circles',
    '<circle cx="11" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1.25"/><circle cx="17" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
  nestedSquares: svgMarkFixture(
    22,
    'A square inside a dashed square',
    '<rect x="3.5" y="3.5" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.25" stroke-dasharray="2 3"/><rect x="3.5" y="3.5" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
  threeLines: svgMarkFixture(
    23,
    'Three staggered lines',
    '<path d="M3 8H19" stroke="currentColor" stroke-width="1.25"/><path d="M7 14H25" stroke="currentColor" stroke-width="1.25"/><path d="M3 20H15" stroke="currentColor" stroke-width="1.25"/>',
  ),
  halfCircle: svgMarkFixture(
    24,
    'A circle filled below its waterline',
    '<circle cx="14" cy="14" r="10.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M3.5 17.5H24.5" stroke="currentColor" stroke-width="1.25"/><path d="M4.1 17.5A10.5 10.5 0 0 0 23.9 17.5Z" fill="currentColor"/>',
  ),
  expandArrow: svgMarkFixture(
    25,
    'An arrow expanding between two corners',
    '<path d="M3.5 11.5V3.5H11.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M24.5 16.5V24.5H16.5" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M8 20L20 8" stroke="currentColor" stroke-width="1.25"/><path d="M14 8H20V14" fill="none" stroke="currentColor" stroke-width="1.25"/>',
  ),
} as const satisfies Record<string, Media>
