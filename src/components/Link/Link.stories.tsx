import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import type { Page, Post } from '@/payload-types'
import { CMSLink } from './index'
import { INDEX_PAGES } from './resolve-href'

const aboutPage = { id: 1, slug: 'about', title: 'About' } as Page
const motionPost = { id: 2, slug: 'designing-with-motion', title: 'Designing with Motion' } as Post

const meta = {
  title: 'Components/CMSLink',
  component: CMSLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A Payload link field as a link: `custom` passes its URL through, `reference` resolves a page at the root and a post under `/posts`, `index` names a route with no document behind it (`INDEX_PAGES`). An unresolved link renders nothing.',
      },
    },
  },
  args: {
    type: 'custom',
    url: '/works',
    label: 'View work',
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['custom', 'reference', 'index'],
    },
    indexPage: {
      control: 'select',
      options: Object.keys(INDEX_PAGES),
      if: { arg: 'type', eq: 'index' },
    },
    url: { if: { arg: 'type', eq: 'custom' } },
    reference: { if: { arg: 'type', eq: 'reference' } },
    appearance: {
      control: 'select',
      options: ['inline', 'default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'clear'],
    },
  },
} satisfies Meta<typeof CMSLink>

export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {}

export const ButtonDefault: Story = {
  args: { appearance: 'default' },
}

export const ButtonOutline: Story = {
  args: { appearance: 'outline', size: 'lg' },
}

export const NewTab: Story = {
  args: {
    label: 'External link',
    newTab: true,
    url: 'https://example.com',
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'External link' })
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}

export const ReferencePage: Story = {
  args: {
    type: 'reference',
    reference: { relationTo: 'pages', value: aboutPage },
    label: 'About',
    url: null,
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'About' })
    await expect(link).toHaveAttribute('href', '/about')
  },
}

export const ReferencePost: Story = {
  args: {
    type: 'reference',
    reference: { relationTo: 'posts', value: motionPost },
    label: 'Read the post',
    url: null,
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Read the post' })
    await expect(link).toHaveAttribute('href', '/posts/designing-with-motion')
  },
}

/** An index route (Works, Posts, Contact, Ask): the editor picks it by key. */
export const IndexPage: Story = {
  args: {
    type: 'index',
    indexPage: 'contact',
    label: 'Get in touch',
    url: null,
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Get in touch' })
    await expect(link).toHaveAttribute('href', '/contact')
  },
}

/** Every index route, as the Header dock lists them. */
export const IndexPages: Story = {
  render: (args) => (
    <ul className="flex gap-6">
      {Object.entries(INDEX_PAGES).map(([key, { label }]) => (
        <li key={key}>
          <CMSLink {...args} indexPage={key as keyof typeof INDEX_PAGES} label={label} />
        </li>
      ))}
    </ul>
  ),
  args: { type: 'index', url: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const { label, href } of Object.values(INDEX_PAGES)) {
      await expect(canvas.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  },
}

/** A caller's `onClick` takes the navigation and receives the resolved href. */
export const WithClickHandler: Story = {
  args: {
    type: 'index',
    indexPage: 'ask',
    label: 'Ask',
    url: null,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('link', { name: 'Ask' }))
    await expect(args.onClick).toHaveBeenCalledWith('/ask')
  },
}

/** An index link with no page picked has no href, so nothing renders. */
export const Unresolved: Story = {
  args: { type: 'index', indexPage: null, url: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link')).toBeNull()
  },
}
