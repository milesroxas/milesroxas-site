/**
 * The Phase 6 preservation check (docs/composer-roadmap.md): before anything
 * is written, every media id and every non-empty string a legacy layout
 * carries must appear in the output. A document that fails is skipped and
 * reported; nothing is written for it.
 *
 * Declared drops, and only these: captions hidden by `showCaption: false`,
 * empty spacer columns (blank by definition, so they carry no string), and
 * inline formatting on text that moves into a plain-text field (the strings
 * themselves are still checked).
 */
import { isLexicalState, textStrings } from './lexical'
import type { Block } from './rules'

export type Carried = { media: Set<number>; text: Set<string> }

const MEDIA_KEYS = new Set(['media', 'image', 'portraitMedia', 'landscapeMedia'])

/** Plain string fields a legacy block's copy lives in (outside Lexical). */
const TEXT_KEYS = new Set([
  'eyebrow',
  'heading',
  'subheading',
  'caption',
  'tabTitle',
  'url',
  'title',
  'description',
])

/** The content groups a Columns column or a Tab slider tab chooses between. */
const COLUMN_GROUPS = new Set([
  'text',
  'sectionHeading',
  'work',
  'post',
  'slider',
  'media',
  'youTube',
  'richText',
])

/** The group a column (`content`) or a tab (`contentType`) renders, or null for any other record. */
const selectedGroup = (record: Record<string, unknown>): string | null => {
  if (typeof record.content === 'string' && COLUMN_GROUPS.has(record.content)) return record.content
  if (typeof record.contentType === 'string' && COLUMN_GROUPS.has(record.contentType))
    return record.contentType
  return null
}

/** Subtrees that are not copy: legacy presentation, and the listings that pass through. */
const SKIP_KEYS = new Set(['space', 'link', 'links', 'work', 'post', 'introContentSettings'])

/**
 * Everything the preservation check follows in a layout: media ids under the
 * media keys, strings under the text keys, and every Lexical text node.
 * `hidden` drops what a block does not show (a caption behind
 * `showCaption: false`).
 */
export const collect = (
  value: unknown,
  carried: Carried = { media: new Set(), text: new Set() },
): Carried => {
  const walk = (node: unknown, key: string) => {
    if (node === null || node === undefined) return
    if (Array.isArray(node)) {
      for (const child of node) walk(child, key)
      return
    }
    if (typeof node === 'number') {
      if (MEDIA_KEYS.has(key)) carried.media.add(node)
      return
    }
    if (typeof node === 'string') {
      if (TEXT_KEYS.has(key) && node.trim()) carried.text.add(node.trim())
      return
    }
    if (typeof node !== 'object') return
    if (isLexicalState(node)) {
      for (const text of textStrings(node)) carried.text.add(text)
      // Lexical block nodes (Insights) keep their fields: walk them for strings too.
      walkFields(node)
      return
    }
    const record = node as Block
    if (MEDIA_KEYS.has(key) && typeof record.id === 'number') {
      carried.media.add(record.id)
      return
    }
    // A Columns column stores every content group and renders the one its
    // `content` selects; a Tab slider tab does the same with `contentType`.
    // Only what renders is carried: the others are leftovers of an earlier
    // choice that no visitor sees.
    const selected = selectedGroup(record)
    for (const [childKey, child] of Object.entries(record)) {
      if (selected && COLUMN_GROUPS.has(childKey) && childKey !== selected) continue
      if (SKIP_KEYS.has(childKey)) continue
      if (
        childKey === 'richText' &&
        record.blockType === 'mediaBlock' &&
        record.showCaption !== true
      )
        continue
      walk(child, childKey)
    }
  }
  const walkFields = (state: unknown) => {
    const visit = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(visit)
      if (typeof node !== 'object' || node === null) return
      const record = node as { type?: string; fields?: unknown; children?: unknown }
      if (record.type === 'block' && record.fields) walk(record.fields, 'fields')
      visit(record.children)
    }
    visit((state as { root?: unknown }).root)
  }
  walk(value, '')
  return carried
}

export type PreservationResult = { ok: boolean; missingMedia: number[]; missingText: string[] }

/**
 * Whether the output carries everything the legacy blocks did. A string counts
 * as carried when it appears inside any output string (a paragraph that became
 * a heading, runs joined into an Insight description).
 */
export const checkPreservation = (legacy: Block[], output: Block[]): PreservationResult => {
  const before = collect(legacy)
  const after = collect(output)
  const corpus = [...after.text].join('\n\u0000\n')
  const missingMedia = [...before.media].filter((id) => !after.media.has(id))
  const missingText = [...before.text].filter(
    (text) => !after.text.has(text) && !corpus.includes(text),
  )
  return { ok: missingMedia.length === 0 && missingText.length === 0, missingMedia, missingText }
}
