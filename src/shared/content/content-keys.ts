/**
 * Which document keys carry reader-facing content, shared by every walk over
 * a page's stored shape: the RAG corpus extractor (`./extract`) and the MCP
 * block tools (`@/plugins/mcp-tools/blocks`). One list, so a new text field is
 * taught to both walkers at once.
 *
 * Keys are compared lowercase with a trailing `override` stripped, because an
 * override field holds the same substance as the field it replaces.
 */

export const normalizeKey = (key: string): string => key.toLowerCase().replace(/override$/, '')

/** String fields whose values are reader-facing content. */
export const CONTENT_TEXT_KEYS = new Set([
  'answer',
  'body',
  // A work's details (Works › Opening), plain text fields here where
  // sas-site relates them to taxonomy terms. Capabilities is a list of them.
  // The client is a relationship, resolved by the extractor (`./extract`).
  'capabilities',
  'caption',
  'decision',
  'description',
  'excerpt',
  'eyebrow',
  'footnote',
  'heading',
  'impact',
  'industry',
  'intro',
  'lead',
  'medium',
  'oneline',
  'problem',
  'question',
  'quote',
  'rationale',
  'role',
  'secondline',
  'short',
  'standfirst',
  'statement',
  'subheading',
  'subtitle',
  'summary',
  'tagline',
  'text',
  // A figure's plain-language description (blocks/figures): what a chart or
  // diagram shows, which is all of it a text corpus can hold. Not rendered
  // copy.
  'textalternative',
  'thesis',
  'title',
])

/** Keys emitted as markdown headings — natural chunk boundaries. */
export const CONTENT_HEADING_KEYS = new Set(['title', 'heading'])

/** Subtrees that never carry body content (system, SEO, navigation, media). */
export const CONTENT_SKIP_KEYS = new Set([
  '_status',
  'breadcrumbs',
  'createdat',
  // A figure's stored diagram geometry: coordinates and wrapped label fragments.
  'geometry',
  'id',
  'blockname',
  'link',
  'links',
  'media',
  'meta',
  'parent',
  'publishedat',
  'slug',
  'sluglock',
  // A figure's chart or diagram spec: data, not prose. Its words are the
  // block's title, caption and text alternative, which are text keys.
  'spec',
  'updatedat',
])
