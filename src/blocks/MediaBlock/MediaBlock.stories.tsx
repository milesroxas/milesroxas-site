import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import {
  cloudflareImageFixture,
  imageMedia,
  legacySpacingFixture,
  paragraph,
  richText,
  text,
  videoFixture,
} from '@/stories/fixtures'
import { MediaBlock } from './Component'

const caption = richText(
  paragraph(text('A caption set under or beside the media, written in the block itself.')),
)

const controls = blockControls<typeof MediaBlock>('mediaBlock')

const meta = {
  title: 'Blocks/Media/MediaBlock',
  component: MediaBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'mediaBlock',
    space: legacySpacingFixture,
    media: imageMedia,
    richText: caption,
  },
} satisfies Meta<typeof MediaBlock>

export default meta
type Story = StoryObj<typeof meta>

/** The editor's defaults: a 16:9 frame, the caption centred under it. */
export const Landscape: Story = {}

export const Square: Story = {
  args: { aspectRatio: 'square' },
}

export const Portrait: Story = {
  args: { aspectRatio: 'portrait' },
}

/** No frame: the media keeps its own proportions. */
export const Original: Story = {
  args: { aspectRatio: 'original' },
}

export const FullWidth: Story = {
  args: { fullWidth: true },
}

export const WithoutCaption: Story = {
  args: { showCaption: false },
}

export const CaptionLeft: Story = {
  args: { captionLayout: 'left' },
}

export const CaptionRight: Story = {
  args: { captionLayout: 'right' },
}

/** The caption takes a fixed column beside the media from `md`. */
export const SplitLeft: Story = {
  args: { captionLayout: 'split-left' },
}

export const SplitRight: Story = {
  args: { captionLayout: 'split-right' },
}

export const LargeCaption: Story = {
  args: { textSize: '2xl' },
}

export const Video: Story = {
  args: { media: videoFixture },
}

/** A production upload served by Cloudflare Images. Needs network. */
export const CloudflareImage: Story = {
  args: { media: cloudflareImageFixture },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
