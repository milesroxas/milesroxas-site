import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { themeClasses } from '@/blocks/shared/band-theme'
import { mediaFixture } from '@/stories/fixtures'
import { cn } from '@/utilities/ui'
import { STREAK_FIELD_EFFECT } from '../studio/effects'
import { snapshotRecipe, starterRecipe } from '../studio/recipe'
import type { ReleaseDescriptor } from '../studio/release'
import type { StreakFieldTuning } from '../ui/streak-field-tuning'
import type { PosterMediaSource, StreakVisualDescriptor } from './descriptor'
import { StreakVisual } from './streak-visual'

/**
 * The Streak Field as page media: a poster in the server HTML, a live field
 * only once the slot is hydrated, near, visible, allowed and admitted. In
 * Storybook the slot behaves as on the site: a machine with WebGL2 and a
 * fine pointer goes live after the poster; reduced motion, a coarse pointer
 * or a software renderer keep the poster. `data-visual-status` on the frame
 * reports which, and `data-visual-pending` marks a poster still standing in
 * for a live frame on its way (a page transition holds its reveal for it).
 */
const descriptor = (over: Partial<StreakVisualDescriptor> = {}): StreakVisualDescriptor => ({
  look: 'signal-v1',
  seed: 694,
  speed: 1,
  intensity: 1,
  pointer: true,
  surface: null,
  posterMedia: null,
  degraded: false,
  ...over,
})

const meta = {
  title: 'Immersive/StreakVisual',
  component: StreakVisual,
  parameters: { layout: 'fullscreen' },
  args: {
    descriptor: descriptor(),
    placement: 'hero',
    surface: 'auto',
    fill: true,
    priority: true,
  },
  render: (args) => (
    <div className="relative isolate min-h-svh bg-background text-foreground">
      <StreakVisual {...args} />
      <div className="relative flex min-h-svh items-end p-10">
        <h2 className="max-w-xl text-balance text-heading-2">Signal, seen from the side.</h2>
      </div>
    </div>
  ),
} satisfies Meta<typeof StreakVisual>

export default meta

type Story = StoryObj<typeof meta>

/** A poster that is the slot's final still: no live frame is coming, so nothing waits on it. */
const settledPoster: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const frame = canvasElement.querySelector('[data-visual="streakField"]')
  await expect(frame).toHaveAttribute('data-visual-status', 'poster')
  await expect(frame).not.toHaveAttribute('data-visual-pending')
}

/** The default look as a hero background on the site theme (switch the toolbar theme to flip the ground). */
export const Hero: Story = {}

/** A contained block frame: the slot sizes itself from the frame classes. */
export const ContainedBlock: Story = {
  args: { fill: false, placement: 'block', className: 'aspect-16/9 w-full' },
  render: (args) => (
    <div className="container py-16">
      <StreakVisual {...args} />
    </div>
  ),
}

/** Topography: a flow look, admitted only where a float target renders. */
export const Topography: Story = {
  args: { descriptor: descriptor({ look: 'topography-v1', seed: 12 }) },
}

/**
 * An inverted band flips the ground against the site theme: the slot reads it
 * at runtime (`auto`), and the poster pair follows it before any script runs.
 */
export const OnInvertedBand: Story = {
  render: (args) => (
    <div className={cn(themeClasses.inverted, 'relative isolate min-h-svh')}>
      <StreakVisual {...args} />
    </div>
  ),
}

/**
 * The editor pinned this use to its light face: it holds that face in either
 * site theme and paints its own ground, so it reads the same on an inverted band.
 */
export const PinnedLight: Story = {
  args: { descriptor: descriptor({ surface: 'light' }), fill: false, className: 'aspect-video' },
  render: (args) => (
    <div className={cn(themeClasses.inverted, 'min-h-svh')}>
      <div className="container py-16">
        <StreakVisual {...args} />
      </div>
    </div>
  ),
}

/** An approved poster upload replaces the look's built-in still. */
export const UploadedPoster: Story = {
  args: { descriptor: descriptor({ posterMedia: mediaFixture }) },
}

/** The shipped topography stills stand in for the pair a published Studio look renders. */
const studioPoster = (surface: 'light' | 'dark'): PosterMediaSource => ({
  filename: `topography-v1-${surface}.webp`,
  url: `/images/streak-field/topography-v1-${surface}.webp`,
  width: 1600,
  height: 900,
  mimeType: 'image/webp',
  updatedAt: '2026-10-08T00:00:00.000Z',
})

const studioRelease: ReleaseDescriptor<StreakFieldTuning> = {
  id: 1,
  sourceHash: 'a'.repeat(64),
  snapshot: snapshotRecipe<StreakFieldTuning>(
    STREAK_FIELD_EFFECT,
    starterRecipe(STREAK_FIELD_EFFECT, 'topography-v1'),
  ),
  posters: { light: studioPoster('light'), dark: studioPoster('dark') },
}

/**
 * A published Studio look on a post card: its own still for each theme wins
 * over a single upload (`posterMedia`, ignored here), since one upload can only
 * serve both grounds alike. Switch the toolbar theme to swap the still.
 */
export const StudioLookPosters: Story = {
  args: {
    descriptor: descriptor({ release: studioRelease, posterMedia: mediaFixture }),
    placement: 'card',
    fill: false,
    className: 'aspect-3/2 w-96',
  },
  render: (args) => (
    <div className="container py-16">
      <StreakVisual {...args} />
    </div>
  ),
  play: async (context) => {
    await settledPoster(context)
    const stills = [...context.canvasElement.querySelectorAll('[data-visual-poster]')]
    await expect(stills.map((still) => still.getAttribute('data-visual-poster'))).toEqual([
      'light',
      'dark',
    ])
    for (const still of stills)
      await expect(still.getAttribute('src')).toContain(
        `topography-v1-${still.getAttribute('data-visual-poster')}`,
      )
  },
}

/** A stored preset that no longer ships: the fallback look, poster only, never live. */
export const DegradedPreset: Story = {
  args: { descriptor: descriptor({ degraded: true }) },
  play: settledPoster,
}

/** Repeated entries and menus: poster only by placement policy, no probe, no chunk. */
export const CardPlacement: Story = {
  args: { placement: 'card', fill: false, className: 'aspect-video w-96' },
  render: (args) => (
    <div className="container py-16">
      <StreakVisual {...args} />
    </div>
  ),
  play: settledPoster,
}

/** Held by its owner (a hero intro still playing): the poster stays until `active`. */
export const HeldByOwner: Story = {
  args: { active: false },
  play: settledPoster,
}

/** Slowed and dimmed by the editor's bounded multipliers, without pointer interaction. */
export const EditorAdjusted: Story = {
  args: { descriptor: descriptor({ speed: 0.4, intensity: 0.7, pointer: false, seed: 31 }) },
}

/**
 * The full lifecycle on any machine: `admission="force"` (stories only)
 * skips the policy and device gates, so the slot goes poster → preparing →
 * live where a hardware WebGL2 context exists, and poster → failed where the
 * context is refused (software rasterizers).
 */
export const ForcedLifecycle: Story = {
  args: { admission: 'force' },
}
