import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WorkMasthead } from './index'

const meta = {
  title: 'Sections/WorkMasthead',
  component: WorkMasthead,
  parameters: {
    layout: 'fullscreen',
    // GSAP drives the entrance; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  args: {
    title: 'Differentiation Through Immersive Digital Experience',
    industry: 'Security Services',
    role: 'Web Design, 3D, Development',
    deliverables: 'Sanity CMS, 3D assets, Animations',
  },
} satisfies Meta<typeof WorkMasthead>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ShortTitle: Story = {
  args: {
    title: 'Identity for Higher-Stakes Work',
    industry: 'Human Resources Services',
    role: 'Lead Design',
    deliverables: 'Full Corporate Identity, Web Design',
  },
}

export const PartialFacts: Story = {
  args: { industry: null, deliverables: null },
}

export const TitleOnly: Story = {
  args: { industry: null, role: null, deliverables: null },
}
