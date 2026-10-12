import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { blockControls } from '@/stories/block-controls'
import {
  cloudflareImageFixture,
  mediaFixture,
  streamVideoFixture,
  videoFixture,
} from '@/stories/fixtures'
import { CarouselBlock } from './Component'

const slides = Array.from({ length: 5 }, (_, i) => ({
  id: `slide-${i + 1}`,
  media: mediaFixture,
  caption: `Slide ${i + 1} caption`,
}))

const controls = blockControls<typeof CarouselBlock>('carousel')

const meta = {
  title: 'Blocks/Interactive/Carousel',
  component: CarouselBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'carousel',
    slides,
    showArrows: true,
  },
} satisfies Meta<typeof CarouselBlock>

export default meta

type Story = StoryObj<typeof meta>

/**
 * One caption line under the deck: it shows the slide nearest the scroll
 * position, while each slide keeps its own caption for readers.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll('[data-carousel-caption]')
    await expect(lines).toHaveLength(1)
    await expect(lines[0]).toHaveAttribute('aria-hidden', 'true')
    await expect(canvasElement.querySelectorAll('[data-caption] .sr-only')).toHaveLength(
      slides.length,
    )
  },
}

export const WithoutArrows: Story = {
  args: {
    showArrows: false,
  },
}

export const FullWidth: Story = {
  args: {
    width: 'full-width',
    slideSize: 'half',
  },
}

/**
 * Full-width block with full-width slides: the only configuration where a
 * slide runs the whole window, so its corner radius comes off from `md`.
 * Resize below `md` and the slide insets to a peeking card, radius included.
 */
export const FullBleed: Story = {
  args: {
    width: 'full-width',
    slideSize: 'full',
  },
}

export const Half: Story = {
  args: {
    slideSize: 'half',
  },
}

export const Third: Story = {
  args: {
    slideSize: 'third',
  },
}

/**
 * Too few slides to fill a wide window, so embla drops the loop: snaps stay
 * centred and the deck opens on its middle slide, a neighbour either side.
 */
export const ShortDeck: Story = {
  args: {
    slideSize: 'third',
    slides: slides.slice(0, 3),
  },
}

/**
 * Phone width: every size drops to a three-quarter slide so a sliver of each
 * neighbour stays in frame, and the arrows overlay the slides instead of
 * reserving an outer gutter.
 */
export const MobilePeek: Story = {
  args: {
    slideSize: 'third',
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
}

/** No slide carries a caption, so the deck reserves no caption line. */
export const WithoutCaptions: Story = {
  args: {
    slides: slides.map((slide) => ({ ...slide, caption: null })),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-carousel-caption]')).toBeNull()
  },
}

/**
 * Some slides uncaptioned: the caption line keeps its one-line slot and
 * empties for them, so the block never moves as captions come and go.
 */
export const SomeCaptions: Story = {
  args: {
    slides: slides.map((slide, i) => (i % 2 ? { ...slide, caption: null } : slide)),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-carousel-caption]')).toHaveLength(1)
  },
}

export const MixedAspectRatios: Story = {
  args: {
    slideSize: 'third',
    slides: [
      { id: 'wide', media: mediaFixture, caption: 'Wide (1200×630)' },
      { id: 'square', media: { ...mediaFixture, width: 630, height: 630 }, caption: 'Square' },
      { id: 'short', media: { ...mediaFixture, width: 1200, height: 300 }, caption: 'Short' },
      { id: 'wide-2', media: mediaFixture, caption: 'Wide (1200×630)' },
    ],
  },
}

/**
 * Portrait media: at four fifths of a desktop column a 4:5 slide would run
 * taller than the window, so the deck is capped at the width where its
 * tallest media reaches 70svh, and the image `sizes` hint honours the same
 * cap. Shrink the browser height and the deck follows.
 */
export const Portrait: Story = {
  args: {
    slideSize: 'half',
    slides: slides.map((slide) => ({
      ...slide,
      media: {
        ...mediaFixture,
        alt: 'Window onto a mountain landscape',
        url: 'https://media.suits-sandals.com/window-landscape-mountains-poster.jpg',
        filename: 'window-landscape-mountains-poster.jpg',
        width: 1920,
        height: 2400,
      },
    })),
  },
}

export const WithVideo: Story = {
  args: {
    slides: [slides[0], { id: 'slide-video', media: videoFixture, caption: null }, slides[2]],
  },
}

/**
 * Production media: a Cloudflare Images slide focuses in from a blurred 32px
 * copy of itself, and a Stream slide paints its sized poster over the paused
 * video, dissolving it once the slide is active. Needs network.
 */
export const CloudflareMedia: Story = {
  args: {
    slideSize: 'half',
    slides: [
      { id: 'cf-image-1', media: cloudflareImageFixture, caption: 'Cloudflare Images' },
      { id: 'cf-stream', media: streamVideoFixture, caption: 'Cloudflare Stream' },
      { id: 'cf-image-2', media: cloudflareImageFixture, caption: 'Cloudflare Images' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-carousel-poster]')).toHaveLength(1)
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
