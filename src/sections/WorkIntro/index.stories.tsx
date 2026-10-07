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
    // GSAP drives the entrance; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
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
