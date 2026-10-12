import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import type {
  LeakVisualDescriptor,
  StreakVisualDescriptor,
} from '@/features/immersive/visual/descriptor'
import { mediaFixture } from '@/stories/fixtures'
import { Visual } from '.'

const streak: StreakVisualDescriptor = {
  look: 'signal-v1',
  seed: 694,
  speed: 1,
  intensity: 1,
  pointer: true,
  surface: null,
  posterMedia: null,
  degraded: false,
}

const leak: LeakVisualDescriptor = {
  look: 'film-v1',
  speed: 1,
  intensity: 1,
  pointer: true,
  surface: null,
  targets: null,
  sectionExcite: null,
  posterMedia: null,
  degraded: false,
  bleed: false,
  origin: 'top-right',
  media: null,
}

/**
 * What cards, heroes, feature tabs and layout cells render for a resolved
 * visual slot: the `Media` element for an upload, the effect's poster-first
 * slot otherwise. The effect stories (Immersive) cover each slot's lifecycle.
 */
const meta = {
  title: 'Components/Visual',
  component: Visual,
  parameters: { layout: 'fullscreen' },
  args: {
    visual: { kind: 'media', media: mediaFixture },
    placement: 'block',
    fill: true,
    htmlElement: null,
    imgClassName: 'object-cover',
    size: '(min-width: 768px) 48rem, 100vw',
  },
  render: (args) => (
    <div className="container py-16">
      <div className="relative aspect-video max-w-3xl overflow-hidden">
        <Visual {...args} />
      </div>
    </div>
  ),
} satisfies Meta<typeof Visual>

export default meta

type Story = StoryObj<typeof meta>

/** An upload goes through `Media` untouched. */
export const MediaUpload: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByAltText('Open graph placeholder artwork')).toBeInTheDocument()
    await expect(canvasElement.querySelector('[data-visual]')).toBeNull()
  },
}

/** A Streak Field look: its poster in the frame first, live once the slot is admitted. */
export const StreakField: Story = {
  args: { visual: { kind: 'streakField', descriptor: streak } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-visual="streakField"]')).not.toBeNull()
  },
}

/** A light leak with the slot's upload under it, which the editor asked to show. */
export const LightLeakOverMedia: Story = {
  args: { visual: { kind: 'lightLeak', descriptor: { ...leak, media: mediaFixture } } },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('[data-visual="lightLeak"]')).not.toBeNull()
    await expect(canvas.getByAltText('Open graph placeholder artwork')).toBeInTheDocument()
  },
}
