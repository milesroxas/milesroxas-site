import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LIGHT_LEAK_EFFECT, STREAK_FIELD_EFFECT } from './effects'
import { StudioPreview } from './preview'
import { EXPORT_CAPTURE, emptyRecipe, starterRecipe } from './recipe'

/**
 * The Studio's stage (Payload admin, Studio looks): a look's draft, live, on a
 * ground, at a placement's budget. The grounds are the site's own
 * `--background` in each palette (`STUDIO_GROUND`), so the stage and a filled
 * export match the page the look lands on.
 */
const meta = {
  title: 'Immersive/Studio preview',
  component: StudioPreview,
  args: {
    effect: 'streakField',
    recipe: emptyRecipe(STREAK_FIELD_EFFECT),
    placement: 'hero',
    surface: 'dark',
    paused: true,
    generation: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudioPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Dark: Story = {}
export const Light: Story = { args: { surface: 'light' } }

const leak = { effect: 'lightLeak', paused: false } as const
/** The leak washes over the stage's copy, the way it washes over a page. */
export const LeakDark: Story = { args: { ...leak, recipe: emptyRecipe(LIGHT_LEAK_EFFECT) } }
/** The paper face is derived: an untouched leak is the shipped light-theme look. */
export const LeakLight: Story = { args: { ...LeakDark.args, surface: 'light' } }
export const LeakAmber: Story = {
  args: { ...leak, recipe: starterRecipe(LIGHT_LEAK_EFFECT, 'amber-v1') },
}

const exportFrame: Story['decorators'] = [
  (Story) => (
    <div style={{ aspectRatio: `${EXPORT_CAPTURE.width} / ${EXPORT_CAPTURE.height}`, width: 720 }}>
      <Story />
    </div>
  ),
]

/**
 * "Render and save to Media" frames a filled 3:2 still by default
 * (`EXPORT_CAPTURE`, 1800 × 1200: a post card's picture at 2x), on the ground
 * the stage paints. The Inspector opens the filed still in a new tab.
 */
export const ExportFrame: Story = { decorators: exportFrame }

/** A leak's filled export is drawn onto the ground through its blend, as the page composites it. */
export const ExportFrameLeakLight: Story = {
  args: { ...leak, recipe: emptyRecipe(LIGHT_LEAK_EFFECT), surface: 'light' },
  decorators: exportFrame,
}
