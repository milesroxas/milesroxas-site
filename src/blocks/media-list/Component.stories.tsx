import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { imageMedia, mediaFixture, streamVideoFixture, videoFixture } from '@/stories/fixtures'
import { MediaListBlock } from './Component'

const items = [
  {
    id: 'run',
    title: 'Run the cases',
    description: 'The agent works each case and logs the job.',
    media: streamVideoFixture,
  },
  {
    id: 'compare',
    title: 'Compare two drafts',
    description: 'A word level diff shows what the rule changed.',
    media: videoFixture,
  },
  {
    id: 'blind',
    title: 'Rate them blind',
    description: 'Score each layer before the judge shows its score.',
    media: imageMedia,
  },
  {
    id: 'results',
    title: 'Read the results',
    description: 'Watch the score lift from one version to the next.',
    media: mediaFixture,
  },
]

const controls = blockControls<typeof MediaListBlock>('mediaList')

const meta = {
  title: 'Blocks/Media and content/MediaList',
  component: MediaListBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'mediaList',
    eyebrow: 'Skill Studio',
    heading: 'Test a skill before you ship it',
    description: 'Four steps take a rule from a guess to a score you can defend.',
    items,
  },
} satisfies Meta<typeof MediaListBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoNumbers: Story = {
  args: { showNumbers: false },
}

export const MediaRight: Story = {
  args: { imagePosition: 'right' },
}

export const Large: Story = {
  args: { textSize: 'large' },
}
