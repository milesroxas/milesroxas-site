/**
 * Pure serializer from Lexical's serialized JSON state to markdown.
 *
 * Deliberately does NOT use @payloadcms/richtext-lexical's
 * convertLexicalToMarkdown: that instantiates a headless Lexical editor whose
 * node classes must be identity-equal with the ones the field registered —
 * which breaks under Next's server bundling when two copies of `lexical`
 * exist (esm/cjs dual-package hazard). Walking the JSON tree has no module
 * coupling, no editor spin-up per document, and covers every node type this
 * site's editors enable (see defaultLexical and the Posts content field).
 */

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4

type LexicalNode = {
  type: string
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  checked?: boolean
  value?: unknown
  url?: string
  fields?: Record<string, unknown>
  language?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export type SerializedLexicalState = { root?: { children?: LexicalNode[] } }

/** Markers in the order they wrap the text: code innermost, underline outermost. */
const FORMAT_MARKERS: readonly [flag: number, wrap: (text: string) => string][] = [
  [IS_CODE, (text) => `\`${text}\``],
  [IS_BOLD, (text) => `**${text}**`],
  [IS_ITALIC, (text) => `*${text}*`],
  [IS_STRIKETHROUGH, (text) => `~~${text}~~`],
  [IS_UNDERLINE, (text) => `<u>${text}</u>`],
]

const formattedText = (node: LexicalNode): string => {
  const raw = node.text ?? ''
  if (!raw.trim()) return raw
  // Emphasis markers must hug the text (\'** bold**\' is not valid markdown),
  // so hoist edge whitespace outside the markers.
  const leading = raw.match(/^\s*/)?.[0] ?? ''
  const trailing = raw.match(/\s*$/)?.[0] ?? ''
  const format = typeof node.format === 'number' ? node.format : 0
  const text = FORMAT_MARKERS.reduce(
    (wrapped, [flag, wrap]) => (format & flag ? wrap(wrapped) : wrapped),
    raw.trim(),
  )
  return `${leading}${text}${trailing}`
}

const linkText = (node: LexicalNode): string => {
  const label = childrenInline(node)
  const fields = node.fields as { url?: string } | undefined
  const url = fields?.url ?? node.url
  return url ? `[${label}](${url})` : label
}

const inlineText = (node: LexicalNode): string => {
  if (node.type === 'linebreak') return '\n'
  if (node.type === 'text') return formattedText(node)
  if (node.type === 'link' || node.type === 'autolink') return linkText(node)
  return childrenInline(node)
}

const childrenInline = (node: LexicalNode): string => (node.children ?? []).map(inlineText).join('')

const listToMarkdown = (node: LexicalNode, depth: number): string =>
  (node.children ?? [])
    .map((item, index) => {
      const indent = '  '.repeat(depth)
      const marker =
        node.listType === 'number'
          ? `${index + 1}.`
          : node.listType === 'check'
            ? `- [${item.checked ? 'x' : ' '}]`
            : '-'
      const nestedLists = (item.children ?? []).filter((child) => child.type === 'list')
      const inline = (item.children ?? [])
        .filter((child) => child.type !== 'list')
        .map(inlineText)
        .join('')
      const nested = nestedLists.map((list) => listToMarkdown(list, depth + 1)).join('\n')
      return `${indent}${marker} ${inline}${nested ? `\n${nested}` : ''}`
    })
    .join('\n')

type BlockFields = Record<string, unknown>

/** Code block: a fenced listing. */
const codeFence = (fields: BlockFields): string | null => {
  if (typeof fields.code !== 'string' || !fields.code.trim()) return null
  const language = typeof fields.language === 'string' ? fields.language : ''
  return `\`\`\`${language}\n${fields.code}\n\`\`\``
}

/** Any block carrying a nested richText field named `content` (e.g. Banner). */
const nestedContent = (fields: BlockFields): string | null => {
  const content = fields.content as SerializedLexicalState | undefined
  return content?.root?.children ? lexicalToMarkdownString(content) : null
}

const linkEntry = (entry: unknown): string => {
  const link = entry && typeof entry === 'object' ? (entry as { link?: unknown }).link : undefined
  if (!link || typeof link !== 'object') return ''
  const { label, type, url } = link as { label?: unknown; type?: unknown; url?: unknown }
  if (typeof label !== 'string' || !label.trim()) return ''
  return type === 'custom' && typeof url === 'string' && url ? `[${label}](${url})` : label
}

/**
 * Block links (Actions and similar): each link's label as a list entry,
 * linked when the destination is a plain URL (references are bare ids here).
 */
const linkList = (links: unknown): string | null => {
  if (!Array.isArray(links)) return null
  const entries = links.map(linkEntry).filter((entry) => entry)
  return entries.length ? entries.map((entry) => `- ${entry}`).join('\n') : null
}

const itemEntry = (item: unknown): string => {
  if (!item || typeof item !== 'object') return ''
  const { label, title, description } = item as {
    label?: unknown
    title?: unknown
    description?: unknown
  }
  return [label, title, description]
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join('\n')
}

/**
 * Block items (Insights, Pill list, and similar): each item's label, title
 * and description. Single-line items read as a markdown list under the
 * block's eyebrow; multi-line items as paragraphs.
 */
const itemList = (fields: BlockFields): string | null => {
  if (!Array.isArray(fields.items)) return null
  const entries = fields.items.map(itemEntry).filter((entry) => entry.trim())
  if (!entries.length) return null
  const eyebrow =
    typeof fields.eyebrow === 'string' && fields.eyebrow.trim()
      ? `${fields.eyebrow.trim()}\n\n`
      : ''
  const singleLine = entries.every((entry) => !entry.includes('\n'))
  return (
    eyebrow + (singleLine ? entries.map((entry) => `- ${entry}`).join('\n') : entries.join('\n\n'))
  )
}

/** Carousel (and similar) slides: emit captions so they reach llms.txt / RAG. */
const slideCaptions = (slides: unknown): string | null => {
  if (!Array.isArray(slides)) return null
  const captions = slides
    .map((slide) =>
      slide && typeof slide === 'object' && 'caption' in slide
        ? String((slide as { caption?: unknown }).caption ?? '')
        : '',
    )
    .filter((caption) => caption.trim())
  return captions.length ? captions.join('\n\n') : null
}

/** The first shape a block's fields take, in priority order; null when none carries text. */
const blockToMarkdown = (node: LexicalNode): string | null => {
  const fields = node.fields as BlockFields | undefined
  if (!fields) return null
  return (
    codeFence(fields) ??
    nestedContent(fields) ??
    linkList(fields.links) ??
    itemList(fields) ??
    slideCaptions(fields.slides)
  )
}

const nodeToMarkdown = (node: LexicalNode): string | null => {
  switch (node.type) {
    case 'heading': {
      const level = Number((node.tag ?? 'h2').replace('h', '')) || 2
      return `${'#'.repeat(level)} ${childrenInline(node)}`
    }
    case 'paragraph': {
      const text = childrenInline(node)
      return text.trim() ? text : null
    }
    case 'quote':
      return childrenInline(node)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    case 'list':
      return listToMarkdown(node, 0)
    case 'horizontalrule':
      return '---'
    case 'block':
      return blockToMarkdown(node)
    // Uploads and relationships are visual/reference nodes; nothing useful to
    // emit at depth 0 (values are bare IDs).
    case 'upload':
    case 'relationship':
      return null
    default: {
      // Unknown container nodes: fall back to their inline text.
      const text = childrenInline(node)
      return text.trim() ? text : null
    }
  }
}

export const lexicalToMarkdownString = (data: unknown): string => {
  const state = data as SerializedLexicalState | null | undefined
  const children = state?.root?.children
  if (!children?.length) return ''

  return children
    .map(nodeToMarkdown)
    .filter((block): block is string => Boolean(block?.trim()))
    .join('\n\n')
}
