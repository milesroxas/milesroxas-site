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
import {
  clampHeadings,
  hasLink,
  headingsAsParagraphs,
  isBlankState,
  isHeading,
  type LexicalNode,
  paragraphsState,
  plainText,
  stateOf,
  topNodes,
  withoutBlankNodes,
  withTag,
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
  | 'C6'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'S1'
  | 'S2'
  | 'TB1'
  | 'TB2'

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
const SHORT_HEADING_CHARS = 80

/**
 * Legacy `theme`: `dark` is a forced-dark band, `light` and `system` are the
 * page. Migration `band_theme_roles` renamed them in place (`dark` to
 * `inverted`, `light` and `system` to `default`), so both spellings read the
 * same and a pre-migration snapshot restores as it did.
 */
const bandOf = (theme: unknown): Band =>
  theme === 'dark' || theme === 'inverted' ? 'dark' : 'light'

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
const isListingContent = (block: Block): boolean =>
  block.blockType === 'content' &&
  columnsOf(block).some((column) => column.content === 'work' || column.content === 'post')

/** A text column with nothing to say: the legacy grid's spacer. */
const isSpacer = (column: Column) =>
  column.content === 'text' && isBlankState(column.text?.richText)

// ---------------------------------------------------------------------------
// Section heading columns (H rules)
// ---------------------------------------------------------------------------

/**
 * Every converted section heading is a Standard on the Prose layout at h2.
 *
 * Prose is the only layout that binds an opener to the run it introduces: it
 * sits on the reading column and `SectionBand` closes the gap beneath it, so
 * the heading reads as the title of the blocks under it rather than as a band
 * of its own. The other layouts are page furniture, which is what made a
 * converted heading float above its own content. h2 is the level a section
 * opener holds in the page outline; the blocks below it never emit an h1.
 */
const SECTION_OPENER_LAYOUT = { layout: 'prose', headingLevel: 'h2' } as const

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
          ...SECTION_OPENER_LAYOUT,
          ...(rest.length ? { body: stateOf(headingsAsParagraphs(rest), content) } : {}),
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
          blockType: 'richTransition',
          heading: eyebrow,
          ...SECTION_OPENER_LAYOUT,
          body: stateOf(headingsAsParagraphs(nodes), content),
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
  const runs: { title: string; paragraphs: string[] }[] = []
  for (const node of nodes) {
    const last = runs[runs.length - 1]
    if (hasLink(node)) return null
    if (isHeading(node)) runs.push({ title: plainText(node).trim(), paragraphs: [] })
    else if (node.type === 'paragraph' && last) last.paragraphs.push(plainText(node).trim())
    else return null
  }
  if (!runs.length || runs.some((run) => run.paragraphs.length === 0)) return null
  return runs.map(({ title, paragraphs }) => ({ title, description: paragraphs.join('\n\n') }))
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
  const unit = (rule: RuleId, opens: boolean, block: Block): Unit[] => [
    { rule, source, band, opens, blocks: [block] },
  ]

  if (bodies.length === 1) {
    return unit('T1', false, {
      blockType: 'richText',
      body: stateOf(richTextNodes(bodies[0]), like),
    })
  }

  // Runs of heading-then-paragraphs read as prose, at the level the Insight
  // block used to render a title (h3), so they nest under the section's h2
  // opener. The nodes go through as authored: `runsOf` reads them only to
  // recognise the shape, and its plain-text titles would drop inline marks.
  const runs = bodies.map(runsOf)
  if (runs.every((run): run is Run[] => run !== null)) {
    return unit('T2', false, {
      blockType: 'richText',
      body: stateOf(clampHeadings(bodies.flat(), ['h3']), like),
    })
  }

  const lone = loneHeadingOf(bodies[0])
  if (lone) {
    return unit('T3', true, {
      blockType: 'richTransition',
      heading: lone,
      ...SECTION_OPENER_LAYOUT,
      body: stateOf(headingsAsParagraphs(bodies.slice(1).flat()), like),
    })
  }

  return unit('T4', false, {
    blockType: 'richText',
    body: stateOf(richTextNodes(bodies.flat()), like),
  })
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

/** Slides in view at once: the legacy `single` slider showed one, the others two. */
const slideSizeOf = (slider: Block): string => (slider.style === 'single' ? 'full' : 'half')

/** The Standard a slider's own intro heading opens with (S2), or null. */
const sliderIntroUnit = (slider: Block, source: string, band: Band): Unit | null => {
  const intro = (slider.introContent ?? {}) as {
    heading?: string | null
    subheading?: string | null
    align?: string | null
  }
  const heading = str(intro.heading)
  if (!heading) return null
  const subheading = str(intro.subheading)
  return {
    rule: 'S2',
    source,
    band,
    opens: true,
    blocks: [
      {
        blockType: 'richTransition',
        heading,
        ...SECTION_OPENER_LAYOUT,
        ...(subheading ? { body: paragraphsState([subheading]) } : {}),
      },
    ],
  }
}

const sliderUnits = (slider: Block, source: string, band: Band): Unit[] => {
  const slides = slidesOf(slider)
  const units: Unit[] = []
  const intro = sliderIntroUnit(slider, source, band)
  if (intro) units.push(intro)
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
          slideSize: slideSizeOf(slider),
          // A deck of its own is a full-bleed band: the legacy Slider ran the
          // window too, and a contained deck reads as a shrunken one.
          width: 'full-width',
        },
      ],
    })
  }
  return units
}

// ---------------------------------------------------------------------------
// A slider column beside its copy (C6)
// ---------------------------------------------------------------------------

/** The columns a Carousel split builds its copy stack from. */
const isCopyColumn = (column: Column) =>
  column.content === 'sectionHeading' || column.content === 'text'

/**
 * The copy stack beside the deck, from the heading and text columns in order:
 * the eyebrow of the first section heading that carries one, a leading heading
 * node or short paragraph as the block heading, and the rest as the body
 * (headings clamped to `h4`, the only level the content-column editor holds).
 */
const splitCopy = (copy: Column[]) => {
  const nodes: LexicalNode[] = []
  let eyebrow = ''
  let like: unknown
  for (const column of copy) {
    const state =
      column.content === 'sectionHeading' ? column.sectionHeading?.content : column.text?.richText
    if (column.content === 'sectionHeading' && !eyebrow)
      eyebrow = str(column.sectionHeading?.eyebrow)
    if (like === undefined && state) like = state
    nodes.push(...withoutBlankNodes(topNodes(state)))
  }
  const [first, ...rest] = nodes
  const firstText = plainText(first).trim()
  const leads =
    Boolean(first) &&
    !hasLink(first) &&
    (isHeading(first) || (first.type === 'paragraph' && firstText.length <= SHORT_HEADING_CHARS))
  const heading = leads ? firstText : ''
  const body = leads ? rest : nodes
  return {
    eyebrow,
    heading,
    body: body.length ? stateOf(clampHeadings(body, ['h4']), like) : null,
  }
}

/**
 * A Columns block that is one slider beside copy and nothing else becomes one
 * Carousel split (`carouselSplit`), the block that keeps a deck and its words
 * side by side as the legacy grid did. Null when the block is any other shape,
 * so the caller falls through to the C, H and T rules.
 *
 * The slider's own intro heading, when it has one, still opens a Standard
 * before the split (S2), exactly as it does for a top-level slider.
 */
const carouselSplitUnits = (columns: Column[], source: string, band: Band): Unit[] | null => {
  const sliders = columns.filter((column) => column.content === 'slider' && column.slider)
  const copy = columns.filter(isCopyColumn)
  if (sliders.length !== 1 || !copy.length || copy.length !== columns.length - 1) return null

  const slider = sliders[0].slider as Block
  const slides = slidesOf(slider)
  if (!slides.length) return null

  const { body, eyebrow, heading } = splitCopy(copy)
  if (!body && !heading && !eyebrow) return null

  const units: Unit[] = []
  const intro = sliderIntroUnit(slider, source, band)
  if (intro) units.push(intro)
  units.push({
    rule: 'C6',
    source,
    band,
    opens: false,
    blocks: [
      {
        blockType: 'carouselSplit',
        ...(eyebrow ? { eyebrow } : {}),
        ...(heading ? { heading } : {}),
        ...(body ? { body } : {}),
        slides,
        slideSize: slideSizeOf(slider),
        // The deck keeps the side the editor gave it: a slider column after
        // its copy column stays on the right.
        carouselPosition: columns.indexOf(sliders[0]) > columns.indexOf(copy[0]) ? 'right' : 'left',
      },
    ],
  })
  return units
}

// ---------------------------------------------------------------------------
// Columns block (content): H, then C and T
// ---------------------------------------------------------------------------

const isPortrait = (id: number, media: MediaInfo): boolean => {
  const { width, height } = media.get(id) ?? {}
  return Boolean(width && height && height >= width)
}

/** YouTube columns (C4) and slider columns (C5, after their S2 opener), in column order. */
const embedUnits = (columns: Column[], source: string, band: Band): Unit[] =>
  columns.flatMap((column): Unit[] => {
    const url = str(column.youTube?.url)
    if (column.content === 'youTube' && url) {
      return [
        {
          rule: 'C4',
          source,
          band,
          opens: false,
          blocks: [{ blockType: 'youtube', url, size: 'full' }],
        },
      ]
    }
    if (column.content !== 'slider' || !column.slider) return []
    return sliderUnits(column.slider, source, band).map((unit) => ({
      ...unit,
      rule: unit.rule === 'S1' ? 'C5' : unit.rule,
    }))
  })

/** One text column beside one media column (C1): a Split narrow, the media on its side. */
const splitNarrowUnit = (
  columns: Column[],
  text: Column,
  mediaColumn: Column,
  source: string,
  band: Band,
): Unit => {
  const mediaFirst = columns.indexOf(mediaColumn) < columns.indexOf(text)
  const nodes = withoutBlankNodes(topNodes(text.text?.richText))
  const [first, ...after] = nodes
  const leading = first && isHeading(first) ? plainText(first).trim() : ''
  const body = leading ? after : nodes
  return {
    rule: 'C1',
    source,
    band,
    opens: false,
    blocks: [
      {
        blockType: 'splitContentNarrow',
        ...(leading ? { heading: leading } : {}),
        body: stateOf(
          body.map((node) => withTag(node, 'h4')),
          text.text?.richText,
        ),
        media: mediaId(mediaColumn.media?.media),
        imagePosition: mediaFirst ? 'left' : 'right',
      },
    ],
  }
}

/** Two media columns and no copy (C2): an Image pair. */
const imagePairUnit = (medias: Column[], media: MediaInfo, source: string, band: Band): Unit => {
  const [a, b] = medias.map((column) => mediaId(column.media?.media) as number)
  // The square or portrait image takes the portrait frame; with two of a
  // kind the first does, as it came first.
  const portraitFirst = isPortrait(a, media) || !isPortrait(b, media)
  return {
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
  }
}

const contentUnits = (block: Block, media: MediaInfo): Unit[] => {
  const source = String(block.id ?? 'content')
  const band = bandOf(block.theme)
  const columns = columnsOf(block).filter((column) => !isSpacer(column))

  const split = carouselSplitUnits(columns, source, band)
  if (split) return split

  const headings = columns
    .filter((column) => column.content === 'sectionHeading')
    .map((column) => sectionHeadingUnit(column, source, band))
  const rest = columns.filter((column) => column.content !== 'sectionHeading')
  const texts = rest.filter((column) => column.content === 'text')
  const medias = rest.filter(
    (column) => column.content === 'media' && mediaId(column.media?.media) !== null,
  )
  const units = [...headings, ...embedUnits(rest, source, band)]

  // One text and one media column with nothing else beside them.
  if (medias.length === 1 && texts.length === 1 && rest.length === 2) {
    return [...units, splitNarrowUnit(rest, texts[0], medias[0], source, band)]
  }
  if (medias.length === 2 && texts.length === 0) {
    return [...units, imagePairUnit(medias, media, source, band)]
  }

  const captions = medias.map(
    (column): Unit => ({
      rule: 'C3',
      source,
      band,
      opens: false,
      blocks: [{ blockType: 'caption', media: mediaId(column.media?.media), size: 'full' }],
    }),
  )
  return [...units, ...captions, ...textUnits(texts, source, band)]
}

// ---------------------------------------------------------------------------
// Media block (M rules)
// ---------------------------------------------------------------------------

/** The caption a legacy Media block shows: on, and not empty. */
const visibleCaption = (block: Block): unknown =>
  block.showCaption === true && !isBlankState(block.richText) ? block.richText : null

const mediaUnit = (block: Block, rule: RuleId, next: Block): Unit => ({
  rule,
  source: String(block.id ?? 'mediaBlock'),
  band: bandOf(block.theme),
  opens: false,
  blocks: [next],
})

/**
 * A Media block with no caption on show (M1, M2). Stacked's full-bleed width
 * crops to 16:9, then 21:9 from `md`. The legacy block only ever cropped when
 * its `aspectRatio` was set, so a media authored as `original` keeps its own
 * shape and takes Caption even when it ran the window: a cropped 3D render is
 * a worse loss than a contained one.
 */
const bareMediaUnit = (block: Block, media: number): Unit =>
  block.fullWidth === true && block.aspectRatio !== 'original'
    ? mediaUnit(block, 'M2', {
        blockType: 'fullMedia',
        media,
        showContent: false,
        width: 'full-width',
      })
    : mediaUnit(block, 'M1', { blockType: 'caption', media, size: 'full' })

/** A Media block with its caption, by the legacy caption layout (M3, M4, M5). */
const captionedMediaUnit = (block: Block, media: number, caption: unknown): Unit => {
  const fullWidth = block.fullWidth === true
  const layout = String(block.captionLayout ?? 'center')
  const nodes = withoutBlankNodes(topNodes(caption))
  const body = stateOf(nodes, caption)
  if (layout === 'left' || layout === 'right') {
    return mediaUnit(block, 'M3', {
      blockType: 'fullMedia',
      media,
      showContent: true,
      body,
      contentPosition: layout,
      width: fullWidth ? 'full-width' : 'contained',
      ...(fullWidth ? {} : { aspectRatio: '16-9' }),
    })
  }
  if (layout === 'split-left' || layout === 'split-right') {
    return mediaUnit(block, 'M4', {
      blockType: 'splitContentNarrow',
      media,
      body: stateOf(
        nodes.map((node) => withTag(node, 'h4')),
        caption,
      ),
      imagePosition: layout === 'split-left' ? 'left' : 'right',
    })
  }
  return mediaUnit(block, 'M5', {
    blockType: 'caption',
    media,
    size: 'full',
    captionOverride: body,
  })
}

const mediaBlockUnits = (block: Block): Unit[] => {
  const media = mediaId(block.media)
  if (media === null) return []
  const caption = visibleCaption(block)
  return [caption ? captionedMediaUnit(block, media, caption) : bareMediaUnit(block, media)]
}

// ---------------------------------------------------------------------------
// Tab slider (TB1, TB2)
// ---------------------------------------------------------------------------

type Tab = {
  tabTitle?: string | null
  contentType?: string | null
  richText?: unknown
  slider?: Block | null
}

/** A Tab slider's own heading group: an eyebrow, a heading and a body. */
const tabsHeading = (block: Block) => {
  const heading = (block.heading ?? {}) as {
    eyebrow?: string | null
    heading?: string | null
    subheading?: string | null
  }
  const eyebrow = str(heading.eyebrow)
  const title = str(heading.heading)
  const subheading = str(heading.subheading)
  return {
    ...(eyebrow ? { eyebrow } : {}),
    ...(title ? { heading: title } : {}),
    ...(subheading ? { body: paragraphsState([subheading]) } : {}),
  }
}

/** The Standard the flattened fallback opens with, or nothing. */
const tabsHeadingBlocks = (block: Block): Block[] => {
  const { body, eyebrow, heading } = tabsHeading(block)
  if (!heading) return []
  return [
    {
      blockType: 'richTransition',
      ...(eyebrow ? { eyebrow } : {}),
      heading,
      layout: 'left',
      ...(body ? { body } : {}),
    },
  ]
}

/** Five tabs no longer fit the heading-sized strip; they pan on the small one. */
const SMALL_STRIP_TABS = 5

/**
 * A Tab slider whose every tab is a deck becomes one Carousel tabs block
 * (`carouselTabs`), so the reader still picks a direction instead of
 * scrolling through all of them. Every production Tab slider is this shape.
 * The block is a split that owns its copy column, so the legacy heading
 * group travels into it and nothing else is emitted: one legacy block, one
 * new block. Null when any tab is not a usable deck, so the caller falls
 * back to TB2.
 */
const carouselTabsUnit = (block: Block, source: string, band: Band): Unit | null => {
  const tabs = Array.isArray(block.tabs) ? (block.tabs as Tab[]) : []
  const decks = tabs.flatMap((tab) => {
    if (tab.contentType !== 'slider' || !tab.slider) return []
    const title = str(tab.tabTitle)
    const slides = slidesOf(tab.slider)
    // The block holds two tabs minimum and each deck two slides, as the
    // Carousel does: one of either is not a carousel, nor a set of choices.
    return title && slides.length >= 2 ? [{ slider: tab.slider, slides, title }] : []
  })
  if (decks.length < 2 || decks.length !== tabs.length) return null

  return {
    rule: 'TB1',
    source,
    band,
    opens: true,
    blocks: [
      {
        blockType: 'carouselTabs',
        // The block is a split and carries its own copy column, so the
        // heading group stays with its tabs instead of becoming a Standard a
        // whole band above them.
        ...tabsHeading(block),
        tabs: decks.map(({ slides, title }) => ({ title, slides })),
        slideSize: decks.every(({ slider }) => slider.style === 'single') ? 'full' : 'half',
        tabSize: decks.length >= SMALL_STRIP_TABS ? 'small' : 'default',
      },
    ],
  }
}

/**
 * The fallback for a Tab slider that mixes copy into its tabs (none in
 * production): the tabs are flattened into a Section, a Standard per tab
 * title, so nothing is lost even though the tabbing is.
 */
const flattenedTabsUnit = (block: Block, source: string, band: Band): Unit | null => {
  const blocks: Block[] = tabsHeadingBlocks(block)
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
        blocks.push({ blockType: 'carousel', slides, slideSize: 'full', width: 'full-width' })
    }
  }
  return blocks.length ? { rule: 'TB2', source, band, opens: true, blocks } : null
}

const tabsUnits = (block: Block): Unit[] => {
  const source = String(block.id ?? 'tabs')
  const band = bandOf(block.theme)
  const unit = carouselTabsUnit(block, source, band) ?? flattenedTabsUnit(block, source, band)
  return unit ? [unit] : []
}

/** Blocks the transform converts. Everything else passes through at the top level. */
const CONVERTED_BLOCKS = new Set(['content', 'mediaBlock', 'slider', 'tabs'])

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
