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

export const transformLayout = (
  layout: Block[],
  media: MediaInfo,
  overrides: Record<string, Override> = {},
): LayoutResult => {
  const out: Block[] = []
  const report: ReportLine[] = []
  let open: { band: Band; blocks: Block[] } | null = null
  let changed = false

  const close = () => {
    if (open?.blocks.length) out.push(sectionFor(open.band, open.blocks))
    open = null
  }

  for (const block of layout) {
    const id = String(block.id ?? '')
    const override = id ? overrides[id] : undefined

    if (!isConvertible(block) || override === 'keep') {
      close()
      out.push(block)
      report.push({
        source: `${block.blockType}:${id}`,
        rule: override === 'keep' ? 'keep' : 'pass',
        produced: [String(block.blockType)],
      })
      continue
    }

    changed = true
    const units: Unit[] = labelledUnits(unitsFor(block, media), block.blockName)
    for (const unit of units) {
      if (unit.opens || !open || open.band !== unit.band) {
        close()
        open = { band: unit.band, blocks: [] }
      }
      open.blocks.push(...unit.blocks)
      report.push({
        source: `${block.blockType}:${id}`,
        rule: unit.rule,
        produced: unit.blocks.map((b) => String(b.blockType)),
      })
    }
  }
  close()

  return { layout: out, changed, report }
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

  const sections: { heading: string | null; nodes: LexicalNode[] }[] = []
  for (const node of nodes) {
    if (isSplit(node)) {
      sections.push({ heading: plainText(node).trim(), nodes: [] })
      continue
    }
    if (!sections.length) sections.push({ heading: null, nodes: [] })
    sections[sections.length - 1].nodes.push(node)
  }

  const report: ReportLine[] = []
  const layout = sections.map((section, index) => {
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
      const type = inlineBlockType(node)
      const fields = (node.fields ?? {}) as BlockNodeFields
      if (type === 'code') {
        flush()
        blocks.push({
          blockType: 'code',
          language: fields.language ?? 'typescript',
          code: fields.code ?? '',
        })
      } else if (type === 'mediaBlock' && fields.media) {
        flush()
        const media =
          typeof fields.media === 'object' ? (fields.media as { id?: unknown }).id : fields.media
        blocks.push({ blockType: 'caption', media, size: 'full' })
      } else {
        run.push(node)
      }
    }
    flush()
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
