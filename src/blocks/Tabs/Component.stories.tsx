import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { blockControls } from '@/stories/block-controls'
import {
  heading,
  imageMedia,
  legacySpacingFixture,
  paragraph,
  richText,
  text,
} from '@/stories/fixtures'
import { TabsBlock } from './Component'

const tabs = [
  {
    id: 'tab-discovery',
    tabTitle: 'Discovery',
    contentType: 'richText' as const,
    richText: richText(
      heading('h3', text('Start from what the business already knows')),
      paragraph(
        text(
          'Interviews with leadership, sales and product turn scattered knowledge into one account of what the company does and why it matters.',
        ),
      ),
    ),
  },
  {
    id: 'tab-design',
    tabTitle: 'Design',
    contentType: 'richText' as const,
    richText: richText(
      heading('h3', text('A system before a page')),
      paragraph(
        text(
          'Type, colour and motion are set once as tokens, so every page after the first is assembled rather than redrawn.',
        ),
      ),
    ),
  },
  {
    id: 'tab-build',
    tabTitle: 'Build',
    contentType: 'slider' as const,
    slider: {
      style: 'single' as const,
      slides: Array.from({ length: 3 }, (_, i) => ({
        id: `build-slide-${i + 1}`,
        slide: { image: { ...imageMedia, id: 100 + i }, caption: `Build ${i + 1}` },
      })),
    },
  },
]

const controls = blockControls<typeof TabsBlock>('tabs')

/** Works only: a heading over a tab list beside panels of rich text or a Slider. */
const meta = {
  title: 'Blocks/Interactive/TabSlider',
  component: TabsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'tabs',
    space: legacySpacingFixture,
    heading: {
      eyebrow: 'Process',
      heading: 'How an engagement runs',
      subheading: 'Three stages, each with its own deliverable.',
      style: 'default',
    },
    tabs,
  },
} satisfies Meta<typeof TabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A Slider tab renders the legacy Slider inside the panel. */
export const SliderTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tab = canvas.getByRole('tab', { name: 'Build' })
    await userEvent.click(tab)
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'))
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Build 1')
  },
}

export const CenteredHeading: Story = {
  args: {
    heading: {
      eyebrow: 'Process',
      heading: 'How an engagement runs',
      style: 'center',
    },
  },
}

export const Inverted: Story = {
  args: { theme: 'inverted' },
}
