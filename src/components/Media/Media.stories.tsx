import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  cloudflareImageFixture,
  imageMedia,
  streamVideoFixture,
  videoFixture,
} from '@/stories/fixtures'
import { Media } from './index'

const meta = {
  title: 'Components/Media',
  component: Media,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A Payload media document as an image or a looping muted video, by `mimeType`. Images prefer the Cloudflare Images URL and let Cloudflare resize them; videos prefer Cloudflare Stream once it is ready, else the stored file, and paint a poster until the first frame.',
      },
    },
  },
  argTypes: {
    autoPlay: { control: 'boolean' },
    priority: { control: 'boolean' },
    ref: { table: { disable: true } },
    src: { table: { disable: true } },
  },
} satisfies Meta<typeof Media>

export default meta
type Story = StoryObj<typeof meta>

export const Image: Story = {
  args: {
    resource: imageMedia,
  },
  render: (args) => (
    <div className="w-xl">
      <Media {...args} />
    </div>
  ),
}

export const ImageFill: Story = {
  args: {
    fill: true,
    resource: imageMedia,
  },
  render: (args) => (
    <div className="relative aspect-video w-xl overflow-hidden rounded-md">
      <Media {...args} className="h-full w-full object-cover" />
    </div>
  ),
}

/**
 * Served by Cloudflare Images over the stored file. Built, the loader swaps
 * the `public` variant for a flexible one at each width; `next dev` and
 * Storybook's dev server leave images unoptimized, so they show `public`.
 */
export const CloudflareImage: Story = {
  args: {
    resource: cloudflareImageFixture,
    size: '24rem',
  },
  render: (args) => (
    <div className="w-sm">
      <Media {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole('img')
    await expect(img.getAttribute('src')).toMatch(/^https:\/\/imagedelivery\.net\//)
  },
}

/** The stored file, played when it scrolls into view. */
export const Video: Story = {
  args: {
    resource: videoFixture,
  },
  render: (args) => (
    <div className="w-xl">
      <Media {...args} videoClassName="w-full" />
    </div>
  ),
}

/**
 * A Stream video, paused so only the poster loads: Stream's thumbnail at the
 * frame's size (1280 wide, 1920 with `priority`). Turn on autoPlay to stream it.
 */
export const StreamPoster: Story = {
  args: {
    autoPlay: false,
    fill: true,
    resource: streamVideoFixture,
  },
  render: (args) => (
    <div className="relative aspect-video w-xl overflow-hidden rounded-md bg-muted">
      <Media {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const video = canvasElement.querySelector('video')
    await expect(video).toHaveAttribute(
      'poster',
      `${streamVideoFixture.cloudflareStreamThumbnailUrl}?width=1280&fit=clip`,
    )
    await expect(video).toHaveAttribute('preload', 'none')
  },
}

/** Stream has not finished encoding: the stored file plays meanwhile. */
export const StreamNotReady: Story = {
  args: {
    resource: { ...streamVideoFixture, url: videoFixture.url, cloudflareStreamReady: false },
  },
  render: (args) => (
    <div className="w-xl">
      <Media {...args} videoClassName="w-full" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('video source')).toHaveAttribute(
      'src',
      videoFixture.url,
    )
  },
}

/** A document with no file renders nothing rather than a broken image. */
export const WithoutFile: Story = {
  args: {
    resource: { ...imageMedia, url: null },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).toBeNull()
  },
}
