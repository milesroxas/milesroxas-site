'use client'

import { toast, useDocumentInfo, useForm } from '@payloadcms/ui'
import { IconDownload, IconExternalLink, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type LookGround, studioGround } from '@/features/immersive/studio/ground'
import { POSTER_CAPTURE } from '@/features/immersive/studio/recipe'
import {
  STILL_USE_IDS,
  STILL_USES,
  type Still,
  type StillUse,
  type StillUseSpec,
  stillLabel,
} from '@/features/immersive/studio/stills'
import { cn } from '@/utilities/ui'
import type { Stills } from './draft'
import type { LookState } from './look-store'
import { renderStill } from './publish'
import { SettingRow, SettingToggle } from './SettingRow'
import type { StillStatus } from './status'
import type { StillSelection } from './store'

const SCALES = [
  ['1', '1×'],
  ['2', '2×'],
] as const

const STATUS_COPY: Record<StillStatus, { text: string; tone: string }> = {
  live: { text: 'On the site', tone: 'bg-success' },
  changed: { text: 'Re-renders on publish', tone: 'bg-warning' },
  new: { text: 'Not published', tone: 'bg-muted-foreground' },
}

const spec = (use: StillUse) => STILL_USES[use] as StillUseSpec

/** A tab opened on the click, while the browser still counts it as the editor's; the file loads in it once it is filed. */
function openTab() {
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null
  return tab
}

const absolute = (url: string) => new URL(url, window.location.origin).href

type PanelProps = {
  stills: Stills
  look: LookState
  ground: LookGround
  unchangedLook: boolean
  status: (still: Still) => StillStatus
}

/**
 * The Inspector's Stills tab: the look's static renders, one per use, and the
 * poster pair that every look has. Choosing one puts it on the stage, where
 * the seed, the moment and the face are set, and makes the Look and Pointer
 * tabs edit its own overrides. What is here is the still's output: its use,
 * size, density and encoding, and the ways out: open, download, remove.
 * Publish renders every still that is not already on the site as the draft
 * has it.
 */
export function StillsPanel({ stills, look, ground, unchangedLook, status }: PanelProps) {
  const { selection, selected, select, add } = stills
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground max-w-[58ch] text-xs/5">
        Stills are shots of this look for one use each. The site serves the preview card wherever
        the look opens a page; the rest are yours to download. Publish renders what changed.
      </p>
      <ul className="divide-border border-border flex flex-col divide-y border-y">
        <PosterRow
          selected={selection === 'poster'}
          poster={look.live?.poster ?? null}
          ground={ground}
          state={unchangedLook ? 'live' : look.live ? 'changed' : 'new'}
          onSelect={() => select(selection === 'poster' ? null : 'poster')}
        />
        {stills.stills.map((still) => (
          <StillRow
            key={still.id}
            still={still}
            selected={selection === still.id}
            thumbnail={thumbnailOf(still, look)}
            ground={ground}
            state={status(still)}
            onSelect={() => select(selection === still.id ? null : still.id)}
          />
        ))}
      </ul>
      <AddStill stills={stills.stills} onAdd={add} />
      {selected && (
        <StillSettings
          key={selected.id}
          still={selected}
          stills={stills}
          look={look}
          ground={ground}
          state={status(selected)}
          select={select}
        />
      )}
    </div>
  )
}

/** The admin thumbnail of a still's published render, when the site has one. */
function thumbnailOf(still: Still, look: LookState) {
  const published = look.live?.stills.find((candidate) => candidate.id === still.id)
  return published ? (look.live?.renders.get(published.media)?.thumbnail ?? null) : null
}

function Row({
  selected,
  title,
  meta,
  state,
  thumbnail,
  aspect,
  ground,
  onSelect,
}: {
  selected: boolean
  title: string
  meta: string
  state: StillStatus
  thumbnail: string | null
  aspect: string
  ground: string
  onSelect: () => void
}) {
  const { text, tone } = STATUS_COPY[state]
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        className={cn(
          'hover:bg-muted flex w-full cursor-pointer items-center gap-3 py-2 text-left transition-colors',
          '-mx-(--row-gutter) w-[calc(100%+2*var(--row-gutter))] px-(--row-gutter)',
          selected && 'bg-muted',
        )}
        onClick={onSelect}
      >
        <span
          className="border-input flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border"
          style={{ backgroundColor: ground }}
        >
          <span
            className="block max-h-full max-w-full overflow-hidden"
            style={{ aspectRatio: aspect, height: '100%' }}
          >
            {thumbnail && (
              <img src={thumbnail} alt="" loading="lazy" className="size-full object-cover" />
            )}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              'truncate text-xs/4',
              selected ? 'text-foreground' : 'text-foreground/80',
            )}
          >
            {title}
          </span>
          <span className="text-muted-foreground truncate font-mono text-[11px]/3.5 tabular-nums">
            {meta}
          </span>
        </span>
        <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11px]/3.5">
          <span aria-hidden className={cn('size-1.5 rounded-full', tone)} />
          {text}
        </span>
      </button>
    </li>
  )
}

function PosterRow({
  selected,
  poster,
  ground,
  state,
  onSelect,
}: {
  selected: boolean
  poster: string | null
  ground: LookGround
  state: StillStatus
  onSelect: () => void
}) {
  return (
    <Row
      selected={selected}
      title="Poster"
      meta={`${POSTER_CAPTURE.width} × ${POSTER_CAPTURE.height} · both faces · alpha`}
      state={state}
      thumbnail={poster}
      aspect={`${POSTER_CAPTURE.width} / ${POSTER_CAPTURE.height}`}
      ground={studioGround(ground, 'dark')}
      onSelect={onSelect}
    />
  )
}

function StillRow({
  still,
  selected,
  thumbnail,
  ground,
  state,
  onSelect,
}: {
  still: Still
  selected: boolean
  thumbnail: string | null
  ground: LookGround
  state: StillStatus
  onSelect: () => void
}) {
  return (
    <Row
      selected={selected}
      title={stillLabel(still)}
      meta={`${still.width} × ${still.height}${still.scale > 1 ? ` · ${still.scale}×` : ''} · ${still.surface}`}
      state={state}
      thumbnail={thumbnail}
      aspect={`${still.width} / ${still.height}`}
      ground={studioGround(ground, still.surface)}
      onSelect={onSelect}
    />
  )
}

/** The uses a look can still take: a single use already held is offered no second time. */
function AddStill({ stills, onAdd }: { stills: Still[]; onAdd: (use: StillUse) => void }) {
  const held = new Set(stills.map((still) => still.use))
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="w-fit">
          <IconPlus aria-hidden />
          Add still
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {STILL_USE_IDS.map((use) => {
          const { label, description, width, height, single } = spec(use)
          const taken = Boolean(single && held.has(use))
          return (
            <DropdownMenuItem
              key={use}
              disabled={taken}
              className="flex-col items-start gap-0.5"
              onSelect={() => onAdd(use)}
            >
              <span className="flex w-full items-baseline gap-2">
                <span className="flex-1">{label}</span>
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {width} × {height}
                </span>
              </span>
              <span className="text-muted-foreground text-[11px]/4">
                {taken ? 'This look has one.' : description}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** A still's output settings and the ways out of the Studio with it. */
function StillSettings({
  still,
  stills,
  look,
  ground,
  state,
  select,
}: {
  still: Still
  stills: Stills
  look: LookState
  ground: LookGround
  state: StillStatus
  select: (next: StillSelection) => void
}) {
  const { id, effectId, recipe, patch, remove } = stills
  const { submit } = useForm()
  const { title } = useDocumentInfo()
  const [busy, setBusy] = useState<'open' | 'download' | null>(null)
  const set = (next: Partial<Still>) => patch(still.id, next)
  const overrides = Object.keys(still.deltas).length
  const custom = still.use === 'custom'

  /** The still's file: the published render while it is what the draft asks for, else one rendered now. */
  const fileFor = async () => {
    const published = look.live?.stills.find((candidate) => candidate.id === still.id)
    const render = published && look.live?.renders.get(published.media)
    if (state === 'live' && render) return absolute(render.url)
    if (!id) throw new Error('Save this look first.')
    const media = await renderStill(
      submit,
      { id, effect: effectId, recipe, ground, stills: stills.stills },
      still,
    )
    if (!media.url) throw new Error('The still was filed without a URL.')
    return absolute(media.url)
  }

  const open = async () => {
    const tab = openTab()
    setBusy('open')
    try {
      const url = await fileFor()
      if (tab) tab.location.href = url
    } catch (error) {
      tab?.close()
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const download = async () => {
    setBusy('download')
    try {
      const url = await fileFor()
      const name = `${title || 'look'} ${stillLabel(still)}`.replace(/[^\w.-]+/g, '-')
      const blob = await fetch(url)
        .then((response) => (response.ok ? response.blob() : null))
        .catch(() => null)
      const anchor = document.createElement('a')
      anchor.href = blob ? URL.createObjectURL(blob) : url
      anchor.download = `${name}.${still.format}`
      anchor.rel = 'noopener'
      anchor.click()
      if (blob) setTimeout(() => URL.revokeObjectURL(anchor.href), 1000)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      className="border-border flex flex-col border-t pt-3"
      aria-label={`${stillLabel(still)} settings`}
    >
      <p className="text-muted-foreground pb-2 text-[11px]/4">
        On the stage. Seed, moment and face are set there; the Look and Pointer tabs now edit this
        still's own overrides.
      </p>
      <SettingRow label="Use" htmlFor="studio-still-use">
        <Select
          value={still.use}
          onValueChange={(next) => {
            const use = next as StillUse
            const { width, height } = spec(use)
            set({
              use,
              width: use === 'custom' ? still.width : width,
              height: use === 'custom' ? still.height : height,
              transparent: use === 'custom' ? still.transparent : false,
              label: use === 'custom' ? still.label || 'Custom' : undefined,
            })
          }}
        >
          <SelectTrigger size="field" id="studio-still-use" className="col-span-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {STILL_USE_IDS.map((use) => {
              const { label, description, single } = spec(use)
              const taken =
                single && use !== still.use && stills.stills.some((other) => other.use === use)
              return (
                <SelectItem
                  key={use}
                  value={use}
                  disabled={Boolean(taken)}
                  description={description}
                >
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </SettingRow>
      {custom && (
        <SettingRow label="Name" htmlFor="studio-still-label">
          <Input
            id="studio-still-label"
            variant="value"
            className="col-span-2 w-full text-left"
            maxLength={80}
            value={still.label ?? ''}
            onChange={(event) => set({ label: event.target.value })}
          />
        </SettingRow>
      )}
      {custom && <SizeRow still={still} set={set} />}
      <SettingToggle
        label="Scale"
        value={String(still.scale)}
        options={SCALES}
        onChange={(next) => set({ scale: Number(next) as Still['scale'] })}
      />
      <SettingRow label="Format" htmlFor="studio-still-format">
        <Select
          value={still.format}
          onValueChange={(next) =>
            set({
              format: next as Still['format'],
              transparent: next === 'jpeg' ? false : still.transparent,
            })
          }
        >
          <SelectTrigger size="field" id="studio-still-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      {custom && (
        <SettingRow label="Alpha" htmlFor="studio-still-transparent">
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox
              id="studio-still-transparent"
              checked={still.transparent}
              disabled={still.format === 'jpeg'}
              onCheckedChange={(checked) => set({ transparent: checked === true })}
            />
            <span className="text-muted-foreground text-[11px]/4">
              {still.format === 'jpeg' ? 'JPEG is always filled.' : 'Transparent ground.'}
            </span>
          </div>
        </SettingRow>
      )}
      <SettingRow label="Overrides">
        <span className="text-muted-foreground col-span-2 flex items-center gap-3 text-[11px]/4">
          <span className="flex-1">
            {overrides
              ? `${overrides} ${overrides === 1 ? 'setting departs' : 'settings depart'} from the look.`
              : 'As the look runs, at this seed and moment.'}
          </span>
          {overrides > 0 && (
            <button
              type="button"
              className="pressable hover:text-foreground cursor-pointer"
              onClick={() => set({ deltas: {} })}
            >
              Reset
            </button>
          )}
        </span>
      </SettingRow>
      <div className="border-border mt-3 flex flex-wrap items-center gap-1 border-t pt-3">
        <Button type="button" variant="outline" size="sm" disabled={busy !== null} onClick={open}>
          <IconExternalLink aria-hidden />
          {busy === 'open' ? 'Rendering…' : state === 'live' ? 'Open' : 'Render and open'}
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy !== null} onClick={download}>
          <IconDownload aria-hidden />
          {busy === 'download' ? 'Rendering…' : 'Download'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground ml-auto"
          disabled={busy !== null}
          onClick={() => {
            remove(still.id)
            select(null)
            toast.success('Removed. Undo brings it back.')
          }}
        >
          Remove
        </Button>
      </div>
    </section>
  )
}

/** A side of a custom still: free while typed, held to 320 to 1920 on commit. */
function SideField({
  id,
  label,
  value,
  onCommit,
}: {
  id?: string
  label: string
  value: number
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [editing, setEditing] = useState(false)
  const shown = editing ? draft : String(value)
  const commit = () => {
    setEditing(false)
    const next = Math.round(Number.parseFloat(draft))
    if (Number.isFinite(next)) onCommit(Math.min(1920, Math.max(320, next)))
  }
  return (
    <Input
      id={id}
      variant="value"
      className="min-w-0 flex-1"
      type="number"
      inputMode="numeric"
      aria-label={label}
      min={320}
      max={1920}
      value={shown}
      onFocus={() => {
        setDraft(String(value))
        setEditing(true)
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
          event.currentTarget.blur()
        }
      }}
    />
  )
}

function SizeRow({ still, set }: { still: Still; set: (next: Partial<Still>) => void }) {
  const megapixels = (still.width * still.height * still.scale ** 2) / 1_000_000
  return (
    <SettingRow label="Size" htmlFor="studio-still-width">
      <div className="flex items-center gap-1.5">
        <SideField
          id="studio-still-width"
          label="Width"
          value={still.width}
          onCommit={(width) => set({ width })}
        />
        <span className="text-muted-foreground shrink-0 text-[11px]">×</span>
        <SideField label="Height" value={still.height} onCommit={(height) => set({ height })} />
      </div>
      <span className="text-muted-foreground text-right font-mono text-[11px]/3.5 tabular-nums">
        {megapixels.toFixed(1)} MP
      </span>
    </SettingRow>
  )
}
