import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ContentBlock as ContentBlockData, Post, Work } from '@/payload-types'
import { blockControls } from '@/stories/block-controls'
import {
  heading,
  imageMedia,
  legacySpacingFixture,
  paragraph,
  postCardData,
  richText,
  text,
  workCardData,
} from '@/stories/fixtures'
import { ContentBlock } from './Component'

type Column = NonNullable<ContentBlockData['columns']>[number]

const textColumn = (id: string, title: string, copy: string, sizes: Column['sizes'] = 'oneThird') =>
  ({
    id,
    sizes,
    content: 'text',
    text: { richText: richText(heading('h3', text(title)), paragraph(text(copy))) },
  }) satisfies Column

const engineering = textColumn(
  'engineering',
  'Engineering',
  'Next.js and Payload sites the team can edit without calling a developer.',
)

const threeColumns: Column[] = [
  textColumn(
    'strategy',
    'Strategy',
    'Positioning and messaging that say what the business does before they say how.',
  ),
  textColumn(
    'design',
    'Design',
    'Identity and interface built as one system, so the site and the brand never drift.',
  ),
  {
    ...engineering,
    text: {
      ...engineering.text,
      enableLink: true,
      link: { type: 'index', indexPage: 'works', label: 'See the work', appearance: 'outline' },
    },
  },
]

const controls = blockControls<typeof ContentBlock>('content')

/**
 * Columns: the free-form escape hatch. Each column picks its content (text, a
 * section heading, a work or post card, media, a Slider or a YouTube embed)
 * and a width on the 12-column grid.
 */
const meta = {
  title: 'Blocks/Custom/Columns',
  component: ContentBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'content',
    space: legacySpacingFixture,
    columns: threeColumns,
  },
} satisfies Meta<typeof ContentBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Three thirds of rich text; the last carries its optional link. */
export const ThreeColumns: Story = {}

export const HeadingBesideText: Story = {
  args: {
    columns: [
      {
        id: 'heading',
        sizes: 'oneThird',
        content: 'sectionHeading',
        sectionHeading: {
          eyebrow: 'Approach',
          content: richText(paragraph(text('One system from brand to build'))),
          size: 'lg',
          align: 'left',
        },
      },
      textColumn(
        'body',
        'Why it holds together',
        'The same decisions carry from the identity into the components, so a new page is assembled from parts that already agree.',
        'twoThirds',
      ),
    ],
  },
}

export const CenteredHeading: Story = {
  args: {
    columns: [
      {
        id: 'heading',
        sizes: 'full',
        content: 'sectionHeading',
        sectionHeading: {
          eyebrow: 'Capabilities',
          content: richText(paragraph(text('What an engagement covers'))),
          size: 'xl',
          align: 'center',
        },
      },
      ...threeColumns,
    ],
  },
}

export const MediaAndText: Story = {
  args: {
    columns: [
      {
        id: 'media',
        sizes: 'half',
        content: 'media',
        media: { media: imageMedia, aspectRatio: 'landscape' },
      },
      textColumn(
        'text',
        'A brand that reads at every size',
        'From the favicon to the hero, one set of rules decides what shows and what steps back.',
        'half',
      ),
    ],
  },
}

export const Cards: Story = {
  args: {
    columns: [
      {
        id: 'work',
        sizes: 'half',
        content: 'work',
        work: { works: workCardData as Work },
      },
      {
        id: 'post',
        sizes: 'half',
        content: 'post',
        post: { posts: postCardData as Post },
      },
    ],
  },
}

export const SliderColumn: Story = {
  args: {
    columns: [
      {
        id: 'slider',
        sizes: 'full',
        content: 'slider',
        slider: {
          style: 'default',
          slides: Array.from({ length: 4 }, (_, i) => ({
            id: `slide-${i + 1}`,
            slide: { image: { ...imageMedia, id: 100 + i }, caption: `Slide ${i + 1}` },
          })),
        },
      },
    ],
  },
}

/** Needs network: the embed loads from YouTube. */
export const YouTubeColumn: Story = {
  args: {
    columns: [
      {
        id: 'youtube',
        sizes: 'twoThirds',
        content: 'youTube',
        youTube: { url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', aspectRatio: 'landscape' },
      },
      textColumn(
        'text',
        'The first upload',
        'Nineteen seconds that set the format for everything after.',
      ),
    ],
  },
}

/** Edge to edge: a full column's media drops its container and corners. */
export const FullWidth: Story = {
  args: {
    containerWidth: 'fullWidth',
    columns: [
      {
        id: 'media',
        sizes: 'full',
        content: 'media',
        media: { media: imageMedia, aspectRatio: 'landscape' },
      },
    ],
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
