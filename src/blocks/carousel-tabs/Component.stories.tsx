import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Media } from '@/payload-types'
import { blockControls } from '@/stories/block-controls'
import {
  cloudflareImageFixture,
  imageMedia,
  mediaFixture,
  paragraph,
  richText,
  streamVideoFixture,
  text,
  videoFixture,
} from '@/stories/fixtures'
import { CarouselTabsBlock } from './Component'

const slides = (count: number, label: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${label}-slide-${i + 1}`,
    media: mediaFixture,
    caption: `${label} ${i + 1}`,
  }))

const tabs = [
  { id: 'tab-1', title: 'Ambitious', slides: slides(3, 'Ambitious') },
  { id: 'tab-2', title: 'Bold', slides: slides(4, 'Bold') },
  { id: 'tab-3', title: 'Intelligent', slides: slides(3, 'Intelligent') },
]

const body = richText(paragraph(text('3 distinct ways to tell an impactful story.')))

const controls = blockControls<typeof CarouselTabsBlock>('carouselTabs')

const meta = {
  title: 'Blocks/Interactive/CarouselTabs',
  component: CarouselTabsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'carouselTabs',
    body,
    eyebrow: 'Discovery',
    heading: 'Finding solutions to expand visual language',
    tabs,
  },
} satisfies Meta<typeof CarouselTabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** No copy column: the strip and deck still take columns 4-8. */
export const WithoutCopy: Story = {
  args: { body: null, eyebrow: null, heading: null },
}

/** Two slides in view inside each panel. */
export const HalfSlides: Story = {
  args: { slideSize: 'half' },
}

/** Five or more tabs: the small strip keeps them on one row that pans. */
export const SmallStrip: Story = {
  args: {
    tabSize: 'small',
    tabs: [
      ...tabs,
      { id: 'tab-4', title: 'Correlate', slides: slides(4, 'Correlate') },
      { id: 'tab-5', title: 'Validate', slides: slides(4, 'Validate') },
    ],
  },
}

export const Video: Story = {
  args: {
    tabs: [
      {
        id: 'tab-1',
        title: 'Moving',
        slides: [
          { id: 'a', media: videoFixture, caption: 'A moving slide' },
          { id: 'b', media: mediaFixture, caption: 'A still one' },
        ],
      },
      { id: 'tab-2', title: 'Still', slides: slides(2, 'Still') },
    ],
  },
}

/**
 * Production media: each deck's pictures focus in from a blurred Cloudflare
 * copy, and a swap holds the old deck until the new one's first picture can
 * paint. Needs network.
 */
export const CloudflareMedia: Story = {
  args: {
    tabs: [
      {
        id: 'tab-1',
        title: 'Images',
        slides: [1, 2, 3].map((n) => ({
          id: `cf-image-${n}`,
          media: cloudflareImageFixture,
          caption: `Cloudflare Images ${n}`,
        })),
      },
      {
        id: 'tab-2',
        title: 'Stream',
        slides: [
          { id: 'cf-stream', media: streamVideoFixture, caption: 'Cloudflare Stream' },
          { id: 'cf-still', media: cloudflareImageFixture, caption: 'A still beside it' },
        ],
      },
    ],
  },
}

/**
 * One deck captioned, one not: the shared frame reserves the caption line
 * for every deck, so a swap never moves the page.
 */
export const CaptionsInOneTab: Story = {
  args: {
    tabs: [
      { id: 'tab-1', title: 'Captioned', slides: slides(3, 'Captioned') },
      {
        id: 'tab-2',
        title: 'Uncaptioned',
        slides: slides(3, 'Uncaptioned').map((slide) => ({ ...slide, caption: null })),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tab = canvas.getByRole('tab', { name: 'Uncaptioned' })
    await userEvent.click(tab)
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'))
    // The old deck stays mounted through the hold and the dissolve.
    await waitFor(
      () => expect(canvasElement.querySelectorAll('[data-carousel-caption]')).toHaveLength(1),
      { timeout: 4000 },
    )
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

const board = (name: string, width: number, height: number): Media => ({
  ...imageMedia,
  id: name.length + 10,
  alt: `Placeholder board ${name}`,
  filename: `fpo-${name}.jpg`,
  height,
  mimeType: 'image/jpeg',
  url: `/textures/fpo-${name}.jpg`,
  width,
})

const boards = [
  board('vault', 1280, 720),
  board('gentlebeast', 1064, 625),
  board('arturo', 1064, 625),
  imageMedia,
]

const boardSlides = (count: number, label: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${label}-board-${i + 1}`,
    media: boards[i % boards.length],
    caption: `${label} ${i + 1}`,
  }))

/** The pile: the next boards fan out behind the current one. */
export const Stack: Story = {
  args: {
    deckStyle: 'stack',
    tabs: [
      { id: 'tab-1', title: 'Ambitious', slides: boardSlides(4, 'Ambitious') },
      { id: 'tab-2', title: 'Bold', slides: boardSlides(3, 'Bold') },
      { id: 'tab-3', title: 'Intelligent', slides: boardSlides(5, 'Intelligent') },
    ],
  },
}

export const StackInverted: Story = {
  args: { ...Stack.args, theme: 'inverted' },
}

/**
 * Decks of different shapes and lengths: the block keeps one height across
 * every tab, and a one-slide deck keeps the readout's room.
 */
export const MixedDecks: Story = {
  args: {
    tabs: [
      { id: 'tab-1', title: 'Wide', slides: slides(3, 'Wide') },
      {
        id: 'tab-2',
        title: 'Taller',
        slides: [boards[1], boards[0], boards[2]].map((media, i) => ({
          id: `taller-${i + 1}`,
          media,
          caption: `Taller ${i + 1}`,
        })),
      },
      { id: 'tab-3', title: 'Single', slides: [{ id: 'single-1', media: boards[0] }] },
    ],
  },
}
