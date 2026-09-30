import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/stories/fixtures'
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

const meta = {
  title: 'Blocks/Interactive/CarouselTabs',
  component: CarouselTabsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'carouselTabs',
    slideSize: 'full',
    tabSize: 'default',
    tabs,
    theme: 'light',
  },
} satisfies Meta<typeof CarouselTabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithArrows: Story = {
  args: { showArrows: true },
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

export const Dark: Story = {
  args: { theme: 'dark' },
}
