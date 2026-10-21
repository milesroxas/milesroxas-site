'use client'

import './studio.css'

import { toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Button } from '@/components/ui/button'
import { studioGround } from '@/features/immersive/studio/ground'
import { stillInputs } from '@/features/immersive/studio/stills'
import { useDraft, useGround } from './draft'
import { type PublishedState, useLook } from './look-store'
import { draftState } from './status'
import { studioStore } from './store'

export const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

/**
 * The History tab: every published state of the look, newest first, read
 * from Payload's own versions. Restore copies one into the draft; Compare
 * shows it on the stage beside the draft. Neither changes the site.
 */
export const History: UIFieldClientComponent = () => {
  const { id, key, effect, recipe, stills, restore } = useDraft()
  const ground = useGround()
  const { history, loaded } = useLook(id)
  // A published state is its recipe, its ground and its stills: all are compared, all come back.
  const matchesDraft = (state: PublishedState) =>
    draftState(effect, recipe, ground.ground, stills, state).unchanged

  const restoreState = (state: PublishedState) => {
    try {
      restore(state.recipe, state.stills.map(stillInputs))
      ground.replace(state.ground)
      toast.success(`The draft is back at ${when(state.at)}. Undo in Studio reverses the recipe.`)
    } catch {
      toast.error('This state holds values the current ranges no longer accept.')
    }
  }
  const compare = (state: PublishedState) => {
    studioStore.patch(key, {
      comparison: state.recipe,
      comparisonGround: state.ground,
      comparisonLabel: when(state.at),
      comparisonAt: new Date(state.at).getTime(),
      showComparison: true,
    })
    toast.success('It is on the stage. Open Studio to see it.')
  }

  if (!id || (loaded && !history.length))
    return (
      <p data-streak-studio="panel" className="text-muted-foreground text-xs">
        Nothing published yet. Publish from Studio and each published state is kept here.
      </p>
    )

  return (
    <ul data-streak-studio="panel" className="flex flex-col divide-y divide-border">
      {history.map((state, index) => (
        <HistoryRow
          key={state.id}
          state={state}
          onSite={index === 0}
          matchesDraft={matchesDraft(state)}
          onRestore={() => restoreState(state)}
          onCompare={() => compare(state)}
        />
      ))}
    </ul>
  )
}

function HistoryRow({
  state,
  onSite,
  matchesDraft,
  onRestore,
  onCompare,
}: {
  state: PublishedState
  onSite: boolean
  matchesDraft: boolean
  onRestore: () => void
  onCompare: () => void
}) {
  return (
    <li className="flex flex-wrap items-center gap-4 py-3">
      <span
        className="block h-9 w-16 shrink-0 overflow-hidden rounded-sm border border-border"
        style={{ backgroundColor: studioGround(state.ground, 'dark') }}
      >
        {state.poster && (
          // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
          <img src={state.poster} alt="" className="size-full object-cover" loading="lazy" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium text-xs">{when(state.at)}</span>
        <span className="text-[11px] text-muted-foreground">
          {[onSite && 'On the site now', matchesDraft && 'matches the draft']
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {!matchesDraft && (
          <Button type="button" variant="ghost" size="sm" onClick={onRestore}>
            Restore as draft
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onCompare}>
          Compare on stage
        </Button>
      </div>
    </li>
  )
}
