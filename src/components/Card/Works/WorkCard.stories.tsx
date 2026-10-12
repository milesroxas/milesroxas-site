import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { workCardData } from '@/stories/fixtures'
import { WorkCard } from './Component'

const meta = {
  title: 'Components/WorkCard',
  component: WorkCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Work listing card, labelled View under the site cursor. Clicking it opens the case study through its picture (`src/heros/WorkHero/morph.ts`): the page fades away around the picture, then the picture hands off in place to the hero frame through a shared view transition. Storybook mocks the router, so only the exit plays; with no navigation, the page comes back after 4 s.',
      },
    },
  },
  args: {
    doc: workCardData,
  },
  argTypes: {
    aspect: {
      control: 'select',
      options: ['wide', 'portrait', 'square'],
    },
    titleClassName: { control: 'text' },
    imageRef: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Brand Refresh/ })
    await expect(link).toHaveAttribute('href', '/works/brand-refresh')
    await expect(link).toHaveAttribute('data-cursor', 'view')
  },
}

export const WithDescription: Story = {
  args: { showDescription: true },
}

export const Portrait: Story = {
  args: { aspect: 'portrait' },
}

export const Square: Story = {
  args: { aspect: 'square' },
}

/** The smaller title step a list under a section heading passes (CollectionArchive). */
export const CompactTitle: Story = {
  args: { titleClassName: 'text-lg xl:text-xl' },
}
