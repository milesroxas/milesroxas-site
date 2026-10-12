import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Container } from './index'

const meta = {
  title: 'Components/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page widths: `default` is the site column with its breakpoint max-widths and gutters, `narrow` a 40rem reading column, `full` edge to edge with no gutters.',
      },
    },
  },
  args: {
    children: (
      <div className="rounded-sm bg-muted p-6 font-mono text-sm">The column content sits here.</div>
    ),
  },
  argTypes: {
    width: {
      control: 'inline-radio',
      options: ['default', 'narrow', 'full'],
    },
    children: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
  args: { width: 'narrow' },
}

export const Full: Story = {
  args: { width: 'full' },
}
