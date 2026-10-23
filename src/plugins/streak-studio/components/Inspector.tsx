'use client'

import { keyed } from '@/utilities/reactKeys'
import './studio.css'

import { IconChevronsDown, IconChevronsUp } from '@tabler/icons-react'
import type { JSONFieldClientComponent } from 'payload'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { resolveTuning } from '@/features/immersive/resolve-tuning'
import type { Effect, Tuning } from '@/features/immersive/studio/effect'
import {
  type Recipe,
  resolveRecipeTuning,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { type Still, stillLabel, validateStills } from '@/features/immersive/studio/stills'
import { cn } from '@/utilities/ui'
import { type Stills, useGround, useStills } from './draft'
import { useLook } from './look-store'
import { ParameterRow, RangePairRow, type RowParameter } from './ParameterRow'
import {
  EFFECT_COPY,
  type EffectCopy,
  type GroupSummary,
  lookGroups,
  parameterKeys,
  toHex,
} from './parameters'
import { StillsPanel } from './StillsPanel'
import { draftState } from './status'

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** A collapsed group's one line: text, or the colours it is set to. */
const summaryNode = (summary: GroupSummary) =>
  typeof summary === 'string' ? (
    summary
  ) : (
    <span className="flex gap-1">
      {keyed(summary.swatches, (rgb) => toHex(rgb)).map(({ key, item: rgb }) => (
        <span
          key={key}
          aria-hidden
          className="ring-border size-3 rounded-[3px] ring-1 ring-inset"
          style={{ backgroundColor: toHex(rgb) }}
        />
      ))}
    </span>
  )

/** The message a draft is refused with, or nothing. */
function validationOf(read: () => unknown) {
  try {
    read()
    return ''
  } catch (error) {
    return (error as Error).message
  }
}

/**
 * What the rows edit: the look, whose values depart from the effect's
 * defaults, or one still, whose overrides depart from the look. The rows,
 * the dots and the summaries read the same way for both; only what counts as
 * the base changes, and `base` names it in each tooltip.
 */
type Target = {
  base: 'default' | 'look'
  defaults: Tuning
  tuning: Tuning
  overrides: Tuning
  validation: string
  set: (overrides: Tuning) => void
}

function lookTarget(effect: Effect, recipe: Recipe, update: Stills['update']): Target {
  return {
    base: 'default',
    defaults: effect.defaults,
    tuning: resolveRecipeTuning(effect, recipe),
    overrides: recipe.deltas,
    validation: validationOf(() => validateRecipe(effect, recipe)),
    set: (deltas) => update({ ...recipe, deltas }),
  }
}

function stillTarget(effect: Effect, recipe: Recipe, still: Still, patch: Stills['patch']): Target {
  const defaults = resolveRecipeTuning(effect, recipe)
  return {
    base: 'look',
    defaults,
    tuning: resolveTuning(defaults, still.deltas),
    overrides: still.deltas,
    validation: validationOf(() => validateStills(effect, recipe, [still])),
    set: (deltas) => patch(still.id, { deltas }),
  }
}

/** The target as the panel edits it: what each parameter is set to, and the edits that change it. */
function recipePanel(effect: Effect, copy: EffectCopy, target: Target) {
  const { tuning, validation, defaults, overrides, base } = target
  const change = (patch: Record<string, unknown>) => {
    const next = { ...overrides }
    for (const [name, value] of Object.entries(patch)) {
      if (value === undefined || sameValue(value, defaults[name])) delete next[name]
      else next[name] = value
    }
    target.set(next)
  }
  const reset = (keys: readonly string[]) => {
    const next = { ...overrides }
    for (const name of keys) delete next[name]
    target.set(next)
  }
  const changedKeys = Object.keys(overrides)
  // A pair out of order is the one rule the effect checks across parameters,
  // so its message belongs under the pair rather than under the panel.
  const crossed = copy.ranges?.find(({ keys }) => Number(tuning[keys[0]]) > Number(tuning[keys[1]]))
  return { effect, copy, tuning, defaults, base, validation, change, reset, changedKeys, crossed }
}

type Panel = ReturnType<typeof recipePanel>

/**
 * The rows of a group, without the section around them: the Look tab puts
 * them in a disclosure, the Pointer tab, which is one group, does not.
 */
function rowsOf(
  keys: string[],
  { effect, copy, tuning, defaults, base, validation, change, reset, changedKeys, crossed }: Panel,
) {
  const parameter = (name: string): RowParameter => ({
    name,
    spec: effect.parameters[name],
    copy: copy.parameters[name],
    fallback: defaults[name],
    base,
  })
  return keys.map((name) => {
    const pair = copy.ranges?.find(({ keys: bounds }) => bounds.includes(name))
    if (pair) {
      const [low, high] = pair.keys
      if (name === high) return null
      return (
        <RangePairRow
          key={pair.label}
          label={pair.label}
          low={{ ...parameter(low), value: Number(tuning[low]) }}
          high={{ ...parameter(high), value: Number(tuning[high]) }}
          changed={pair.keys.some((key) => changedKeys.includes(key))}
          error={pair === crossed ? validation : undefined}
          onChange={change}
          onReset={() => reset(pair.keys)}
        />
      )
    }
    const dependency = copy.dependencies[name]
    return (
      <ParameterRow
        key={name}
        parameter={parameter(name)}
        value={tuning[name]}
        changed={changedKeys.includes(name)}
        inactive={dependency && !dependency.active(tuning) ? dependency : undefined}
        hint={copy.hint?.(name, tuning)}
        onChange={(next) => change({ [name]: next })}
        onReset={() => reset([name])}
        onFix={(fix) => fix && change(fix)}
      />
    )
  })
}

/**
 * Which sections are open lives in the Inspector rather than in each group: a
 * document opens with every section shut, so the panel reads as a contents
 * page of what this look is set to before it asks anyone to read a slider;
 * one control can drive them all; and a tab switch, which unmounts the
 * content it leaves, no longer forgets what was open.
 */
function useOpenSections(groups: string[]) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  // Sections are the Look tab's structure, so the control that works them is
  // the Look tab's too. The label names what the press does from here.
  const allOpen = groups.every((name) => openGroups[name])
  const toggleAll = () =>
    setOpenGroups(allOpen ? {} : Object.fromEntries(groups.map((name) => [name, true])))
  return { groups, openGroups, setOpenGroups, allOpen, toggleAll }
}

/**
 * The Inspector: every authorable parameter of the look's effect as a row,
 * grouped into sections on the Look tab and flat on the Pointer tab, and the
 * look's stills on the Stills tab, in the document sidebar so it stays beside
 * the stage on every tab. It reads the rows off the effect's contract and
 * their wording off its copy, so it holds no parameter by name. It is the
 * recipe field's own component: the value it edits is the field's value, so
 * Payload's autosave, versions and validation see every change as they would
 * any other field's. With a still chosen on the Stills tab, the Look and
 * Pointer rows edit that still's overrides instead, and the bar under the
 * tabs says so.
 */
export const Inspector: JSONFieldClientComponent = ({ path }) => {
  const stills = useStills(path)
  const { id, effect, effectId, recipe, update, patch, selected, select, errorMessage } = stills
  const copy = EFFECT_COPY[effectId]
  const { ground } = useGround()
  const look = useLook(id)
  const state = draftState(effect, recipe, ground, stills.stills, look.live)
  const target = selected
    ? stillTarget(effect, recipe, selected, patch)
    : lookTarget(effect, recipe, update)
  const panel = recipePanel(effect, copy, target)
  const { validation, changedKeys } = panel
  const [tab, setTab] = useState('look')
  const sections = useOpenSections(lookGroups(effect, copy))
  const pointerKeys = parameterKeys(effect, copy.pointerGroup)

  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={600}>
      {/* Payload's sidebar gutter is zeroed for the Studio (studio.css), so
          the panel owns its margins: content never touches the column edge,
          and the change dots live in the left one. The trailing space is the
          scroll region's own: the last row of the last group has to clear the
          bottom of the column rather than end on it. */}
      <div data-streak-studio="inspector" className="flex flex-col gap-3 px-(--row-gutter) pb-16">
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <TabStrip
            changed={changedKeys.length}
            stillsApart={state.stillsApart}
            showToggle={tab === 'look'}
            allOpen={sections.allOpen}
            onToggleAll={sections.toggleAll}
          />
          {selected && (
            <SelectionBar
              label={stillLabel(selected)}
              editing={tab !== 'stills'}
              onDone={() => select(null)}
            />
          )}
          <LookTab panel={panel} sections={sections} />
          <PointerTab
            note={copy.pointerNote}
            changed={pointerKeys.filter((k) => changedKeys.includes(k)).length}
            onReset={() => panel.reset(pointerKeys)}
          >
            {rowsOf(pointerKeys, panel)}
          </PointerTab>
          <TabsContent value="stills" className="pt-5">
            <StillsPanel
              stills={stills}
              look={look}
              ground={ground}
              unchangedLook={state.unchangedLook}
              status={state.status}
            />
          </TabsContent>
        </Tabs>
        {(validation || errorMessage) && !panel.crossed && (
          <p role="alert" className="text-destructive text-xs/relaxed">
            {validation || errorMessage}
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * The tab strip is the scroll region's header: it names where you are and
 * carries the changed count, so it stays put while the groups run under it.
 * The strip is the sticky band and owns the hairline; the tab list inside it
 * holds tabs and nothing else, so the controls at its right end stay out of
 * the `tablist`.
 */
function TabStrip({
  changed,
  stillsApart,
  showToggle,
  allOpen,
  onToggleAll,
}: {
  changed: number
  stillsApart: number
  showToggle: boolean
  allOpen: boolean
  onToggleAll: () => void
}) {
  return (
    <div className="border-border bg-background sticky top-0 z-20 -mx-(--row-gutter) flex h-(--inspector-tabs) items-center gap-5 border-b px-(--row-gutter)">
      <TabsList variant="line" className="h-full gap-5 border-b-0">
        <TabsTrigger value="look">Look</TabsTrigger>
        <TabsTrigger value="pointer">Pointer</TabsTrigger>
        <TabsTrigger value="stills" className="gap-1.5">
          Stills
          {/* A still that will render on publish is marked where the tab is,
              so the count of edits on the strip stays the count of rows. */}
          {stillsApart > 0 && <span aria-hidden className="bg-warning size-1.5 rounded-full" />}
          {stillsApart > 0 && (
            <span className="sr-only">{stillsApart} stills render on publish</span>
          )}
        </TabsTrigger>
      </TabsList>
      {/* The count and the section control are the strip's right end:
          what has changed, and how much of the panel is open. The
          control is left out of the tabs that have no sections to
          work, rather than shown there dimmed; its slot stays, so the
          count, the one thing on the strip that outlives a tab switch,
          does not move when the tab changes. */}
      <div className="ml-auto flex items-center gap-2.5">
        <span
          className="text-primary font-mono text-[11px]/3.5 tracking-[0.02em] tabular-nums"
          aria-live="polite"
        >
          {changed ? `${changed} changed` : ''}
        </span>
        <div className="-mr-1 size-6 shrink-0">
          {showToggle && <ToggleAllButton allOpen={allOpen} onClick={onToggleAll} />}
        </div>
      </div>
    </div>
  )
}

/**
 * The one line that says what the rows are editing while a still is chosen:
 * a still's overrides, not the look. It parks under the tab strip on every
 * tab, and Done puts the look back under the rows and on the stage.
 */
function SelectionBar({
  label,
  editing,
  onDone,
}: {
  label: string
  editing: boolean
  onDone: () => void
}) {
  return (
    <div
      role="status"
      className="border-border bg-muted/60 sticky top-(--inspector-tabs) z-20 -mx-(--row-gutter) flex min-h-8 items-center gap-2.5 border-b px-(--row-gutter) text-[11px]/4 backdrop-blur-xs"
    >
      <span aria-hidden className="bg-primary size-1.5 shrink-0 rounded-full" />
      <span className="text-foreground min-w-0 flex-1 truncate">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {editing ? ' · the rows override the look for this still' : ' · on the stage'}
        </span>
      </span>
      <button
        type="button"
        className="pressable text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
        onClick={onDone}
      >
        Done
      </button>
    </div>
  )
}

function ToggleAllButton({ allOpen, onClick }: { allOpen: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={allOpen ? 'Collapse all sections' : 'Expand all sections'}
          className="pressable text-muted-foreground hover:text-foreground focus-visible:ring-ring/30 flex size-full cursor-pointer items-center justify-center rounded-sm outline-none focus-visible:ring-2"
          onClick={onClick}
        >
          {allOpen ? (
            <IconChevronsUp aria-hidden className="size-3.5" />
          ) : (
            <IconChevronsDown aria-hidden className="size-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {allOpen ? 'Collapse all' : 'Expand all'}
      </TooltipContent>
    </Tooltip>
  )
}

function LookTab({
  panel,
  sections: { groups, openGroups, setOpenGroups },
}: {
  panel: Panel
  sections: ReturnType<typeof useOpenSections>
}) {
  const { effect, copy, tuning, changedKeys, reset } = panel
  return (
    <TabsContent value="look" className="flex flex-col pt-5">
      {groups.map((name) => {
        const keys = parameterKeys(effect, name)
        return (
          <Group
            key={name}
            name={name}
            summary={summaryNode(copy.summary(name, tuning))}
            changed={keys.filter((k) => changedKeys.includes(k)).length}
            open={openGroups[name] ?? false}
            onOpenChange={(next) => setOpenGroups((state) => ({ ...state, [name]: next }))}
            onReset={() => reset(keys)}
          >
            {rowsOf(keys, panel)}
          </Group>
        )
      })}
    </TabsContent>
  )
}

/**
 * One group's worth of rows, so they are not put behind a disclosure: a
 * section that opens onto the whole tab is a click between the editor and the
 * only thing there. The tab names the section, the paragraph says when the
 * terms run, and Reset keeps the place it holds in a section header.
 */
function PointerTab({
  note,
  changed,
  onReset,
  children,
}: {
  note: string
  changed: number
  onReset: () => void
  children: React.ReactNode
}) {
  return (
    <TabsContent value="pointer" className="flex flex-col pt-5">
      <div className="flex items-start gap-4">
        <p className="text-muted-foreground min-w-0 flex-1 text-xs/5">{note}</p>
        {/* Hidden rather than absent: the note beside it keeps one wrap
            whether or not anything has been changed, so a slider does
            not push every row down the moment it leaves its default. */}
        <button
          type="button"
          aria-label="Reset pointer terms"
          className={cn(
            'pressable text-muted-foreground hover:text-foreground shrink-0 cursor-pointer text-[11px]/5',
            changed === 0 && 'invisible',
          )}
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <div className="border-border mt-4 flex flex-col gap-0.5 border-t pt-3">{children}</div>
    </TabsContent>
  )
}

/**
 * One section of the Inspector. The header is a row, not a single button:
 * the trigger takes the name and, while the group is closed, the one line
 * that says what it is set to. Reset is a real button beside it, and it is
 * there only when the group has something to reset: an always-present,
 * always-dimmed control is chrome, not an affordance. Nothing counts the
 * changed values: the dots in the gutter already mark them row by row, and
 * the total lives once, in the tab strip. Open is the panel's state, not the
 * section's, so one control in that strip can work them all.
 */
function Group({
  name,
  summary,
  changed,
  open,
  onOpenChange,
  onReset,
  children,
}: {
  name: string
  summary: React.ReactNode
  changed: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => void
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-border border-b">
      {/* The section header parks under the tab strip while its own rows
          scroll, and hands over when the next group reaches it — so the name
          of the thing being edited is never off screen. */}
      <div className="bg-background sticky top-(--inspector-tabs) z-10 -mx-(--row-gutter) flex items-center gap-2.5 px-(--row-gutter)">
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground data-[state=open]:text-foreground w-auto min-w-0 flex-1 text-[11px]/4 tracking-[0.06em] uppercase">
          {name}
          {!open && (
            <span className="text-muted-foreground ml-auto flex items-center gap-2 font-mono text-[11px]/3.5 font-normal tracking-normal whitespace-nowrap normal-case tabular-nums">
              {changed > 0 && (
                <>
                  <span aria-hidden className="bg-primary size-1.5 shrink-0 rounded-full" />
                  <span className="sr-only">{changed} changed</span>
                </>
              )}
              {summary}
            </span>
          )}
        </CollapsibleTrigger>
        {open && changed > 0 && (
          <button
            type="button"
            aria-label={`Reset ${name}`}
            className="pressable text-muted-foreground hover:text-foreground shrink-0 cursor-pointer text-[11px]/3.5"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
