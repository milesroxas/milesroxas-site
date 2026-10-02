'use client'

import './studio.css'

import { Link, toast } from '@payloadcms/ui'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDice5,
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
} from '@/features/immersive/studio/effect'
import { EFFECT_OPTIONS, type EffectId } from '@/features/immersive/studio/effects'
import {
  canonicalJSON,
  FRAME_MAX,
  type Recipe,
  resolveRecipeTuning,
  SEED_MAX,
  type Snapshot,
  snapshotChanges,
  snapshotRecipe,
  starterRecipe,
} from '@/features/immersive/studio/recipe'
import { VISUAL_PLACEMENTS, type VisualPlacement } from '@/features/immersive/visual/placement'
import { cn } from '@/utilities/ui'
import { useDraft } from './draft'
import { when } from './History'
import { type LookState, type LookUse, type PublishedState, useLook } from './look-store'
import { EFFECT_COPY } from './parameters'
import { type StudioSession, studioStore, useStudioSession } from './store'

const Preview = lazy(() =>
  import('@/features/immersive').then((module) => ({ default: module.StudioPreview })),
)

type Draft = ReturnType<typeof useDraft>
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
  const draftKey = snapshot ? canonicalJSON(snapshot) : ''
  return {
    validation,
    draftKey,
    unchanged: Boolean(published && published.key === draftKey),
    // The published state the draft is identical to, whichever one it is: a
    // restored state matches itself, not "12 changes since published".
    matched: history.find((state) => state.key === draftKey),
    sincePublished:
      snapshot && published ? snapshotChanges(snapshot, JSON.parse(published.key)) : null,
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

function stageActions({
  key,
  effect,
  effectId,
  recipe,
  setValue,
  update,
  restore,
  changeEffect,
}: Draft) {
  return {
    // A look's effect is open until it is first published; the draft starts over with it.
    chooseEffect: (next: EffectId) => {
      if (next === effectId) return
      if (
        Object.keys(recipe.deltas).length &&
        !window.confirm('Changing the effect starts this draft over. Continue?')
      )
        return
      changeEffect(next)
    },
    undo: () => {
      const previous = studioStore.undo(key, recipe)
      if (previous) setValue(previous)
    },
    redo: () => {
      const next = studioStore.redo(key, recipe)
      if (next) setValue(next)
    },
    keep: () => {
      studioStore.patch(key, {
        comparison: recipe,
        comparisonLabel: 'Kept comparison',
        comparisonAt: Date.now(),
        showComparison: false,
      })
    },
    restoreState: (state: PublishedState, label: string) => {
      try {
        restore(state.recipe)
        toast.success(`The draft is back at ${label}. Undo brings your changes back.`)
      } catch {
        toast.error('This state holds values the current ranges no longer accept.')
      }
    },
    compareState: (state: PublishedState) =>
      studioStore.patch(key, {
        comparison: state.recipe,
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
  (session: StudioSession, patch: Patch, randomize: () => void) => (event: React.KeyboardEvent) => {
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
 * the chosen placement and ground, and
 * the session controls. Edits happen in the Inspector (the recipe field, in
 * the sidebar); the stage reads the same field and shows the result, or a
 * comparison when asked.
 *
 * A look has a draft and what is published. Publish puts the draft on the
 * site, everywhere the look is used; Reset to published and Restore copy a
 * published state back into the draft.
 */
export const Stage: UIFieldClientComponent = () => {
  const draft = useDraft()
  const { id, key, effect, effectId, recipe, update } = draft
  const session = useStudioSession(key)
  const look = useLook(id)
  const [live, setLive] = useState(true)
  const state = compareDraft(effect, recipe, session, look)
  const actions = stageActions(draft)
  const patch: Patch = (next) => studioStore.patch(key, next)

  useUndoShortcut(actions.undo, actions.redo)

  return (
    <TooltipProvider delayDuration={400}>
      <section
        data-streak-studio
        aria-label={EFFECT_COPY[effectId].title}
        className="@container flex flex-col overflow-hidden rounded-lg border border-input bg-background"
        onKeyDown={stageKeys(session, patch, actions.randomize)}
      >
        <StageHeader draft={draft} look={look} state={state} session={session} actions={actions} />
        <div className="grid grid-cols-1 @[768px]:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-border bg-card @[768px]:border-r @[768px]:border-b-0">
            <StarterList effect={effect} surface={session.surface} update={update} />
            <PublishedList
              session={session}
              history={look.history}
              draftKey={state.draftKey}
              patch={patch}
              actions={actions}
            />
          </aside>
          <div className="flex min-w-0 flex-col">
            <Viewport
              live={live}
              session={session}
              effectId={effectId}
              recipe={recipe}
              state={state}
              onTurnOn={() => setLive(true)}
            />
            <Transport
              live={live}
              session={session}
              patch={patch}
              restart={() => studioStore.restart(key)}
              onToggleLive={() => setLive((v) => !v)}
            >
              {effect.seeded && (
                <SeedField recipe={recipe} update={update} onRandomize={actions.randomize} />
              )}
              <FrameField recipe={recipe} update={update} />
            </Transport>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}

function StageHeader({
  draft: { id, key, effectId },
  look: { loaded, live: published, uses },
  state,
  session,
  actions,
}: {
  draft: Draft
  look: LookState
  state: DraftState
  session: StudioSession
  actions: StageActions
}) {
  return (
    <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-2 pr-4 pl-5">
      <DraftStatus
        title={EFFECT_COPY[effectId].title}
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
      <h2 className="text-[15px]/5 font-semibold">{title}</h2>
      {/* The status sets on the title's baseline, so the dot rides in
          the text rather than leading a flex row: a flex container takes
          its baseline from its first item, and an empty 6px span has
          none to give — the line would sit a pixel or two off the
          heading beside it. */}
      <p className="text-xs/4 text-muted-foreground">
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
      <div className="flex h-10 items-center border-b border-border px-3.5">
        <h3 className="flex-1 text-xs/4 font-semibold tracking-[0.02em]">Starters</h3>
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
                  <span className="font-mono text-[10px]/3 tracking-[0.04em] text-muted-foreground uppercase">
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
  draftKey,
  patch,
  actions,
}: {
  session: StudioSession
  history: PublishedState[]
  draftKey: string
  patch: Patch
  actions: StageActions
}) {
  return (
    <>
      <div className="flex h-10 items-center border-y border-border px-3.5">
        <h3 className="flex-1 text-xs/4 font-semibold tracking-[0.02em]">Published</h3>
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
            matchesDraft={state.key === draftKey}
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
  effectId,
  recipe,
  state: { validation, budget },
  onTurnOn,
}: {
  live: boolean
  session: StudioSession
  effectId: EffectId
  recipe: Recipe
  state: DraftState
  onTurnOn: () => void
}) {
  const shown = session.showComparison && session.comparison ? session.comparison : recipe
  return (
    <div
      className="relative"
      style={{
        height: session.placement === 'menu' ? 300 : 495,
        backgroundColor: STUDIO_GROUND[session.surface],
      }}
    >
      <PreviewBadge live={live} session={session} />
      {live && !validation ? (
        <Suspense
          fallback={
            <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Loading preview…
            </p>
          }
        >
          <Preview
            key={`${effectId}:${session.generation}:${session.placement}`}
            effect={effectId}
            recipe={shown}
            placement={session.placement}
            surface={session.surface}
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
      {budget && <BudgetReadout budget={budget} />}
    </div>
  )
}

function PreviewBadge({ live, session }: { live: boolean; session: StudioSession }) {
  return (
    <span className="pointer-events-none absolute top-3 left-3 z-10 flex h-6 items-center gap-1.5 rounded-full bg-background/70 pr-2.5 pl-2 font-mono text-[11px]/3.5 tracking-[0.04em] text-foreground uppercase backdrop-blur-xs">
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          live && !session.paused ? 'bg-primary' : 'bg-muted-foreground',
        )}
      />
      {live ? (session.paused ? 'Paused' : 'Live') : 'Off'} · {session.placement} ·{' '}
      {session.surface}
      {session.showComparison && ' · comparison'}
    </span>
  )
}

function PreviewOff({ validation, onTurnOn }: { validation: string; onTurnOn: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
      <p className="max-w-xs text-center text-pretty">
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
        'pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-24px)] items-start gap-1.5 rounded-full bg-background/70 py-1 pr-2.5 pl-2 font-mono text-[11px]/3.5 tracking-[0.02em] backdrop-blur-xs tabular-nums',
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

/** Surface, placement and playback; `children` are the recipe's own seed and frame fields. */
function Transport({
  live,
  session,
  patch,
  restart,
  onToggleLive,
  children,
}: {
  live: boolean
  session: StudioSession
  patch: Patch
  restart: () => void
  onToggleLive: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-4 border-t border-border px-4 py-3">
      <ToggleGroup
        type="single"
        variant="segmented"
        className="w-auto"
        value={session.surface}
        onValueChange={(next) => next && patch({ surface: next as 'dark' | 'light' })}
      >
        <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
        <ToggleGroupItem value="light">Light</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="segmented"
        className="w-auto"
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
      <Playback
        live={live}
        paused={session.paused}
        patch={patch}
        restart={restart}
        onToggleLive={onToggleLive}
      />
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
  recipe,
  update,
  onRandomize,
}: {
  recipe: Recipe
  update: Update
  onRandomize: () => void
}) {
  return (
    <label
      htmlFor="streak-seed"
      className="flex items-center gap-2 text-xs/4 text-muted-foreground"
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
          value={recipe.seed}
          onChange={(event) => {
            const seed = Math.min(SEED_MAX, Math.max(0, Number(event.target.value) || 0))
            update({ ...recipe, seed }, true)
          }}
        />
        <IconAction label="Randomize seed" shortcut="R" onClick={onRandomize}>
          <IconDice5 />
        </IconAction>
      </span>
    </label>
  )
}

function FrameField({ recipe, update }: { recipe: Recipe; update: Update }) {
  return (
    <label
      htmlFor="streak-frame"
      className="flex items-center gap-2 text-xs/4 text-muted-foreground"
    >
      Frame
      <span className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Earlier frame"
          className="h-full w-6.5 rounded-none"
          disabled={recipe.frame <= 1}
          onClick={() => update({ ...recipe, frame: Math.max(1, recipe.frame - 10) })}
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
          value={recipe.frame}
          onChange={(event) =>
            update({
              ...recipe,
              frame: Math.min(FRAME_MAX, Math.max(1, Number(event.target.value) || 1)),
            })
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Later frame"
          className="h-full w-6.5 rounded-none"
          disabled={recipe.frame >= FRAME_MAX}
          onClick={() => update({ ...recipe, frame: Math.min(FRAME_MAX, recipe.frame + 10) })}
        >
          <IconPlus />
        </Button>
      </span>
    </label>
  )
}
