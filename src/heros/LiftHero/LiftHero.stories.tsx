import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { heading, paragraph, richText, text } from '@/stories/fixtures'
import { LiftHero } from './index'

const meta = {
  title: 'Heroes/Lift',
  component: LiftHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A dark opening whose figure is a score stepping up from the first version to the latest, over a dashed baseline. The fluoro readout is the gain.',
      },
    },
  },
  args: {
    type: 'lift',
    richText: richText(
      heading('h1', text('write better ai skills')),
      paragraph(
        text('Compare, grade and track changes to improve your skill files with confidence.'),
      ),
    ),
    links: [
      {
        id: 'download',
        link: { type: 'custom', url: '#install', label: 'Download for Mac' },
      },
      {
        id: 'github',
        link: { type: 'custom', url: 'https://github.com', label: 'Contribute on GitHub' },
      },
    ],
    media: null,
    lift: {
      eyebrow: 'A desktop app for improving AI skills',
      readoutLabel: '/brand-design, v0 to v1',
      first: { label: 'First runs, v0', score: 85 },
      latest: { label: 'Latest runs, v1', score: 98 },
      baseline: { label: 'Without the skill', score: 71 },
    },
  },
} satisfies Meta<typeof LiftHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A bigger gain from a lower start: the steps sit further apart. */
export const BigGain: Story = {
  args: {
    lift: {
      eyebrow: 'A desktop app for improving AI skills',
      readoutLabel: '/release-notes, v0 to v3',
      first: { label: 'First runs, v0', score: 58 },
      latest: { label: 'Latest runs, v3', score: 94 },
      baseline: { label: 'Without the skill', score: 40 },
    },
  },
}
