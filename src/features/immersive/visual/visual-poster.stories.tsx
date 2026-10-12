import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { type Effect, lookPosterSrc, SURFACES, type Surface } from '../studio/effect'
import { EFFECT_IDS, type EffectId, effectOf } from '../studio/effects'
import { LightLeak } from '../ui/light-leak'
import { StreakField } from '../ui/streak-field'
import { VisualPosterStack } from './poster'
import { STREAK_POSTER_SIZE, type VisualPosters } from './posters'

/**
 * Poster capture rig, one frame per effect, shipped look and ground polarity,
 * at the poster's own size. sas-site's `scripts/visual-posters.ts` screenshots
 * the canvas and writes `public/images/<effect's posterDirectory>/`; this repo
 * copies those files rather than running the script. Each effect runs as it
 * ships: the look's deltas, the effect's own face for the ground, defaults for
 * the rest. An effect drawn with alpha is captured on a transparent ground;
 * one that draws an opaque frame is captured as that frame, and the slot
 * blends the still the way it blends the canvas. Not a shipped surface.
 */
type PosterArgs = { effect: EffectId; look: string; surface: Surface }

const shippedTuning = (effect: Effect, look: string, surface: Surface) =>
  effect.face({ ...effect.defaults, ...effect.looks[look]?.tuning }, surface)

const PosterRig = ({ effect: id, look, surface }: PosterArgs) => {
  const effect = effectOf(id)
  const tuning = shippedTuning(effect, look, surface)
  return (
    <>
      {/* The capture must see only the effect: strip every ground the preview
          paints so the screenshot's alpha is the effect's own. */}
      <style>{'html, body, #storybook-root { background: transparent !important; }'}</style>
      <div
        className="relative isolate"
        data-visual-poster-rig={`${id}-${look}-${surface}`}
        data-theme={surface}
        style={{ width: STREAK_POSTER_SIZE.width, height: STREAK_POSTER_SIZE.height }}
      >
        {id === 'streakField' ? (
          <StreakField force {...tuning} />
        ) : (
          // Normal blend: the still is the frame itself, not the frame over a ground.
          <LightLeak force {...tuning} className="mix-blend-normal!" excite={false} />
        )}
      </div>
    </>
  )
}

const meta = {
  title: 'Immersive/VisualPosters',
  component: PosterRig,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    effect: { control: 'select', options: EFFECT_IDS },
    look: { control: 'text' },
    surface: { control: 'inline-radio', options: ['dark', 'light'] },
  },
  args: { effect: 'streakField', look: 'signal-v1', surface: 'dark' },
} satisfies Meta<typeof PosterRig>

export default meta

type Story = StoryObj<typeof meta>

/** Pick an effect, a look and a ground; the capture script drives these args by URL. */
export const Capture: Story = {}

/** A shipped look's stills, as a slot resolves them when no Studio look or upload replaces them. */
const shippedPosters = (effect: Effect, look: string): VisualPosters => {
  const still = (surface: Surface) => ({
    src: lookPosterSrc(effect, look, surface),
    ...STREAK_POSTER_SIZE,
    mime: 'image/webp',
    alt: '',
  })
  return { light: still('light'), dark: still('dark'), single: false }
}

/**
 * Every shipped look's pair, each still on its own ground: the site's
 * `--background` in that palette, which is what a band and the hero paint
 * under a slot. A leak's stills composite through each face's blend, exactly
 * as the slot composites them.
 */
export const ShippedPairs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-10 p-10">
      {EFFECT_IDS.map(effectOf).flatMap((effect) =>
        Object.values(effect.looks).map((look) => (
          <figure key={`${effect.id}-${look.id}`} className="flex flex-col gap-3">
            <figcaption className="text-sm">
              {effect.label} · {look.label} <span className="text-muted-foreground">{look.id}</span>
            </figcaption>
            <div className="grid grid-cols-2 gap-px">
              {SURFACES.map((surface) => (
                <div
                  key={surface}
                  className="relative isolate aspect-video overflow-hidden bg-background"
                  data-theme={surface}
                >
                  <VisualPosterStack
                    blend={
                      effect.blend && {
                        dark: effect.blend(shippedTuning(effect, look.id, 'dark')),
                        light: effect.blend(shippedTuning(effect, look.id, 'light')),
                      }
                    }
                    posters={shippedPosters(effect, look.id)}
                    priority={false}
                    shown
                    sizes="50vw"
                    surface={surface}
                  />
                </div>
              ))}
            </div>
          </figure>
        )),
      )}
    </div>
  ),
}
