/**
 * Phase 6 layout transform (docs/composer-roadmap.md): legacy blocks become
 * the sas-site run, grouped into Sections. Pure: a layout in, a layout and a
 * report out. The CLI (`scripts/compose-layouts.ts`) reads, snapshots and
 * writes.
 *
 * Grouping, walking the layout in order with one Section open:
 * - a unit that opens (a Standard or an Offset, or a Tab slider's whole
 *   Section) closes the open Section and starts its own;
 * - a band change (legacy `dark` against `light` / `system`) does the same;
 * - a block that passes through (archive, cta, formBlock, callout, a Columns
 *   block holding work or post cards, anything already composed) closes the
 *   open Section and stays at the top level, untouched.
 */
import {
  clampHeadings,
  isHeading,
  type LexicalNode,
  plainText,
  stateOf,
  topNodes,
  withoutBlankNodes,
} from './lexical'
import type { Override } from './overrides'
import {
  type Band,
  type Block,
  isConvertible,
  type MediaInfo,
  type RuleId,
  type Unit,
  unitsFor,
} from './rules'

export type ReportLine = {
  /** The legacy block (id and type), or `pass` for a block kept as it was. */
  source: string
  rule: RuleId | 'pass' | 'keep'
  produced: string[]
}

export type LayoutResult = {
  layout: Block[]
  changed: boolean
  report: ReportLine[]
}

/** Section fields for a band: the page band is the default Section. */
const sectionFor = (band: Band, blocks: Block[]): Block => ({
  blockType: 'section',
  ...(band === 'dark' ? { customize: true, theme: 'inverted' } : { customize: false }),
  blocks,
})

/**
 * The editor's label for a legacy block carries onto the first block made
 * from it, so the Composition list still reads "Intro", "My Role".
 */
const labelled = (blocks: Block[], blockName: unknown): Block[] =>
  typeof blockName === 'string' && blockName.trim() && blocks.length
    ? [{ ...blocks[0], blockName: blockName.trim() }, ...blocks.slice(1)]
    : blocks

/** The top-level layout, built with at most one Section open (the grouping rules above). */
const sectionGrouping = () => {
  const out: Block[] = []
  let open: { band: Band; blocks: Block[] } | null = null

  const close = () => {
    if (open?.blocks.length) out.push(sectionFor(open.band, open.blocks))
    open = null
  }

  return {
    /** A block that stays at the top level, untouched. */
    pass: (block: Block) => {
      close()
      out.push(block)
    },
    add: (unit: Unit) => {
      if (unit.opens || !open || open.band !== unit.band) {
        close()
        open = { band: unit.band, blocks: [] }
      }
      open.blocks.push(...unit.blocks)
    },
    done: (): Block[] => {
      close()
      return out
    },
  }
}

export const transformLayout = (
  layout: Block[],
  media: MediaInfo,
  overrides: Record<string, Override> = {},
): LayoutResult => {
  const grouping = sectionGrouping()
  const report: ReportLine[] = []
  let changed = false

  for (const block of layout) {
    const id = String(block.id ?? '')
    const source = `${block.blockType}:${id}`
    const keep = Boolean(id) && overrides[id] === 'keep'

    if (!isConvertible(block) || keep) {
      grouping.pass(block)
      report.push({ source, rule: keep ? 'keep' : 'pass', produced: [String(block.blockType)] })
      continue
    }

    changed = true
    for (const unit of labelledUnits(unitsFor(block, media), block.blockName)) {
      grouping.add(unit)
      report.push({
        source,
        rule: unit.rule,
        produced: unit.blocks.map((b) => String(b.blockType)),
      })
    }
  }

  return { layout: grouping.done(), changed, report }
}

const labelledUnits = (units: Unit[], blockName: unknown): Unit[] =>
  units.length
    ? [{ ...units[0], blocks: labelled(units[0].blocks, blockName) }, ...units.slice(1)]
    : units

// ---------------------------------------------------------------------------
// Posts: the Lexical body becomes Sections, split at every h2
// ---------------------------------------------------------------------------

const isSplit = (node: LexicalNode) => isHeading(node) && (node.tag === 'h1' || node.tag === 'h2')

type BlockNodeFields = { blockType?: string; [key: string]: unknown }

const inlineBlockType = (node: LexicalNode): string | null =>
  node.type === 'block'
    ? String((node.fields as BlockNodeFields | undefined)?.blockType ?? '')
    : null

/** The block an inline Code or Media block leaves the body as, or null for a node that stays. */
const blockOutOfBody = (node: LexicalNode): Block | null => {
  const type = inlineBlockType(node)
  const fields = (node.fields ?? {}) as BlockNodeFields
  if (type === 'code') {
    return {
      blockType: 'code',
      language: fields.language ?? 'typescript',
      code: fields.code ?? '',
    }
  }
  if (type !== 'mediaBlock' || !fields.media) return null
  const media =
    typeof fields.media === 'object' ? (fields.media as { id?: unknown }).id : fields.media
  return { blockType: 'caption', media, size: 'full' }
}

type PostSection = { heading: string | null; nodes: LexicalNode[] }

const postSections = (nodes: LexicalNode[]): PostSection[] => {
  const sections: PostSection[] = []
  for (const node of nodes) {
    if (isSplit(node)) {
      sections.push({ heading: plainText(node).trim(), nodes: [] })
      continue
    }
    if (!sections.length) sections.push({ heading: null, nodes: [] })
    sections[sections.length - 1].nodes.push(node)
  }
  return sections
}

const postSectionBlocks = (section: PostSection, content: unknown): Block[] => {
  const blocks: Block[] = []
  if (section.heading) {
    blocks.push({
      blockType: 'richTransition',
      heading: section.heading,
      layout: 'prose',
      headingLevel: 'h2',
    })
  }
  let run: LexicalNode[] = []
  const flush = () => {
    if (run.length)
      blocks.push({
        blockType: 'richText',
        body: stateOf(clampHeadings(run, ['h2', 'h3']), content),
      })
    run = []
  }
  for (const node of section.nodes) {
    const out = blockOutOfBody(node)
    if (!out) {
      run.push(node)
      continue
    }
    flush()
    blocks.push(out)
  }
  flush()
  return blocks
}

/**
 * One Section per h2: a Standard in the Prose layout carrying the heading,
 * then the passage as Rich text. Inline Code and Media blocks leave the body
 * as Code and Caption blocks in place; a Banner stays in the body (the Rich
 * text editor offers it). Copy before the first h2 opens a Section of its own
 * with no heading. `content` is left untouched; the route prefers `layout`.
 */
export const transformPostContent = (content: unknown): LayoutResult => {
  const nodes = withoutBlankNodes(topNodes(content))
  if (!nodes.length) return { layout: [], changed: false, report: [] }

  const report: ReportLine[] = []
  const layout = postSections(nodes).map((section, index) => {
    const blocks = postSectionBlocks(section, content)
    report.push({
      source: `content:section-${index + 1}`,
      rule: 'T1',
      produced: blocks.map((b) => String(b.blockType)),
    })
    return { blockType: 'section', customize: false, blocks } as Block
  })

  return { layout, changed: true, report }
}

/** One line per block: `section[richTransition, richText] · archive`. */
export const describeLayout = (layout: Block[]): string =>
  layout
    .map((block) =>
      block.blockType === 'section'
        ? `section${(block as { theme?: string }).theme === 'inverted' ? '(dark)' : ''}[${((block.blocks as Block[]) ?? []).map((child) => child.blockType).join(', ')}]`
        : String(block.blockType),
    )
    .join(' · ')
