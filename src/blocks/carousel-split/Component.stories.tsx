import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '@/stories/fixtures'
import { CarouselSplitBlock } from './Component'

const slides = Array.from({ length: 4 }, (_, i) => ({
  id: `slide-${i + 1}`,
  media: mediaFixture,
  caption: `Slide ${i + 1} caption`,
}))

const body = richText(
  paragraph(
    text(
      'While many competitors demonstrated visual polish, most lacked narrative clarity. Abstract visuals often functioned as decoration rather than meaningful expression tied to domain context.',
    ),
  ),
  paragraph(
    text(
      'That gap was the opening: a visual language grounded in purpose and real-world relevance.',
    ),
  ),
)

const meta = {
  title: 'Blocks/MediaAndContent/CarouselSplit',
  component: CarouselSplitBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'carouselSplit',
    body,
    carouselPosition: 'right',
    heading: 'The gap in brand storytelling',
    slideSize: 'full',
    slides,
    theme: 'light',
  },
} satisfies Meta<typeof CarouselSplitBlock>

export default meta

type Story = StoryObj<typeof meta>

export const DeckRight: Story = {}

export const DeckLeft: Story = {
  args: { carouselPosition: 'left' },
}

export const WithEyebrow: Story = {
  args: { eyebrow: 'Differentiator' },
}

/** Two slides in view inside the deck column, the tighter of the two decks. */
export const HalfSlides: Story = {
  args: { slideSize: 'half' },
}

export const WithArrows: Story = {
  args: { showArrows: true },
}

export const Video: Story = {
  args: {
    slides: [
      { id: 'slide-1', media: videoFixture, caption: 'A moving slide' },
      { id: 'slide-2', media: mediaFixture, caption: 'A still one' },
    ],
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
