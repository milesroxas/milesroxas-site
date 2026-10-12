import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type {
  BannerBlock,
  RichTextInsightsBlock,
  RichTextPillListBlock,
  YouTubeBlock,
} from '@/payload-types'
import { blockControls } from '@/stories/block-controls'
import {
  blockNode,
  heading,
  insightMarkFixtures,
  paragraph,
  richText,
  text,
} from '@/stories/fixtures'
import { RichTextBlock } from './Component'

const paragraphs = [
  paragraph(
    text('Technical companies often have more substance than their brands know how to carry.'),
  ),
  paragraph(
    text(
      'The work is not about making the business sound simple. It is about deciding what people need to understand first, then creating a clear path into the expertise, technology, and methodology behind it.',
    ),
  ),
  paragraph(
    text(
      'Strong B2B branding connects positioning, messaging, identity, and experience. It helps people understand what you do, why your approach matters, and why they should keep paying attention.',
    ),
  ),
]

const body = richText(
  heading('h2', text('Complexity is not the problem. Unclear value is.')),
  ...paragraphs,
)

/** The Insight list's six insights, so the two blocks are seen to share one item. */
const insightItems: RichTextInsightsBlock['items'] = [
  {
    id: 'category',
    media: insightMarkFixtures.twoCircles,
    title: 'Known category. Blurry difference.',
    description: 'Buyers understand what you offer, but not why your version is worth choosing.',
  },
  {
    id: 'room',
    media: insightMarkFixtures.twoCirclesDashed,
    title: 'Clear in the room. Unclear online.',
    description:
      'Leadership can explain the value in a meeting. The website cannot yet do the same work on its own.',
  },
  {
    id: 'outgrown',
    media: insightMarkFixtures.nestedSquares,
    title: 'A story the business has outgrown.',
    description: 'The company has changed. The brand is still describing an earlier version of it.',
  },
  {
    id: 'versions',
    media: insightMarkFixtures.threeLines,
    title: 'Too many versions of the truth.',
    description: 'Sales, marketing, product, and leadership all explain the business differently.',
  },
  {
    id: 'capable',
    media: insightMarkFixtures.halfCircle,
    title: 'More capable than it looks.',
    description: 'The identity and digital experience undersell the quality of the organization.',
  },
]

const insights = (count: number, id = 'insights') =>
  blockNode({
    blockType: 'insights',
    id,
    items: insightItems.slice(0, count),
  } satisfies RichTextInsightsBlock)

/** The Paper "Chip List" frame: an inventory of what the business knows. */
const pillList = (id = 'pills', eyebrow: string | null = 'What the business knows') =>
  blockNode({
    blockType: 'pillList',
    id,
    eyebrow,
    items: [
      'The full methodology',
      'Every feature and capability',
      'Years of accumulated expertise',
      'Internal language and nuance',
      'Every use case',
      'Everything that makes the offering different',
    ].map((label) => ({ id: label, label })),
  } satisfies RichTextPillListBlock)

const INLINE_CODE = 16

const list = (tag: 'ul' | 'ol', ...items: string[]) => ({
  type: 'list',
  listType: tag === 'ul' ? 'bullet' : 'number',
  tag,
  start: 1,
  children: items.map((item, index) => ({
    type: 'listitem',
    children: [text(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    value: index + 1,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const youtube = blockNode({
  blockType: 'youtube',
  id: 'youtube',
  url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  title: 'Me at the zoo',
} satisfies YouTubeBlock)

const banner = blockNode({
  blockType: 'banner',
  id: 'banner',
  style: 'info',
  content: richText(paragraph(text('Kept from the post body this block replaced.'))),
} satisfies BannerBlock)

const controls = blockControls<typeof RichTextBlock>('richText')

const meta = {
  title: 'Blocks/Text/RichText',
  component: RichTextBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'richText',
    body,
  },
} satisfies Meta<typeof RichTextBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The Paper frame: an inline heading over three paragraphs, columns 3-6. */
export const Default: Story = {}

/** Body copy only, no inline heading. */
export const ParagraphsOnly: Story = {
  args: {
    body: richText(...paragraphs),
  },
}

/** Large moves the reading column up a step (`proseBodyClassNames`). */
export const LargeText: Story = {
  args: { textSize: 'large' },
}

/** Everything else the editor offers in prose: h3, both lists and inline code. */
export const ListsAndCode: Story = {
  args: {
    body: richText(
      heading('h2', text('What changes on a page')),
      paragraphs[0],
      heading('h3', text('In the build')),
      list('ul', 'One renderer per block', 'Typed fixtures for every story', 'No bespoke motion'),
      heading('h3', text('In the release')),
      list('ol', 'Push to dev', 'Review the preview', 'Release to main'),
      paragraph(
        text('Run '),
        text('pnpm check:block-controls', INLINE_CODE),
        text(' after changing the fields of a block.'),
      ),
    ),
  },
}

/** A YouTube embed from the toolbar stays in the reading column. Needs network. */
export const WithYouTube: Story = {
  args: {
    body: richText(...body.root.children, youtube, paragraphs[1]),
  },
}

/** A Banner stays inline in the prose: the post body transform keeps them there. */
export const WithBanner: Story = {
  args: {
    body: richText(heading('h2', text('Before the move')), banner, ...paragraphs),
  },
}

/** The one-insight Paper frame: the run fills the reading column. */
export const OneInsight: Story = {
  args: {
    body: richText(...body.root.children, insights(1)),
  },
}

/** The two-insight Paper frame: two share the reading column. */
export const TwoInsights: Story = {
  args: {
    body: richText(...body.root.children, insights(2)),
  },
}

/** Three or more open out to column 8, three per row. */
export const ManyInsights: Story = {
  args: {
    body: richText(...body.root.children, insights(5)),
  },
}

/** Copy continues after a run, and a second run keeps its own reveal beats. */
export const InsightsBetweenCopy: Story = {
  args: {
    body: richText(
      ...body.root.children,
      insights(3, 'first'),
      paragraph(text('Each pattern has a different fix, and most companies show more than one.')),
      insights(2, 'second'),
    ),
  },
}

/** The Paper frame: eyebrow over a wrapping cloud of pills in the reading column. */
export const PillList: Story = {
  args: {
    body: richText(...body.root.children, pillList()),
  },
}

/** Pills with no eyebrow: the cloud alone. */
export const PillListNoEyebrow: Story = {
  args: {
    body: richText(...body.root.children, pillList('pills', null)),
  },
}

/** Both toolbar blocks in one body, copy between them. */
export const PillListWithInsights: Story = {
  args: {
    body: richText(
      ...body.root.children,
      pillList(),
      paragraph(text('Each pattern has a different fix, and most companies show more than one.')),
      insights(3),
    ),
  },
}

export const Inverted: Story = {
  args: {
    body: richText(...body.root.children, pillList(), insights(3)),
    theme: 'inverted',
  },
}
