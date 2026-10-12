import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Work } from '@/payload-types'
import { blockControls } from '@/stories/block-controls'
import { imageMedia, legacySpacingFixture, workCardData } from '@/stories/fixtures'
import { SliderBlock } from './Component'

const slides = Array.from({ length: 5 }, (_, i) => ({
  id: `slide-${i + 1}`,
  slide: {
    // The Slider keys its slides by image id, so each slide needs its own.
    image: { ...imageMedia, id: 100 + i },
    caption: `Slide ${i + 1} caption`,
  },
}))

const controls = blockControls<typeof SliderBlock>('slider')

const meta = {
  title: 'Blocks/Interactive/Slider',
  component: SliderBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'slider',
    space: legacySpacingFixture,
    introContent: {
      heading: 'Selected work',
      subheading: 'Identity, product and web projects from the last few years.',
      size: 'base',
      align: 'left',
    },
    slides,
  },
} satisfies Meta<typeof SliderBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The active slide scales up; its neighbours shrink and fade either side. */
export const Default: Story = {}

/** One 16:9 slide at a time, in a column capped at `max-w-4xl`. */
export const Single: Story = {
  args: { style: 'single' },
}

export const CenteredIntro: Story = {
  args: {
    introContent: {
      heading: 'Selected work',
      subheading: 'Identity, product and web projects from the last few years.',
      size: 'xl',
      align: 'center',
    },
  },
}

export const WithoutIntro: Story = {
  args: { introContent: {} },
}

/** A slide linked to a work or post opens it. */
export const LinkedSlides: Story = {
  args: {
    slides: slides.map(({ id, slide }) => ({
      id,
      slide: { ...slide, link: { relationTo: 'works' as const, value: workCardData as Work } },
    })),
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
