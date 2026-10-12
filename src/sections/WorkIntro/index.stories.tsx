import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { WorkIntro } from './index'

const summary =
  'NextStreet is a platform that enables organizations and municipalities to support small business growth through advising, capital access, and structured programs.'

const meta = {
  title: 'Sections/WorkIntro',
  component: WorkIntro,
  parameters: {
    layout: 'fullscreen',
    // The shared scroll reveal drives the entrance; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
    docs: {
      description: {
        component:
          'The introduction band after a work or post hero: one statement, centred in a band one screen tall less the gaps around it, so the statement is all that shows. Its lines rise out of masks, one after another, on the shared scroll reveal.',
      },
    },
  },
  args: {
    title: 'Background',
    summary,
  },
} satisfies Meta<typeof WorkIntro>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithOverrideBody: Story = {
  args: {
    body: richTextFixture(summary),
    summary: null,
  },
}

export const TwoParagraphs: Story = {
  args: {
    summary: `${summary}\n\nVisitors gained a clearer path through the platform while retaining access to the technical depth they needed.`,
  },
}

/** A short statement still holds the screen, centred. */
export const OneLine: Story = {
  args: {
    summary: 'A platform for small business growth.',
  },
}
