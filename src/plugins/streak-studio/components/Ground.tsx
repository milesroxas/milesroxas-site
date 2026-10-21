'use client'

import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { STUDIO_GROUND, type Surface } from '@/features/immersive/studio/effect'
import { studioGround } from '@/features/immersive/studio/ground'
import { useGround } from './draft'
import { HexField } from './ParameterRow'
import { fromHex, GROUND_COPY, toHex } from './parameters'

/**
 * The look's own ground for the face the stage is showing, beside the face
 * toggle: a swatch that opens the system colour picker, the hex it is set
 * to, and a clear once it departs from the site's background. It sits with
 * the face because it is a property of the face, not of the effect: the
 * colour under the look wherever the look sits in a frame of its own, and the
 * colour a filled still is laid over. It is the look's field beside the
 * recipe (`useGround`), saved with the draft and published with the look; it
 * is not an undo step.
 */
export function GroundControl({ surface }: { surface: Surface }) {
  const { ground, set } = useGround()
  const hex = studioGround(ground, surface)
  const changed = Boolean(ground[surface])
  const copy = GROUND_COPY[surface]
  return (
    <div className="flex items-center gap-1.5" data-changed={changed || undefined}>
      <Tooltip>
        <TooltipTrigger asChild>
          <label
            className="relative size-[30px] shrink-0 cursor-pointer overflow-hidden rounded-md border border-input"
            style={{ backgroundColor: hex }}
            aria-label={copy.label}
          >
            <input
              type="color"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              value={hex}
              onChange={(event) => {
                const next = fromHex(event.target.value)
                if (next) set(surface, toHex(next))
              }}
            />
            {changed && (
              <span
                aria-hidden
                className="absolute top-1 right-1 size-1.5 rounded-full bg-primary ring-2 ring-background"
              />
            )}
          </label>
        </TooltipTrigger>
        <TooltipContent variant="panel" side="top" sideOffset={8} collisionPadding={12}>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[13px]/4 text-foreground">{copy.label}</span>
            <p className="text-pretty text-foreground/80">{copy.description}</p>
            <p className="font-mono text-[11px]/3.5 text-muted-foreground">
              default {STUDIO_GROUND[surface]}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
      <HexField
        value={hex}
        label={copy.label}
        className="h-[30px] w-21"
        onCommit={(next) => set(surface, toHex(next))}
      />
      {changed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-[30px]"
              aria-label={`Use the site background for the ${surface} face`}
              onClick={() => set(surface, null)}
            >
              <IconX />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            Back to the site background
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
