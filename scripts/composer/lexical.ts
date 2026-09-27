/**
 * Small Lexical helpers for the composer transform (docs/composer-roadmap.md,
 * Phase 6). They read and rebuild serialized editor state as plain JSON: no
 * editor, no DOM, so the transform runs anywhere the Local API does.
 */

export type LexicalNode = {
  type: string
  tag?: string
  text?: string
  children?: LexicalNode[]
  fields?: Record<string, unknown>
  [key: string]: unknown
}

export type LexicalState = {
  root: LexicalNode & { children: LexicalNode[] }
  [key: string]: unknown
}

export const isLexicalState = (value: unknown): value is LexicalState =>
  typeof value === 'object' &&
  value !== null &&
  'root' in value &&
  typeof (value as LexicalState).root === 'object' &&
  Array.isArray((value as LexicalState).root?.children)

/** The top-level nodes of a state, or none. */
export const topNodes = (state: unknown): LexicalNode[] =>
  isLexicalState(state) ? state.root.children : []

/** Every text string under a node, concatenated in reading order. */
export const plainText = (node: LexicalNode | undefined): string => {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return '\n'
  return (node.children ?? []).map(plainText).join('')
}

/** A state's words, block by block, blank blocks dropped. */
export const blockTexts = (state: unknown): string[] =>
  topNodes(state)
    .map((node) => plainText(node).trim())
    .filter(Boolean)

/** Whether a node says nothing: no text, no inline block, no upload. */
export const isBlankNode = (node: LexicalNode): boolean => {
  if (node.type === 'block' || node.type === 'upload' || node.type === 'inlineBlock') return false
  if (node.type === 'text') return !(node.text ?? '').trim()
  return (node.children ?? []).every(isBlankNode)
}

export const isBlankState = (state: unknown): boolean => topNodes(state).every(isBlankNode)

export const isHeading = (node: LexicalNode): boolean => node.type === 'heading'

export const hasLink = (node: LexicalNode): boolean =>
  node.type === 'link' || node.type === 'autolink' || (node.children ?? []).some(hasLink)

/** Every text node's string (trimmed, non-empty): what the preservation check looks for. */
export const textStrings = (value: unknown): string[] => {
  const out: string[] = []
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
    if (typeof node !== 'object' || node === null) return
    const record = node as LexicalNode
    if (record.type === 'text' && typeof record.text === 'string') {
      const text = record.text.trim()
      if (text) out.push(text)
      return
    }
    for (const child of Object.values(record)) walk(child)
  }
  walk(isLexicalState(value) ? value.root : value)
  return out
}

const ROOT_DEFAULTS = { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr' }

/**
 * A state holding `nodes`, with the root props of `like` when given (the
 * state the nodes came from), so a split body keeps its source's direction.
 */
export const stateOf = (nodes: LexicalNode[], like?: unknown): LexicalState => {
  const root = isLexicalState(like) ? like.root : undefined
  return {
    root: {
      ...ROOT_DEFAULTS,
      ...(root ? { format: root.format, indent: root.indent, direction: root.direction } : {}),
      type: 'root',
      children: nodes,
    },
  }
}

export const textNode = (text: string): LexicalNode => ({
  type: 'text',
  text,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

export const paragraphNode = (text: string): LexicalNode => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children: [textNode(text)],
})

/** Plain-text paragraphs, one per non-empty line block. */
export const paragraphsState = (texts: string[]): LexicalState =>
  stateOf(texts.filter((text) => text.trim()).map(paragraphNode))

/** A heading node moved to another level; its content is untouched. */
export const withTag = (node: LexicalNode, tag: string): LexicalNode =>
  isHeading(node) ? { ...node, tag } : node

/**
 * Headings the target editor cannot hold become the nearest level it can:
 * `allowed` is ordered from the top level down.
 */
export const clampHeadings = (nodes: LexicalNode[], allowed: string[]): LexicalNode[] => {
  const rank = (tag: string) => Number(tag.replace('h', ''))
  return nodes.map((node) => {
    if (!isHeading(node) || !node.tag || allowed.includes(node.tag)) return node
    const level = rank(node.tag)
    const fit = allowed.find((tag) => rank(tag) >= level) ?? allowed[allowed.length - 1] ?? node.tag
    return withTag(node, fit)
  })
}

/** Drops blank top-level blocks (the spacer paragraphs legacy bodies used for rhythm). */
export const withoutBlankNodes = (nodes: LexicalNode[]): LexicalNode[] =>
  nodes.filter((node) => !isBlankNode(node))
