import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { paragraphNode, stateOf, textNode } from './lexical'
import { checkPreservation } from './preserve'
import type { Block, MediaInfo } from './rules'
import { transformLayout, transformPostContent } from './transform'

const heading = (tag: string, text: string) => ({
  type: 'heading',
  tag,
  version: 1,
  children: [textNode(text)],
})
const link = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [
    { type: 'link', version: 3, fields: { url: 'https://x.test' }, children: [textNode(text)] },
  ],
})
const lexical = (...nodes: ReturnType<typeof heading>[]) => stateOf(nodes as never)
const p = paragraphNode

const text = (...nodes: unknown[]) => ({
  content: 'text',
  text: { richText: stateOf(nodes as never) },
})
const sectionHeading = (words: string, eyebrow = '', align = 'left') => ({
  content: 'sectionHeading',
  sectionHeading: { eyebrow, align, content: stateOf([p(words)]) },
})
const mediaColumn = (id: number) => ({ content: 'media', media: { media: id } })
const slides = (...ids: number[]) => ids.map((id) => ({ slide: { image: id, caption: null } }))
const sliderColumn = (
  style = 'single',
  rows = slides(1, 2),
  introContent: Record<string, unknown> = {},
) => ({
  content: 'slider',
  slider: { theme: 'system', style, introContent, slides: rows },
})
const slider = (
  id: string,
  style = 'default',
  introContent: Record<string, unknown> = {},
): Block => ({
  blockType: 'slider',
  id,
  theme: 'light',
  style,
  introContent,
  slides: slides(1, 2),
})
const content = (id: string, columns: unknown[], theme = 'light'): Block => ({
  blockType: 'content',
  id,
  theme,
  columns,
})

const media: MediaInfo = new Map([
  [1, { width: 1600, height: 900 }],
  [2, { width: 800, height: 1200 }],
])

const LONG =
  'A statement that runs well past eighty characters, which is what makes it a statement.'

const sections = (layout: Block[]) => layout.filter((block) => block.blockType === 'section')
const children = (layout: Block[]) => sections(layout).flatMap((s) => (s.blocks as Block[]) ?? [])

describe('section headings (H rules)', () => {
  it('H1: a short heading opens a Standard', () => {
    const { layout, report } = transformLayout(
      [content('a', [sectionHeading('Short title', 'Kicker', 'center')])],
      media,
    )
    expect(report.map((line) => line.rule)).toEqual(['H1'])
    expect(children(layout)[0]).toMatchObject({
      blockType: 'richTransition',
      eyebrow: 'Kicker',
      heading: 'Short title',
      layout: 'centered',
    })
  })

  it('H2: a long statement with an eyebrow becomes an Offset', () => {
    const { layout } = transformLayout([content('a', [sectionHeading(LONG, 'The Vision')])], media)
    expect(children(layout)[0]).toMatchObject({
      blockType: 'featureHeadingOffset',
      heading: 'The Vision',
      bodySize: 'large',
    })
  })

  it('H3: a long statement without one becomes Rich text', () => {
    const { layout } = transformLayout([content('a', [sectionHeading(LONG)])], media)
    expect(children(layout)[0].blockType).toBe('richText')
  })
})

describe('text columns (T rules)', () => {
  it('T2: heading-and-paragraph runs become one Insights block', () => {
    const { layout, report } = transformLayout(
      [
        content('a', [
          text(heading('h3', '')),
          text(heading('h3', 'My Role'), p('I lead.')),
          text(heading('h3', 'Team'), p('We build.')),
        ]),
      ],
      media,
    )
    expect(report[0].rule).toBe('T2')
    const body = children(layout)[0].body as ReturnType<typeof stateOf>
    const block = body.root.children[0] as unknown as {
      fields: { items: { title: string; description: string }[] }
    }
    expect(block.fields.items.map((item) => item.title)).toEqual(['My Role', 'Team'])
  })

  it('T3: a lone heading column opens a split Standard', () => {
    const { layout, report } = transformLayout(
      [content('a', [text(p('Insights')), text(p('Body one.'), link('A link'))])],
      media,
    )
    expect(report[0].rule).toBe('T3')
    expect(children(layout)[0]).toMatchObject({
      blockType: 'richTransition',
      layout: 'split',
      heading: 'Insights',
    })
  })

  it('T4: anything else concatenates into Rich text', () => {
    const { report } = transformLayout(
      [content('a', [text(p('One'), link('Two')), text(p('Three'), p('Four'))])],
      media,
    )
    expect(report[0].rule).toBe('T4')
  })

  it('T1 clamps h4 to the Rich text editor’s h3', () => {
    const { layout } = transformLayout(
      [content('a', [text(heading('h4', 'Deep'), p('Copy'))])],
      media,
    )
    const body = children(layout)[0].body as ReturnType<typeof stateOf>
    expect((body.root.children[0] as { tag?: string }).tag).toBe('h3')
  })
})

describe('media and content (C and M rules)', () => {
  it('C1: one media and one text become Split narrow, heading lifted', () => {
    const { layout } = transformLayout(
      [
        content('a', [
          text(heading('h3', 'Overview'), p('Copy'), heading('h3', 'Impact'), p('More')),
          mediaColumn(1),
        ]),
      ],
      media,
    )
    const block = children(layout)[0]
    expect(block).toMatchObject({
      blockType: 'splitContentNarrow',
      heading: 'Overview',
      imagePosition: 'right',
      media: 1,
    })
    const body = block.body as ReturnType<typeof stateOf>
    expect(body.root.children.some((node) => (node as { tag?: string }).tag === 'h4')).toBe(true)
  })

  it('C2: two media become a Pair with the portrait in the portrait frame', () => {
    const { layout } = transformLayout([content('a', [mediaColumn(1), mediaColumn(2)])], media)
    expect(children(layout)[0]).toMatchObject({
      blockType: 'imagePair',
      portraitMedia: 2,
      landscapeMedia: 1,
      portraitPosition: 'right',
    })
  })

  it('M rules follow the caption layout', () => {
    const caption = stateOf([p('A caption')])
    const blocks: Block[] = [
      { blockType: 'mediaBlock', id: 'm1', media: 1, showCaption: false, richText: caption },
      { blockType: 'mediaBlock', id: 'm2', media: 1, fullWidth: true },
      {
        blockType: 'mediaBlock',
        id: 'm3',
        media: 1,
        showCaption: true,
        captionLayout: 'left',
        richText: caption,
      },
      {
        blockType: 'mediaBlock',
        id: 'm4',
        media: 1,
        showCaption: true,
        captionLayout: 'split-right',
        richText: caption,
      },
      {
        blockType: 'mediaBlock',
        id: 'm5',
        media: 1,
        showCaption: true,
        captionLayout: 'center',
        richText: caption,
      },
    ]
    const { report } = transformLayout(blocks, media)
    expect(report.map((line) => line.rule)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5'])
  })
})

describe('sliders (S and C5/C6 rules)', () => {
  it('S1: a top-level slider becomes a Carousel', () => {
    const { layout, report } = transformLayout([slider('s1')], media)
    expect(report.map((line) => line.rule)).toEqual(['S1'])
    expect(children(layout)[0]).toMatchObject({
      blockType: 'carousel',
      slideSize: 'half',
      width: 'contained',
      slides: [{ media: 1 }, { media: 2 }],
    })
  })

  it('S2: an intro heading opens a Standard before the Carousel', () => {
    const { report } = transformLayout(
      [slider('s1', 'single', { heading: 'Selected work', subheading: 'A subheading' })],
      media,
    )
    expect(report.map((line) => line.rule)).toEqual(['S2', 'S1'])
  })

  it('C5: a slider column on its own becomes a Carousel', () => {
    const { layout, report } = transformLayout([content('a', [sliderColumn()])], media)
    expect(report.map((line) => line.rule)).toEqual(['C5'])
    expect(children(layout)[0]).toMatchObject({ blockType: 'carousel', slideSize: 'full' })
  })

  it('C6: a slider column beside a section heading becomes a Carousel split', () => {
    const { layout, report } = transformLayout(
      [content('a', [sectionHeading(LONG, 'Differentiator'), sliderColumn()], 'dark')],
      media,
    )
    expect(report.map((line) => line.rule)).toEqual(['C6'])
    expect(sections(layout)[0]).toMatchObject({ customize: true, theme: 'inverted' })
    expect(children(layout)[0]).toMatchObject({
      blockType: 'carouselSplit',
      eyebrow: 'Differentiator',
      carouselPosition: 'right',
      slideSize: 'full',
      slides: [{ media: 1 }, { media: 2 }],
    })
    expect(children(layout)[0].heading).toBeUndefined()
  })

  it('C6: a leading short paragraph becomes the heading, the deck keeps its side', () => {
    const { layout } = transformLayout(
      [content('a', [sliderColumn(), text(p('Short title'), p(LONG))])],
      media,
    )
    const block = children(layout)[0]
    expect(block).toMatchObject({
      blockType: 'carouselSplit',
      heading: 'Short title',
      carouselPosition: 'left',
    })
    const body = block.body as ReturnType<typeof stateOf>
    expect(body.root.children).toHaveLength(1)
  })

  it('C6: the slider keeps its own intro heading as a Standard before the split', () => {
    const { report } = transformLayout(
      [
        content('a', [
          sectionHeading(LONG),
          sliderColumn('default', slides(1, 2), { heading: 'Selected work' }),
        ]),
      ],
      media,
    )
    expect(report.map((line) => line.rule)).toEqual(['S2', 'C6'])
  })

  it('a slider column beside a media column falls through to the C rules', () => {
    const { report } = transformLayout([content('a', [sliderColumn(), mediaColumn(1)])], media)
    expect(report.map((line) => line.rule)).toEqual(['C5', 'C3'])
  })

  it('C6 keeps every slide and every word', () => {
    const legacy = [content('a', [sectionHeading(LONG, 'Differentiator'), sliderColumn()])]
    const { layout } = transformLayout(legacy, media)
    expect(checkPreservation(legacy, layout).ok).toBe(true)
  })
})

describe('grouping', () => {
  it('opens a Section per opener and per band, and passes listings through', () => {
    const { layout } = transformLayout(
      [
        content('a', [sectionHeading('One')]),
        content('b', [text(p('Copy'))]),
        content('c', [text(p('Dark copy'))], 'dark'),
        { blockType: 'archive', id: 'x' },
        content('d', [sectionHeading('Two')]),
      ],
      media,
    )
    expect(layout.map((block) => block.blockType)).toEqual([
      'section',
      'section',
      'archive',
      'section',
    ])
    expect(layout[1]).toMatchObject({ customize: true, theme: 'inverted' })
  })

  it('leaves a composed layout unchanged', () => {
    const composed: Block[] = [{ blockType: 'section', blocks: [{ blockType: 'richText' }] }]
    expect(transformLayout(composed, media).changed).toBe(false)
  })
})

describe('posts', () => {
  it('splits the body at every h2 into Sections with a Prose Standard', () => {
    const { layout } = transformPostContent(
      lexical(
        p('Lead') as never,
        heading('h2', 'First'),
        p('One') as never,
        heading('h2', 'Second'),
        p('Two') as never,
      ),
    )
    expect(layout).toHaveLength(3)
    expect((layout[1].blocks as Block[])[0]).toMatchObject({
      blockType: 'richTransition',
      layout: 'prose',
      heading: 'First',
    })
  })
})

describe('preservation', () => {
  it('fails when a string or a media id goes missing', () => {
    const legacy = [content('a', [text(p('Keep me')), mediaColumn(7)])]
    expect(checkPreservation(legacy, []).ok).toBe(false)
    expect(checkPreservation(legacy, transformLayout(legacy, media).layout).ok).toBe(true)
  })

  it('ignores a column group its column does not render', () => {
    const legacy = [
      content('a', [
        { ...sectionHeading('Shown'), text: { richText: stateOf([p('Hidden leftover')]) } },
      ]),
    ]
    expect(checkPreservation(legacy, transformLayout(legacy, media).layout).ok).toBe(true)
  })
})

/**
 * Every work in the newest local snapshot (scripts/snapshots/, written by a
 * run of the CLI and gitignored) converts, keeps its copy and media, never
 * nests a Section, and uses only blocks a Work's Composition offers.
 */
const snapshotDir = path.resolve('scripts/snapshots')
const latest = fs.existsSync(snapshotDir)
  ? fs
      .readdirSync(snapshotDir)
      .filter((file) => file.startsWith('compose-layouts-') && file.endsWith('.json'))
      .sort()
      .pop()
  : undefined

describe.runIf(Boolean(latest))('production snapshot', () => {
  const WORK_BLOCKS = new Set([
    'section',
    'richTransition',
    'featureHeadingOffset',
    'fullMedia',
    'mediaContentSplit',
    'splitContentNarrow',
    'imagePair',
    'splitImageOffset',
    'featureImageStatement',
    'caption',
    'youtube',
    'richText',
    'code',
    'faq',
    'carousel',
    'carouselSplit',
    'featureTabs',
    'insightList',
    'slider',
    'tabs',
    'archive',
    'cta',
    'formBlock',
    'mediaBlock',
    'content',
    'callout',
  ])
  type Entry = {
    collection: string
    slug: string | null
    published: { layout?: Block[] } | null
    draft: { layout?: Block[] } | null
  }
  const entries = (
    latest ? (JSON.parse(fs.readFileSync(path.join(snapshotDir, latest), 'utf8')) as Entry[]) : []
  )
    // The layout the run converted: the latest draft when there is one.
    .map((entry) => ({ ...entry, layout: (entry.draft ?? entry.published)?.layout ?? [] }))

  it.each(
    entries.filter((entry) => entry.collection === 'works').map((entry) => [entry.slug, entry]),
  )('%s', (_slug, entry) => {
    const { layout, changed } = transformLayout(entry.layout, new Map())
    expect(changed).toBe(true)
    expect(checkPreservation(entry.layout, layout).ok).toBe(true)
    for (const block of layout) {
      expect(WORK_BLOCKS.has(String(block.blockType))).toBe(true)
      for (const child of (block.blocks as Block[] | undefined) ?? []) {
        expect(child.blockType).not.toBe('section')
        expect(WORK_BLOCKS.has(String(child.blockType))).toBe(true)
      }
    }
  })
})
