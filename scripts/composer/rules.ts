/**
 * The Phase 6 mapping rules (docs/composer-roadmap.md, "Rules"): each legacy
 * block becomes the sas-site block and variant that does the same job. A rule
 * returns units: blocks that travel together, whether they open a Section,
 * and which band they sit on. `transform.ts` groups units into Sections.
 *
 * Presentation fields with no sas-site equivalent are dropped on purpose
 * (D16): `space`, column `sizes`, `textSize`, caption layouts' type sizes,
 * `sectionHeading.size` / `style`, Caption `aspectRatio`, and a column
 * media's `fullWidth`. Copy and media are never dropped; `preserve.ts`
 * enforces that.
 */
import { randomBytes } from 'node:crypto'
import {
  clampHeadings,
  hasLink,
  isBlankState,
  isHeading,
  type LexicalNode,
  paragraphsState,
  plainText,
  stateOf,
  topNodes,
  withoutBlankNodes,
} from './lexical'

export type Block = { blockType?: string; id?: string | null; [key: string]: unknown }

export type Band = 'light' | 'dark'

export type RuleId =
  | 'H1'
  | 'H2'
  | 'H3'
  | 'T1'
  | 'T2'
  | 'T3'
  | 'T4'
  | 'C1'
  | 'C2'
  | 'C3'
  | 'C4'
  | 'C5'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'S1'
  | 'S2'
  | 'TB1'

/** What one rule produced for one legacy block. */
export type Unit = {
  rule: RuleId
  /** The legacy block the unit came from. */
  source: string
  blocks: Block[]
  /** The unit starts a new Section (it leads with a Standard or an Offset, or is a whole Section). */
  opens: boolean
  band: Band
}

/** Media dimensions, for the Pair rule's portrait / landscape split. */
export type MediaInfo = Map<number, { width?: number | null; height?: number | null }>

/** Heading at or under this many characters; longer section headings are statements. */
export const SHORT_HEADING_CHARS = 80

/** Legacy `theme`: `dark` is a forced-dark band, `light` and `system` are the page. */
export const bandOf = (theme: unknown): Band => (theme === 'dark' ? 'dark' : 'light')

const mediaId = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'number'
  )
    return (value as { id: number }).id
  return null
}

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

/** A Payload-shaped id for a Lexical block node and its array rows (24 hex chars). */
const objectId = () => randomBytes(12).toString('hex')

type Column = {
  id?: string | null
  content?: string | null
  text?: { richText?: unknown } | null
  sectionHeading?: { eyebrow?: string | null; content?: unknown; align?: string | null } | null
  media?: { media?: unknown } | null
  youTube?: { url?: string | null } | null
  slider?: Block | null
  work?: { works?: unknown } | null
  post?: { posts?: unknown } | null
}

const columnsOf = (block: Block): Column[] =>
  Array.isArray(block.columns) ? (block.columns as Column[]) : []

/** A Columns block that holds a work or a post card stays as it is (it is a listing, not copy). */
export const isListingContent = (block: Block): boolean =>
  block.blockType === 'content' &&
  columnsOf(block).some((column) => column.content === 'work' || column.content === 'post')

/** A text column with nothing to say: the legacy grid's spacer. */
const isSpacer = (column: Column) =>
  column.content === 'text' && isBlankState(column.text?.richText)

// ---------------------------------------------------------------------------
// Section heading columns (H rules)
// ---------------------------------------------------------------------------

const sectionHeadingUnit = (column: Column, source: string, band: Band): Unit => {
  const heading = column.sectionHeading ?? {}
  const content = heading.content
  const nodes = withoutBlankNodes(topNodes(content))
  const [first, ...rest] = nodes
  const firstText = plainText(first).trim()
  const eyebrow = str(heading.eyebrow)

  if (first && firstText.length <= SHORT_HEADING_CHARS) {
    return {
      rule: 'H1',
      source,
      band,
      opens: true,
      blocks: [
        {
          blockType: 'richTransition',
          ...(eyebrow ? { eyebrow } : {}),
          heading: firstText,
          layout: heading.align === 'center' ? 'centered' : 'left',
          ...(rest.length ? { body: stateOf(clampHeadings(rest, ['h2', 'h3']), content) } : {}),
        },
      ],
    }
  }

  if (eyebrow) {
    return {
      rule: 'H2',
      source,
      band,
      opens: true,
      blocks: [
        {
          blockType: 'featureHeadingOffset',
          heading: eyebrow,
          body: stateOf(nodes, content),
          bodySize: 'large',
        },
      ],
    }
  }

  return {
    rule: 'H3',
    source,
    band,
    opens: false,
    blocks: [{ blockType: 'richText', body: stateOf(clampHeadings(nodes, ['h2', 'h3']), content) }],
  }
}

// ---------------------------------------------------------------------------
// Text columns (T rules)
// ---------------------------------------------------------------------------

type Run = { title: string; description: string }

/**
 * A column made only of heading-then-paragraphs runs, as Insight items; null
 * when it is anything else (a link, a list, copy before the first heading, a
 * heading with nothing under it).
 */
const runsOf = (nodes: LexicalNode[]): Run[] | null => {
  const runs: Run[] = []
  let current: { title: string; paragraphs: string[] } | null = null
  for (const node of nodes) {
    if (hasLink(node)) return null
    if (isHeading(node)) {
      if (current && current.paragraphs.length === 0) return null
      if (current) runs.push({ title: current.title, description: current.paragraphs.join('\n\n') })
      current = { title: plainText(node).trim(), paragraphs: [] }
      continue
    }
    if (node.type !== 'paragraph' || !current) return null
    current.paragraphs.push(plainText(node).trim())
  }
  if (!current || current.paragraphs.length === 0) return null
  runs.push({ title: current.title, description: current.paragraphs.join('\n\n') })
  return runs
}

/** The lone heading a column holds (one heading node, or one short paragraph), or null. */
const loneHeadingOf = (nodes: LexicalNode[]): string | null => {
  if (nodes.length !== 1) return null
  const [node] = nodes
  const text = plainText(node).trim()
  if (isHeading(node)) return text || null
  if (node.type === 'paragraph' && text.length <= SHORT_HEADING_CHARS && !hasLink(node)) return text
  return null
}

/** The Rich text editor stops at h3: an h4 or deeper becomes h3, an h1 an h2. */
const richTextNodes = (nodes: LexicalNode[]) => clampHeadings(nodes, ['h2', 'h3'])

const textUnits = (columns: Column[], source: string, band: Band): Unit[] => {
  const bodies = columns.map((column) => withoutBlankNodes(topNodes(column.text?.richText)))
  const like = columns[0]?.text?.richText
  if (bodies.length === 0) return []

  if (bodies.length === 1) {
    return [
      {
        rule: 'T1',
        source,
        band,
        opens: false,
        blocks: [{ blockType: 'richText', body: stateOf(richTextNodes(bodies[0]), like) }],
      },
    ]
  }

  const runs = bodies.map(runsOf)
  if (runs.every((run): run is Run[] => run !== null)) {
    return [
      {
        rule: 'T2',
        source,
        band,
        opens: false,
        blocks: [
          {
            blockType: 'richText',
            body: stateOf([
              {
                type: 'block',
                version: 2,
                format: '',
                fields: {
                  id: objectId(),
                  blockType: 'insights',
                  blockName: '',
                  items: runs.flat().map((run) => ({ id: objectId(), ...run })),
                },
              },
            ]),
          },
        ],
      },
    ]
  }

  const lone = loneHeadingOf(bodies[0])
  if (lone) {
    return [
      {
        rule: 'T3',
        source,
        band,
        opens: true,
        blocks: [
          {
            blockType: 'richTransition',
            heading: lone,
            layout: 'split',
            body: stateOf(richTextNodes(bodies.slice(1).flat()), like),
          },
        ],
      },
    ]
  }

  return [
    {
      rule: 'T4',
      source,
      band,
      opens: false,
      blocks: [{ blockType: 'richText', body: stateOf(richTextNodes(bodies.flat()), like) }],
    },
  ]
}

// ---------------------------------------------------------------------------
// Sliders (S rules)
// ---------------------------------------------------------------------------

type Slide = { slide?: { image?: unknown; caption?: string | null } | null }

const slidesOf = (slider: Block): { media: number; caption?: string }[] =>
  (Array.isArray(slider.slides) ? (slider.slides as Slide[]) : []).flatMap((entry) => {
    const media = mediaId(entry.slide?.image)
    if (media === null) return []
    const caption = str(entry.slide?.caption)
    return [{ media, ...(caption ? { caption } : {}) }]
  })

export const sliderUnits = (slider: Block, source: string, band: Band): Unit[] => {
  const intro = (slider.introContent ?? {}) as {
    heading?: string | null
    subheading?: string | null
    align?: string | null
  }
  const slides = slidesOf(slider)
  const units: Unit[] = []
  const heading = str(intro.heading)
  if (heading) {
    const subheading = str(intro.subheading)
    units.push({
      rule: 'S2',
      source,
      band,
      opens: true,
      blocks: [
        {
          blockType: 'richTransition',
          heading,
          layout: intro.align === 'center' ? 'centered' : 'left',
          ...(subheading ? { body: paragraphsState([subheading]) } : {}),
        },
      ],
    })
  }
  if (slides.length) {
    units.push({
      rule: 'S1',
      source,
      band,
      opens: false,
      blocks: [
        {
          blockType: 'carousel',
          slides,
          slideSize: slider.style === 'single' ? 'full' : 'half',
          width: 'contained',
        },
      ],
    })
  }
  return units
}

// ---------------------------------------------------------------------------
// Columns block (content): H, then C and T
// ---------------------------------------------------------------------------

const isPortrait = (id: number, media: MediaInfo): boolean => {
  const { width, height } = media.get(id) ?? {}
  return Boolean(width && height && height >= width)
}

export const contentUnits = (block: Block, media: MediaInfo): Unit[] => {
  const source = String(block.id ?? 'content')
  const band = bandOf(block.theme)
  const columns = columnsOf(block).filter((column) => !isSpacer(column))
  const units: Unit[] = []

  for (const column of columns.filter((c) => c.content === 'sectionHeading')) {
    units.push(sectionHeadingUnit(column, source, band))
  }

  const rest = columns.filter((column) => column.content !== 'sectionHeading')
  const texts = rest.filter((column) => column.content === 'text')
  const medias = rest.filter(
    (column) => column.content === 'media' && mediaId(column.media?.media) !== null,
  )

  for (const column of rest) {
    if (column.content === 'youTube' && str(column.youTube?.url)) {
      units.push({
        rule: 'C4',
        source,
        band,
        opens: false,
        blocks: [{ blockType: 'youtube', url: str(column.youTube?.url), size: 'full' }],
      })
    }
    if (column.content === 'slider' && column.slider) {
      for (const unit of sliderUnits(column.slider, source, band))
        units.push({ ...unit, rule: unit.rule === 'S1' ? 'C5' : unit.rule })
    }
  }

  const others = rest.filter(
    (column) => !['text', 'media', 'youTube', 'slider'].includes(String(column.content)),
  )
  if (medias.length === 1 && texts.length === 1 && others.length === 0 && rest.length === 2) {
    const mediaFirst = rest.indexOf(medias[0]) < rest.indexOf(texts[0])
    const nodes = withoutBlankNodes(topNodes(texts[0].text?.richText))
    const [first, ...after] = nodes
    const leading = first && isHeading(first) ? plainText(first).trim() : ''
    const body = leading ? after : nodes
    units.push({
      rule: 'C1',
      source,
      band,
      opens: false,
      blocks: [
        {
          blockType: 'splitContentNarrow',
          ...(leading ? { heading: leading } : {}),
          body: stateOf(
            body.map((node) => (isHeading(node) ? { ...node, tag: 'h4' } : node)),
            texts[0].text?.richText,
          ),
          media: mediaId(medias[0].media?.media),
          imagePosition: mediaFirst ? 'left' : 'right',
        },
      ],
    })
    return units
  }

  if (medias.length === 2 && texts.length === 0) {
    const [a, b] = medias.map((column) => mediaId(column.media?.media) as number)
    const aPortrait = isPortrait(a, media)
    const bPortrait = isPortrait(b, media)
    // The square or portrait image takes the portrait frame; with two of a
    // kind the first does, as it came first.
    const portraitFirst = aPortrait || !bPortrait
    units.push({
      rule: 'C2',
      source,
      band,
      opens: false,
      blocks: [
        {
          blockType: 'imagePair',
          portraitMedia: portraitFirst ? a : b,
          landscapeMedia: portraitFirst ? b : a,
          portraitPosition: portraitFirst ? 'left' : 'right',
        },
      ],
    })
    return units
  }

  for (const column of medias) {
    units.push({
      rule: 'C3',
      source,
      band,
      opens: false,
      blocks: [{ blockType: 'caption', media: mediaId(column.media?.media), size: 'full' }],
    })
  }
  units.push(...textUnits(texts, source, band))
  return units
}

// ---------------------------------------------------------------------------
// Media block (M rules)
// ---------------------------------------------------------------------------

/** The caption a legacy Media block shows: on, and not empty. */
export const visibleCaption = (block: Block): unknown =>
  block.showCaption === true && !isBlankState(block.richText) ? block.richText : null

export const mediaBlockUnits = (block: Block): Unit[] => {
  const source = String(block.id ?? 'mediaBlock')
  const band = bandOf(block.theme)
  const media = mediaId(block.media)
  if (media === null) return []
  const caption = visibleCaption(block)
  const fullWidth = block.fullWidth === true
  const layout = String(block.captionLayout ?? 'center')
  const unit = (rule: RuleId, next: Block): Unit => ({
    rule,
    source,
    band,
    opens: false,
    blocks: [next],
  })

  if (!caption) {
    return fullWidth
      ? [unit('M2', { blockType: 'fullMedia', media, showContent: false, width: 'full-width' })]
      : [unit('M1', { blockType: 'caption', media, size: 'full' })]
  }

  const body = stateOf(withoutBlankNodes(topNodes(caption)), caption)
  if (layout === 'left' || layout === 'right') {
    return [
      unit('M3', {
        blockType: 'fullMedia',
        media,
        showContent: true,
        body,
        contentPosition: layout,
        width: fullWidth ? 'full-width' : 'contained',
        ...(fullWidth ? {} : { aspectRatio: '16-9' }),
      }),
    ]
  }
  if (layout === 'split-left' || layout === 'split-right') {
    return [
      unit('M4', {
        blockType: 'splitContentNarrow',
        media,
        body: stateOf(
          withoutBlankNodes(topNodes(caption)).map((node) =>
            isHeading(node) ? { ...node, tag: 'h4' } : node,
          ),
          caption,
        ),
        imagePosition: layout === 'split-left' ? 'left' : 'right',
      }),
    ]
  }
  return [unit('M5', { blockType: 'caption', media, size: 'full', captionOverride: body })]
}

// ---------------------------------------------------------------------------
// Tab slider (TB1)
// ---------------------------------------------------------------------------

type Tab = {
  tabTitle?: string | null
  contentType?: string | null
  richText?: unknown
  slider?: Block | null
}

export const tabsUnits = (block: Block): Unit[] => {
  const source = String(block.id ?? 'tabs')
  const band = bandOf(block.theme)
  const heading = (block.heading ?? {}) as {
    eyebrow?: string | null
    heading?: string | null
    subheading?: string | null
  }
  const blocks: Block[] = []
  const title = str(heading.heading)
  if (title) {
    const eyebrow = str(heading.eyebrow)
    const subheading = str(heading.subheading)
    blocks.push({
      blockType: 'richTransition',
      ...(eyebrow ? { eyebrow } : {}),
      heading: title,
      layout: 'left',
      ...(subheading ? { body: paragraphsState([subheading]) } : {}),
    })
  }
  for (const tab of Array.isArray(block.tabs) ? (block.tabs as Tab[]) : []) {
    const tabTitle = str(tab.tabTitle)
    if (tabTitle) blocks.push({ blockType: 'richTransition', heading: tabTitle, layout: 'left' })
    if (tab.contentType === 'richText' && !isBlankState(tab.richText)) {
      blocks.push({
        blockType: 'richText',
        body: stateOf(richTextNodes(withoutBlankNodes(topNodes(tab.richText))), tab.richText),
      })
    }
    if (tab.slider) {
      const slides = slidesOf(tab.slider)
      if (slides.length)
        blocks.push({ blockType: 'carousel', slides, slideSize: 'full', width: 'contained' })
    }
  }
  return blocks.length ? [{ rule: 'TB1', source, band, opens: true, blocks }] : []
}

/** Blocks the transform converts. Everything else passes through at the top level. */
export const CONVERTED_BLOCKS = new Set(['content', 'mediaBlock', 'slider', 'tabs'])

/** Whether a block will be converted (a Columns block with a listing stays). */
export const isConvertible = (block: Block): boolean =>
  CONVERTED_BLOCKS.has(String(block.blockType)) && !isListingContent(block)

/** The rules, keyed by the legacy block type. */
export const unitsFor = (block: Block, media: MediaInfo): Unit[] => {
  switch (block.blockType) {
    case 'content':
      return contentUnits(block, media)
    case 'mediaBlock':
      return mediaBlockUnits(block)
    case 'slider':
      return sliderUnits(block, String(block.id ?? 'slider'), bandOf(block.theme))
    case 'tabs':
      return tabsUnits(block)
    default:
      return []
  }
}
