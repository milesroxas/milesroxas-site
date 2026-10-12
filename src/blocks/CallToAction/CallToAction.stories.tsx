import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { blockControls } from '@/stories/block-controls'
import { simpleRichText } from '@/stories/fixtures'
import { CallToActionBlock } from './Component'

const controls = blockControls<typeof CallToActionBlock>('cta')

const meta = {
  title: 'Blocks/FormsAndCTAs/CallToAction',
  component: CallToActionBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: controls.argTypes,
  args: {
    ...controls.args,
    blockType: 'cta',
    richText: simpleRichText,
    links: [
      {
        id: 'cta-link-1',
        link: {
          type: 'custom',
          url: '/contact',
          label: 'Get in touch',
          appearance: 'default',
        },
      },
    ],
  },
} satisfies Meta<typeof CallToActionBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The most the editor allows: a primary link and an outline one beside it. */
export const TwoLinks: Story = {
  args: {
    links: [
      {
        id: 'cta-link-1',
        link: {
          type: 'custom',
          url: '/contact',
          label: 'Get in touch',
          appearance: 'default',
        },
      },
      {
        id: 'cta-link-2',
        link: {
          type: 'custom',
          url: '/works',
          label: 'View work',
          appearance: 'outline',
        },
      },
    ],
  },
}

export const TextOnly: Story = {
  args: { links: [] },
}
