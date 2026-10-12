import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { SourceUrlUIPart } from 'ai'
import { expect } from 'storybook/test'
import { askSourcesFixture } from './fixtures'
import { AskSources } from './Sources'

/** The fixture's links as the transcript hands them over: `source-url` message parts. */
const parts = (sources: Omit<SourceUrlUIPart, 'type'>[]): SourceUrlUIPart[] =>
  sources.map((source) => ({ type: 'source-url', ...source }))

/**
 * The pages an answer drew on, under every Ask reply (the /ask page and the
 * dock's panel). Each row wears the dock's glyph for its section: Work under
 * `/works`, Posts under `/posts`, Contact and Home for those pages.
 */
const meta = {
  title: 'Features/Ask/Sources',
  component: AskSources,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-sm">
        <Story />
      </div>
    ),
  ],
  args: { sources: parts(askSourcesFixture) },
} satisfies Meta<typeof AskSources>

export default meta

type Story = StoryObj<typeof meta>

/** More than one source starts collapsed to the "Sources" row, the count trailing. */
export const Collapsed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /sources/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  },
}

/** Opened: one raised group of rows, split by inset hairlines. */
export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /sources/i }))
    await expect(canvas.getByRole('link', { name: /Design Systems/ })).toBeInTheDocument()
  },
}

/** A single source starts open: one row costs less to show than a disclosure costs to open. */
export const Single: Story = {
  args: { sources: parts(askSourcesFixture.slice(0, 1)) },
}

/** Every glyph lane, and a title long enough to wrap to its second line before it truncates. */
export const EverySection: Story = {
  args: {
    sources: parts([
      ...askSourcesFixture,
      {
        sourceId:
          '/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer',
        title: 'Fourteen branches, one afternoon: how I work in parallel as a solo engineer',
        url: '/posts/fourteen-branches-one-afternoon-how-i-work-in-parallel-as-a-solo-engineer',
      },
      { sourceId: '/contact', title: 'About Miles Roxas', url: '/contact' },
      { sourceId: '/', title: 'Miles Roxas', url: '/' },
    ]),
  },
  play: Open.play,
}
