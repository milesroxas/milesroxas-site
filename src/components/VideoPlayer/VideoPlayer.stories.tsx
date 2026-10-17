import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { encodingVideoFixture, videoDocFixture } from '@/stories/fixtures'
import { VideoPlayer } from './index'

const meta = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A full-length Video document (docs/media.md, "Videos"): its loop plays muted under a play button, and a click plays the whole video with sound and the native controls in the same frame. The frame takes the video\'s own aspect ratio, so nothing moves. A real Stream upload, so it needs network.',
      },
    },
  },
  argTypes: {
    fill: { control: 'boolean' },
    priority: { control: 'boolean' },
  },
} satisfies Meta<typeof VideoPlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  args: { video: videoDocFixture },
  render: (args) => (
    <div className="w-xl">
      <VideoPlayer {...args} className="rounded-lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Play Content page scroll' })).toBeVisible()
  },
}

/** The click: the loop gives way to the whole video, with controls, in the same frame. */
export const Playing: Story = {
  ...Ready,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvasElement.querySelector('video[controls]')).not.toBeNull()
  },
}

/** Stream is still encoding: the poster and the play button, no loop, no length. */
export const Encoding: Story = {
  ...Ready,
  args: { video: encodingVideoFixture },
}

/** Inside a block's aspect frame (Stacked, Split): the loop covers it, the full video letterboxes in it. */
export const Fill: Story = {
  args: { fill: true, video: videoDocFixture },
  render: (args) => (
    <div className="relative aspect-21/9 w-xl overflow-hidden rounded-lg bg-muted">
      <VideoPlayer {...args} />
    </div>
  ),
}
