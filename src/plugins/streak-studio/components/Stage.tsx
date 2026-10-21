'use client'

import './studio.css'

import { Link, toast } from '@payloadcms/ui'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDice5,
  IconLayoutGrid,
  IconMinus,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import type { UIFieldClientComponent } from 'payload'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  type Effect,
  type EffectBudget,
  lookOptions,
  lookPosterSrc,
  STUDIO_GROUND,
  type Surface,
} from '@/features/immersive/studio/effect'
import { EFFECT_OPTIONS, type EffectId } from '@/features/immersive/studio/effects'
import { type LookGround, sameGround, studioGround } from '@/features/immersive/studio/ground'
import {
  FRAME_MAX,
  type Recipe,
  resolveRecipeTuning,
  SEED_MAX,
  type Snapshot,
  snapshotChanges,
  snapshotRecipe,
  starterRecipe,
} from '@/features/immersive/studio/recipe'
import { type Still, stillInputs } from '@/features/immersive/studio/stills'
import { VISUAL_PLACEMENTS, type VisualPlacement } from '@/features/immersive/visual/placement'
import { cn } from '@/utilities/ui'
import { type Stills, useGround, useStills } from './draft'
import { GroundControl } from './Ground'
import { when } from './History'
import { type LookState, type LookUse, type PublishedState, useLook } from './look-store'
import { EFFECT_COPY } from './parameters'
import { StillViewport } from './StillViewport'
import { type Shot, shotOf } from './shot'
import { draftState } from './status'
import { type StudioSession, studioStore, useStudioSession } from './store'
import { Variations } from './Variations'

const Preview = lazy(() =>
  import('@/features/immersive').then((module) => ({ default: module.StudioPreview })),
)

type Draft = Stills
type Ground = ReturnType<typeof useGround>
type Patch = (next: Partial<StudioSession>) => void
type Update = Draft['update']
type DraftState = ReturnType<typeof compareDraft>
type StageActions = ReturnType<typeof stageActions>

const isEditing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const clock = (at: number) =>
  new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

/** The draft read against what is published, and what the stage can afford to draw of it. */
function compareDraft(
  effect: Effect,
  recipe: Recipe,
  ground: LookGround,
  stills: Still[],
  session: StudioSession,
  { live: published, history }: LookState,
) {
  let validation = ''
  let snapshot: Snapshot | null = null
  try {
    snapshot = snapshotRecipe(effect, recipe)
  } catch (error) {
    validation = (error as Error).message
  }
  const state = draftState(effect, recipe, ground, stills, published)
  // The ground and the stills ride beside the snapshot, so they are read beside the key.
  const same = (candidate: PublishedState) =>
    draftState(effect, recipe, ground, stills, candidate).unchanged
  return {
    validation,
    /** Whether a published state is the draft, ground and stills included. */
    matches: same,
    unchanged: state.unchanged,
    // The published state the draft is identical to, whichever one it is: a
    // restored state matches itself, not "12 changes since published".
    matched: history.find(same),
    sincePublished:
      snapshot && published
        ? snapshotChanges(snapshot, JSON.parse(published.key)) +
          Number(!sameGround(published.ground, ground)) +
          state.stillsApart
        : null,
    budget: snapshot
      ? effect.budget(
          effect.limit(snapshot[session.surface], session.placement),
          resolveRecipeTuning(effect, recipe),
          session.placement,
        )
      : null,
  }
}

function statusText(id: Draft['id'], published: PublishedState | null, state: DraftState) {
  if (!id) return 'Unsaved. Save once to publish and export.'
  if (state.unchanged) return 'Published, no changes'
  if (state.matched) return `Draft matches what was published ${when(state.matched.at)}`
  const changes = state.sincePublished
  if (published && changes !== null) {
    return `Draft, ${changes} ${changes === 1 ? 'change' : 'changes'} since published`
  }
  return 'Draft, not yet published'
}

function stageActions(
  { key, effect, effectId, recipe, stills, update, undo, redo, restore, changeEffect }: Draft,
  ground: Ground,
) {
  return {
    // A look's effect is open until it is first published; the draft starts over with it.
    chooseEffect: (next: EffectId) => {
      if (next === effectId) return
      if (
        (Object.keys(recipe.deltas).length || stills.length) &&
        !window.confirm('Changing the effect starts this draft over. Continue?')
      )
        return
      changeEffect(next)
    },
    undo,
    redo,
    keep: () => {
      studioStore.patch(key, {
        comparison: recipe,
        comparisonGround: ground.ground,
        comparisonLabel: 'Kept comparison',
        comparisonAt: Date.now(),
        showComparison: false,
      })
    },
    // A published state is its recipe, its stills and its ground, so all come
    // back; the ground is not an undo step.
    restoreState: (state: PublishedState, label: string) => {
      try {
        restore(state.recipe, state.stills.map(stillInputs))
        ground.replace(state.ground)
        toast.success(`The draft is back at ${label}. Undo brings your recipe changes back.`)
      } catch {
        toast.error('This state holds values the current ranges no longer accept.')
      }
    },
    compareState: (state: PublishedState) =>
      studioStore.patch(key, {
        comparison: state.recipe,
        comparisonGround: state.ground,
        comparisonLabel: when(state.at),
        comparisonAt: new Date(state.at).getTime(),
        showComparison: true,
      }),
    randomize: () => {
      if (!effect.seeded) return
      update({ ...recipe, seed: crypto.getRandomValues(new Uint32Array(1))[0] & SEED_MAX }, true)
    },
  }
}

/** ⌘Z and ⇧⌘Z anywhere on the page, outside a text field. */
function useUndoShortcut(undo: () => void, redo: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      if (isEditing(event.target)) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })
}

const stageKeys =
  (session: StudioSession, patch: Patch, randomize: () => void, leave: () => void) =>
  (event: React.KeyboardEvent) => {
    if (isEditing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
    switch (event.key) {
      case ' ':
        event.preventDefault()
        patch({ paused: !session.paused })
        break
      case 'r':
        randomize()
        break
      case 'c':
        if (session.comparison) patch({ showComparison: !session.showComparison })
        break
      case 'Escape':
        leave()
        break
    }
  }

function IconAction({
  label,
  shortcut,
  disabled,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-full w-8 rounded-none"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * The stage: the Studio tab of a look, for whichever effect it is filed under.
 * Starters and published history on the left, the live effect in the middle at
 * the chosen placement and ground, and the session controls. Edits happen in
 * the Inspector (the recipe field, in the sidebar); the stage reads the same
 * field and shows the result, or a comparison when asked. With a still chosen
 * on the Inspector's Stills tab, the stage shows that still instead, rendered
 * exactly, and its seed and moment are set here.
 *
 * A look has a draft and what is published. Publish puts the draft on the
 * site, everywhere the look is used; Reset to published and Restore copy a
 * published state back into the draft.
 */
export const Stage: UIFieldClientComponent = () => {
  const draft = useStills()
  const {
    id,
    key,
    effect,
    effectId,
    recipe,
    stills,
    update,
    patch: patchStill,
    selection,
    selected,
    select,
  } = draft
  const session = useStudioSession(key)
  const look = useLook(id)
  const groundField = useGround()
  const { ground } = groundField
  const [live, setLive] = useState(true)
  const [sheet, setSheet] = useState(false)
  const state = compareDraft(effect, recipe, ground, stills, session, look)
  const actions = stageActions(draft, groundField)
  const patch: Patch = (next) => studioStore.patch(key, next)
  // What the stage shows: the live look, or a shot of it. A still is of one
  // face, so the face toggle sets the still's face while it is up.
  const surface: Surface = selected ? selected.surface : session.surface
  const shot = selection ? shotOf(effect, recipe, selected ?? 'poster', surface) : null
  const setSurface = (next: Surface) =>
    selected ? patchStill(selected.id, { surface: next }) : patch({ surface: next })
  // The seed and the moment belong to what the stage shows: the recipe's for
  // the look and its poster, the still's own for a still.
  const setShot = (next: { seed?: number; frame?: number }) =>
    selected ? patchStill(selected.id, next) : update({ ...recipe, ...next }, 'seed' in next)
  const randomize = () => {
    if (!effect.seeded) return
    setShot({ seed: crypto.getRandomValues(new Uint32Array(1))[0] & SEED_MAX })
  }
  // The stage paints the ground of what it shows: the comparison's while one is up.
  const comparing = !shot && session.showComparison && Boolean(session.comparison)
  const shownGround = studioGround(comparing ? session.comparisonGround : ground, surface)

  useUndoShortcut(actions.undo, actions.redo)

  return (
    <TooltipProvider delayDuration={400}>
      <section
        data-streak-studio
        aria-label={EFFECT_COPY[effectId].title}
        className="@container flex flex-col overflow-hidden rounded-lg border border-input bg-background"
        onKeyDown={stageKeys(session, patch, randomize, () => select(null))}
      >
        <StageHeader
          draft={draft}
          look={look}
          state={state}
          session={session}
          shot={shot}
          actions={actions}
          onLeave={() => select(null)}
        />
        <div className="grid @[768px]:grid-cols-[240px_minmax(0,1fr)] grid-cols-1">
          <aside className="flex flex-col border-border @[768px]:border-r border-b @[768px]:border-b-0 bg-card">
            <StarterList effect={effect} surface={surface} update={update} />
            <PublishedList
              session={session}
              history={look.history}
              matches={state.matches}
              patch={patch}
              actions={actions}
            />
          </aside>
          <div className="flex min-w-0 flex-col">
            <Viewport
              live={live}
              session={session}
              surface={surface}
              effectId={effectId}
              recipe={recipe}
              shot={shot}
              lookGround={ground}
              ground={shownGround}
              state={state}
              onTurnOn={() => setLive(true)}
            />
            <Transport
              live={live}
              session={session}
              surface={surface}
              still={Boolean(shot)}
              patch={patch}
              setSurface={setSurface}
              restart={() => studioStore.restart(key)}
              onToggleLive={() => setLive((v) => !v)}
            >
              {effect.seeded && (
                <SeedField
                  seed={shot?.seed ?? recipe.seed}
                  onChange={(seed) => setShot({ seed })}
                  onRandomize={randomize}
                />
              )}
              <FrameField
                frame={shot?.frame ?? recipe.frame}
                onChange={(frame) => setShot({ frame })}
              />
              <span className="flex h-[30px] items-center overflow-hidden rounded-md border border-input">
                <IconAction label="Variations" onClick={() => setSheet(true)}>
                  <IconLayoutGrid />
                </IconAction>
              </span>
            </Transport>
          </div>
        </div>
        <Variations
          open={sheet}
          onOpenChange={setSheet}
          effectId={effectId}
          shot={shot ?? shotOf(effect, recipe, 'poster', surface)}
          ground={ground}
          seeded={effect.seeded}
          onPick={setShot}
        />
      </section>
    </TooltipProvider>
  )
}

function StageHeader({
  draft: { id, key, effectId },
  look: { loaded, live: published, uses },
  state,
  session,
  shot,
  actions,
  onLeave,
}: {
  draft: Draft
  look: LookState
  state: DraftState
  session: StudioSession
  shot: Shot | null
  actions: StageActions
  onLeave: () => void
}) {
  return (
    <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-border border-b py-2 pr-4 pl-5">
      <DraftStatus
        title={
          shot ? `${EFFECT_COPY[effectId].title} · ${shot.label}` : EFFECT_COPY[effectId].title
        }
        id={id}
        published={published}
        state={state}
        places={uses.filter((use) => !use.historical)}
      />
      <div className="flex items-center gap-3">
        {loaded && !published && <EffectPicker value={effectId} onChange={actions.chooseEffect} />}
        {published && !state.unchanged && (
          <ResetToPublished onClick={() => actions.restoreState(published, 'what is published')} />
        )}
        <UndoRedo session={session} onUndo={actions.undo} onRedo={actions.redo} />
        {shot ? (
          // A still is one exact render; there is nothing live to compare it
          // with, so the comparison's place goes to the way back to the look.
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" size="sm" onClick={onLeave}>
                Back to the look
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Show the live look
              <Kbd>Esc</Kbd>
            </TooltipContent>
          </Tooltip>
        ) : (
          <ToggleGroup
            type="single"
            variant="segmented"
            size="lg"
            className="w-auto"
            value={session.showComparison ? 'compare' : 'draft'}
            onValueChange={(next) =>
              next && studioStore.patch(key, { showComparison: next === 'compare' })
            }
          >
            <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
            <ToggleGroupItem value="compare" disabled={!session.comparison}>
              Compare
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
    </header>
  )
}

function DraftStatus({
  title,
  id,
  published,
  state,
  places,
}: {
  title: string
  id: Draft['id']
  published: PublishedState | null
  state: DraftState
  places: LookUse[]
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2.5">
      <h2 className="font-semibold text-[15px]/5">{title}</h2>
      {/* The status sets on the title's baseline, so the dot rides in
          the text rather than leading a flex row: a flex container takes
          its baseline from its first item, and an empty 6px span has
          none to give — the line would sit a pixel or two off the
          heading beside it. */}
      <p className="text-muted-foreground text-xs/4">
        <span
          aria-hidden
          className={cn(
            'mr-1.5 inline-block size-1.5 shrink-0 rounded-full align-[0.15em]',
            state.unchanged ? 'bg-success' : published ? 'bg-warning' : 'bg-muted-foreground',
          )}
        />
        {statusText(id, published, state)}
        {/* Where Publish lands. A look is used like a media file: every
            place that uses it shows what is published. */}
        {id && places.length === 1 && (
          <>
            {' · used on '}
            <Link href={places[0].url} prefetch={false} className="underline">
              {places[0].title}
            </Link>
          </>
        )}
        {places.length > 1 && ` · used in ${places.length} places`}
      </p>
    </div>
  )
}

function EffectPicker({
  value,
  onChange,
}: {
  value: EffectId
  onChange: (next: EffectId) => void
}) {
  return (
    <ToggleGroup
      type="single"
      variant="segmented"
      size="lg"
      className="w-auto"
      aria-label="Effect"
      value={value}
      onValueChange={(next) => next && onChange(next as EffectId)}
    >
      {EFFECT_OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function ResetToPublished({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="sm" onClick={onClick}>
          Reset to published
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="max-w-56">
        Put what is on the site back in the draft. Undo brings your changes back.
      </TooltipContent>
    </Tooltip>
  )
}

function UndoRedo({
  session,
  onUndo,
  onRedo,
}: {
  session: StudioSession
  onUndo: () => void
  onRedo: () => void
}) {
  return (
    <div className="flex h-[34px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
      <IconAction label="Undo" shortcut="⌘Z" disabled={!session.history.length} onClick={onUndo}>
        <IconArrowBackUp />
      </IconAction>
      <IconAction label="Redo" shortcut="⇧⌘Z" disabled={!session.future.length} onClick={onRedo}>
        <IconArrowForwardUp />
      </IconAction>
    </div>
  )
}

function StarterList({
  effect,
  surface,
  update,
}: {
  effect: Effect
  surface: StudioSession['surface']
  update: Update
}) {
  const starters = lookOptions(effect)
  return (
    <>
      <div className="flex h-10 items-center border-border border-b px-3.5">
        <h3 className="flex-1 font-semibold text-xs/4 tracking-[0.02em]">Starters</h3>
        <span className="text-[11px]/3.5 text-muted-foreground tabular-nums">
          {starters.length}
        </span>
      </div>
      <ul className="flex flex-col">
        {starters.map((look) => (
          <li key={look.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => update(starterRecipe(effect, look.value), true)}
                >
                  {/* biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin */}
                  <img
                    src={lookPosterSrc(effect, look.value, surface)}
                    alt=""
                    width={44}
                    height={26}
                    loading="lazy"
                    className="h-6.5 w-11 shrink-0 rounded-[3px] border border-input object-cover"
                    style={{ backgroundColor: STUDIO_GROUND[surface] }}
                  />
                  <span className="min-w-0 flex-1 truncate">{look.label}</span>
                  <span className="font-mono text-[10px]/3 text-muted-foreground uppercase tracking-[0.04em]">
                    {effect.lookTag?.(effect.looks[look.value])}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="max-w-56">
                {look.description}
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </>
  )
}

function PublishedList({
  session,
  history,
  matches,
  patch,
  actions,
}: {
  session: StudioSession
  history: PublishedState[]
  matches: (state: PublishedState) => boolean
  patch: Patch
  actions: StageActions
}) {
  return (
    <>
      <div className="flex h-10 items-center border-border border-y px-3.5">
        <h3 className="flex-1 font-semibold text-xs/4 tracking-[0.02em]">Published</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pressable cursor-pointer text-[11px]/3.5 text-muted-foreground hover:text-foreground"
              onClick={actions.keep}
            >
              Keep
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            Keep this draft to compare against while you keep adjusting
            <Kbd>C</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      <ul className="flex flex-col">
        <SessionRows session={session} patch={patch} />
        {/* A published state does two things, so it is two buttons: the
            row puts it on the stage beside the draft, Restore makes it
            the draft. Looking never changes anything. */}
        {history.map((state, index) => (
          <PublishedRow
            key={state.id}
            state={state}
            onSite={index === 0}
            matchesDraft={matches(state)}
            actions={actions}
          />
        ))}
      </ul>
    </>
  )
}

/** The draft, and the kept comparison when there is one. */
function SessionRows({ session, patch }: { session: StudioSession; patch: Patch }) {
  return (
    <>
      <li>
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted aria-[current]:text-foreground"
          aria-current={!session.showComparison || undefined}
          onClick={() => patch({ showComparison: false })}
        >
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
          <span className="flex-1">Draft</span>
          <span className="text-[11px]/3.5 text-muted-foreground">now</span>
        </button>
      </li>
      {session.comparison && (
        <li>
          <button
            type="button"
            className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted aria-[current]:text-foreground"
            aria-current={session.showComparison || undefined}
            onClick={() => patch({ showComparison: true })}
          >
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
            />
            <span className="flex-1 truncate">{session.comparisonLabel}</span>
            <span className="text-[11px]/3.5 text-muted-foreground tabular-nums">
              {session.comparisonAt ? clock(session.comparisonAt) : ''}
            </span>
          </button>
        </li>
      )}
    </>
  )
}

function PublishedRow({
  state,
  onSite,
  matchesDraft,
  actions,
}: {
  state: PublishedState
  onSite: boolean
  matchesDraft: boolean
  actions: StageActions
}) {
  return (
    <li className="flex items-center gap-2 pr-3.5 transition-colors hover:bg-muted">
      <button
        type="button"
        className="flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-2.5 pl-3.5 text-left text-[13px]/4 text-foreground/80"
        onClick={() => actions.compareState(state)}
      >
        <span
          aria-hidden
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            onSite ? 'bg-success' : 'border border-muted-foreground',
          )}
        />
        <span className="min-w-0 flex-1 truncate tabular-nums">{when(state.at)}</span>
        {/* The filled dot is what is on the site; the column is too
            narrow to say so in words beside a date and Restore. */}
        {matchesDraft && (
          <span className="shrink-0 text-[11px]/3.5 text-muted-foreground">matches draft</span>
        )}
      </button>
      {!matchesDraft && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pressable shrink-0 cursor-pointer text-[11px]/3.5 text-muted-foreground hover:text-foreground"
              onClick={() => actions.restoreState(state, when(state.at))}
            >
              Restore
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="max-w-56">
            Make these settings the draft. The site changes when you publish.
          </TooltipContent>
        </Tooltip>
      )}
    </li>
  )
}

function Viewport({
  live,
  session,
  surface,
  effectId,
  recipe,
  shot,
  lookGround,
  ground,
  state: { validation, budget },
  onTurnOn,
}: {
  live: boolean
  session: StudioSession
  surface: Surface
  effectId: EffectId
  recipe: Recipe
  /** The still on the stage, or nothing for the live look. */
  shot: Shot | null
  lookGround: LookGround
  /** The colour under what is shown, for the stage's face: the draft's or the comparison's own ground, else the site's. */
  ground: string
  state: DraftState
  onTurnOn: () => void
}) {
  const shown = session.showComparison && session.comparison ? session.comparison : recipe
  return (
    <div
      className="relative"
      style={{
        height: session.placement === 'menu' && !shot ? 300 : 495,
        backgroundColor: ground,
      }}
    >
      <PreviewBadge live={live} session={session} surface={surface} shot={shot} />
      {shot ? (
        validation ? (
          <PreviewOff validation={validation} onTurnOn={onTurnOn} />
        ) : (
          <StillViewport effectId={effectId} shot={shot} ground={lookGround} />
        )
      ) : live && !validation ? (
        <Suspense
          fallback={
            <p className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
              Loading preview…
            </p>
          }
        >
          <Preview
            key={`${effectId}:${session.generation}:${session.placement}`}
            effect={effectId}
            recipe={shown}
            placement={session.placement}
            surface={surface}
            ground={ground}
            paused={session.paused}
            generation={session.generation}
          />
        </Suspense>
      ) : (
        <PreviewOff validation={validation} onTurnOn={onTurnOn} />
      )}
      {/* The readout sits over the effect it describes, so it takes the
          same plate as the placement badge: over a live effect, bare
          text is not readable at any ink. */}
      {budget && !shot && <BudgetReadout budget={budget} />}
    </div>
  )
}

function PreviewBadge({
  live,
  session,
  surface,
  shot,
}: {
  live: boolean
  session: StudioSession
  surface: Surface
  shot: Shot | null
}) {
  return (
    <span className="pointer-events-none absolute top-3 left-3 z-10 flex h-6 items-center gap-1.5 rounded-full bg-background/70 pr-2.5 pl-2 font-mono text-[11px]/3.5 text-foreground uppercase tracking-[0.04em] backdrop-blur-xs">
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          !shot && live && !session.paused ? 'bg-primary' : 'bg-muted-foreground',
        )}
      />
      {shot
        ? `Still · ${shot.label} · ${shot.capture.width}×${shot.capture.height} · ${surface}`
        : `${live ? (session.paused ? 'Paused' : 'Live') : 'Off'} · ${session.placement} · ${surface}`}
      {!shot && session.showComparison && ' · comparison'}
    </span>
  )
}

function PreviewOff({ validation, onTurnOn }: { validation: string; onTurnOn: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
      <p className="max-w-xs text-pretty text-center">
        {validation ? validation : 'The live preview is off. Turn it on to see the recipe move.'}
      </p>
      {!validation && (
        <Button type="button" variant="outline" size="sm" onClick={onTurnOn}>
          Turn on the live preview
        </Button>
      )}
    </div>
  )
}

function BudgetReadout({ budget }: { budget: EffectBudget }) {
  return (
    <p
      className={cn(
        'pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-24px)] items-start gap-1.5 rounded-full bg-background/70 py-1 pr-2.5 pl-2 font-mono text-[11px]/3.5 tabular-nums tracking-[0.02em] backdrop-blur-xs',
        budget.capped ? 'text-warning' : 'text-muted-foreground',
      )}
    >
      {budget.capped && (
        <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-warning" />
      )}
      <span>{budget.text}</span>
    </p>
  )
}

/**
 * Face and its ground, then placement and playback for the live look;
 * `children` are the seed and frame of what the stage shows, and the way to
 * its variations. A still has no placement and nothing to play: the controls
 * that only mean something live leave while it is up, rather than sit dimmed.
 */
function Transport({
  live,
  session,
  surface,
  still,
  patch,
  setSurface,
  restart,
  onToggleLive,
  children,
}: {
  live: boolean
  session: StudioSession
  surface: Surface
  still: boolean
  patch: Patch
  setSurface: (next: Surface) => void
  restart: () => void
  onToggleLive: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-4 border-border border-t px-4 py-3">
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          variant="segmented"
          className="w-auto"
          aria-label="Face"
          value={surface}
          onValueChange={(next) => next && setSurface(next as Surface)}
        >
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
        </ToggleGroup>
        <GroundControl surface={surface} />
      </div>
      {!still && (
        <ToggleGroup
          type="single"
          variant="segmented"
          className="w-auto"
          aria-label="Placement"
          value={session.placement}
          onValueChange={(next) => {
            if (!next) return
            patch({ placement: next as VisualPlacement })
            restart()
          }}
        >
          {VISUAL_PLACEMENTS.map((placement) => (
            <ToggleGroupItem key={placement} value={placement} className="capitalize">
              {placement}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {!still && (
        <Playback
          live={live}
          paused={session.paused}
          patch={patch}
          restart={restart}
          onToggleLive={onToggleLive}
        />
      )}
      <div className="ml-auto flex flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

function Playback({
  live,
  paused,
  patch,
  restart,
  onToggleLive,
}: {
  live: boolean
  paused: boolean
  patch: Patch
  restart: () => void
  onToggleLive: () => void
}) {
  return (
    <div className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
      <IconAction
        label={paused ? 'Play' : 'Pause'}
        shortcut="Space"
        onClick={() => patch({ paused: !paused })}
      >
        {paused ? <IconPlayerPlay /> : <IconPlayerPause />}
      </IconAction>
      <IconAction label="Restart" onClick={restart}>
        <IconRefresh />
      </IconAction>
      <IconAction
        label={live ? 'Turn the live preview off' : 'Turn the live preview on'}
        onClick={onToggleLive}
      >
        <span
          aria-hidden
          className={cn('size-2 rounded-full', live ? 'bg-success' : 'bg-muted-foreground')}
        />
      </IconAction>
    </div>
  )
}

function SeedField({
  seed,
  onChange,
  onRandomize,
}: {
  seed: number
  onChange: (seed: number) => void
  onRandomize: () => void
}) {
  return (
    <label
      htmlFor="streak-seed"
      className="flex items-center gap-2 text-muted-foreground text-xs/4"
    >
      Seed
      <span className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
        <Input
          id="streak-seed"
          variant="value"
          type="number"
          className="h-full w-23 rounded-none border-0 px-2.5 text-left"
          min={0}
          max={SEED_MAX}
          value={seed}
          onChange={(event) =>
            onChange(Math.min(SEED_MAX, Math.max(0, Number(event.target.value) || 0)))
          }
        />
        <IconAction label="Randomize seed" shortcut="R" onClick={onRandomize}>
          <IconDice5 />
        </IconAction>
      </span>
    </label>
  )
}

function FrameField({ frame, onChange }: { frame: number; onChange: (frame: number) => void }) {
  const set = (next: number) => onChange(Math.min(FRAME_MAX, Math.max(1, next || 1)))
  return (
    <label
      htmlFor="streak-frame"
      className="flex items-center gap-2 text-muted-foreground text-xs/4"
    >
      Frame
      <span className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Earlier frame"
          className="h-full w-6.5 rounded-none"
          disabled={frame <= 1}
          onClick={() => set(frame - 10)}
        >
          <IconMinus />
        </Button>
        <Input
          id="streak-frame"
          variant="value"
          type="number"
          className="h-full w-12 rounded-none border-0 text-center"
          min={1}
          max={FRAME_MAX}
          value={frame}
          onChange={(event) => set(Number(event.target.value))}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Later frame"
          className="h-full w-6.5 rounded-none"
          disabled={frame >= FRAME_MAX}
          onClick={() => set(frame + 10)}
        >
          <IconPlus />
        </Button>
      </span>
    </label>
  )
}
