'use client'

import './studio.css'

import { toast, useDocumentDrawer, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import { IconPlus } from '@tabler/icons-react'
import type { RelationshipFieldClientComponent } from 'payload'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  isLookId,
  lookOptions,
  lookPosterSrc,
  STUDIO_GROUND,
} from '@/features/immersive/studio/effect'
import {
  DEFAULT_EFFECT,
  type EffectId,
  effectOf,
  isEffectId,
} from '@/features/immersive/studio/effects'
import { emptyRecipe, starterRecipe } from '@/features/immersive/studio/recipe'
import type { VisualPlacement } from '@/features/immersive/visual/placement'
import type { Media, StreakLook } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { EFFECT_COPY } from './parameters'
import { EFFECT_FIELD, LOOKS_SLUG } from './paths'
import { sessionKey, studioStore } from './store'

const idOf = (value: unknown): number | null =>
  value && typeof value === 'object' && 'id' in value
    ? Number(value.id)
    : value
      ? Number(value)
      : null

const posterOf = (look: StreakLook) =>
  look.thumbnail && typeof look.thumbnail === 'object'
    ? ((look.thumbnail as Media).sizes?.thumbnail?.url ?? (look.thumbnail as Media).url)
    : null

/**
 * The sibling that says which effect the slot chose, from this field's path:
 * `<slot>.shader.studio` answers to `<slot>.visualType`, and the menu preview's
 * group to `menuPreviewType`.
 */
const slotTypePath = (path: string) => {
  const segments = path.split('.').slice(0, -1)
  const group = segments.pop()
  return [...segments, group === 'menuPreviewShader' ? 'menuPreviewType' : 'visualType'].join('.')
}

/** Where in the document the slot sits, read from the field's path: the new look's name and its stage. */
const slotOf = (path: string): { label: string; placement: VisualPlacement } =>
  path.includes('menuPreview')
    ? { label: 'Menu preview', placement: 'menu' }
    : /(^|\.)hero\./.test(path)
      ? { label: 'Hero', placement: 'hero' }
      : { label: 'Block', placement: 'block' }

function Card({
  src,
  title,
  caption,
  selected,
  disabled,
  onClick,
  children,
}: {
  src?: string | null
  title: string
  caption?: string
  selected?: boolean
  disabled?: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'pressable flex cursor-pointer flex-col gap-1.5 rounded-md border p-1.5 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60',
        selected ? 'border-primary' : 'border-input',
      )}
    >
      <span
        className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm text-muted-foreground"
        style={{ backgroundColor: STUDIO_GROUND.dark }}
      >
        {src ? (
          // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          children
        )}
      </span>
      <span className="flex min-w-0 flex-col px-0.5 pb-0.5">
        <span className="truncate text-xs/4 font-medium">{title}</span>
        {caption && <span className="truncate text-[11px]/4 text-muted-foreground">{caption}</span>}
      </span>
    </button>
  )
}

type Slot = ReturnType<typeof useSlot>

/** The slot this field fills: the look it holds, its shipped-look sibling and the effect it chose. */
function useSlot(path: string) {
  const { value, setValue, showError, errorMessage } = useField<number | null>({ path })
  const preset = useField<string | null>({ path: path.replace(/studio$/, 'preset') })
  const { title: pageTitle } = useDocumentInfo()
  const chosen = useFormFields(([fields]) => fields[slotTypePath(path)]?.value)
  const effectId = isEffectId(chosen) ? chosen : DEFAULT_EFFECT
  return {
    ...slotOf(path),
    id: idOf(value),
    setValue,
    preset,
    pageTitle,
    effectId,
    effect: effectOf(effectId),
    noun: EFFECT_COPY[effectId].noun,
    error: (showError && errorMessage) || (preset.showError && preset.errorMessage),
  }
}

/**
 * The published document: its title and poster are what the site shows. A
 * field that was never published answers with its draft and no poster.
 */
function useSelectedLook(id: number | null, isDrawerOpen: boolean) {
  const [selected, setSelected] = useState<StreakLook | null>(null)
  const loadSelected = useCallback(async () => {
    if (!id) return setSelected(null)
    const response = await fetch(`/api/${LOOKS_SLUG}/${id}?draft=false&depth=1`)
    setSelected(response.ok ? await response.json() : null)
  }, [id])
  // Closing the drawer is the moment the field may have been published.
  useEffect(() => {
    if (!isDrawerOpen) void loadSelected().catch(() => {})
  }, [isDrawerOpen, loadSelected])
  return selected
}

/**
 * The slot's effect changed under what it held: a look filed under another
 * effect cannot be drawn here, and a shipped look's id means nothing to this
 * one, so the slot lands on this effect's own default rather than on an error.
 */
function useSlotFollowsEffect(
  { id, effect, effectId, preset, setValue }: Slot,
  selected: StreakLook | null,
  readOnly: boolean | undefined,
) {
  const presetValue = preset.value
  const setPreset = preset.setValue
  useEffect(() => {
    if (readOnly) return
    if (selected && selected.id === id && selected[EFFECT_FIELD] !== effectId) setValue(null)
    else if (!id && !isLookId(effect, presetValue)) setPreset(effect.fallbackLook)
  }, [readOnly, selected, id, effectId, effect, presetValue, setPreset, setValue])
}

/** A new look made for the slot, which the slot holds and Studio opens at once. */
function useNewLook(slot: Slot, openDrawer: () => void, onCreated: () => void) {
  const { id } = slot
  const [busy, setBusy] = useState(false)
  const [opening, setOpening] = useState<number | null>(null)
  // A look made here opens in Studio as soon as the slot holds it.
  useEffect(() => {
    if (opening !== null && opening === id) {
      setOpening(null)
      openDrawer()
    }
  }, [opening, id, openDrawer])

  const create = async () => {
    setBusy(true)
    try {
      const created = await postLook(slot)
      studioStore.patch(sessionKey(created), { placement: slot.placement })
      slot.setValue(created)
      onCreated()
      setOpening(created)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return { busy, create }
}

/** The author's own looks for this effect, newest first, while the grid is choosing. */
function useLookSearch(choosing: boolean, search: string, effectId: EffectId) {
  const [looks, setLooks] = useState<StreakLook[]>([])
  useEffect(() => {
    if (!choosing) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        depth: '1',
        limit: '24',
        sort: '-updatedAt',
        'where[archived][not_equals]': 'true',
        [`where[${EFFECT_FIELD}][equals]`]: effectId,
      })
      if (search) params.set('where[title][like]', search)
      const response = await fetch(`/api/${LOOKS_SLUG}?${params}`, { signal: controller.signal })
      if (response.ok) setLooks((await response.json()).docs)
    }, 200)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [choosing, search, effectId])
  return looks
}

/** A new draft look for the slot; resolves to its id. */
async function postLook({ effect, effectId, preset, pageTitle, label, noun }: Slot) {
  // Start from the shipped look the slot shows now, so "make it mine" begins where the page is.
  const recipe = isLookId(effect, preset.value)
    ? starterRecipe(effect, preset.value)
    : emptyRecipe(effect)
  const response = await fetch(`/api/${LOOKS_SLUG}?draft=true&depth=0`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: [pageTitle, label].filter(Boolean).join(' · '),
      [EFFECT_FIELD]: effectId,
      recipe,
      _status: 'draft',
    }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.errors?.[0]?.message ?? `Could not create a ${noun}.`)
  return result.doc.id as number
}

/**
 * The visual slot's one picker, for whichever effect the slot chose. A look is
 * used like a media file: the slot holds it, the site shows what is published,
 * and editing happens in Studio, opened here in a drawer so the editor never
 * leaves the page. A shipped look and a look of your own are chosen from the
 * same grid; the grid writes the sibling `preset` field for the first and this
 * field for the second, and the slot never shows a version.
 */
export const FieldPicker: RelationshipFieldClientComponent = ({ path, readOnly }) => {
  const slot = useSlot(path)
  const { id } = slot
  const [choosing, setChoosing] = useState(false)
  const [search, setSearch] = useState('')
  const [DocumentDrawer, , { openDrawer, isDrawerOpen }] = useDocumentDrawer({
    collectionSlug: LOOKS_SLUG,
    id: id ?? undefined,
  })
  const selected = useSelectedLook(id, isDrawerOpen)
  useSlotFollowsEffect(slot, selected, readOnly)
  const { busy, create } = useNewLook(slot, openDrawer, () => setChoosing(false))
  const looks = useLookSearch(choosing, search, slot.effectId)

  return (
    <div data-streak-studio="picker" className="mb-6 flex flex-col gap-3">
      <span className="text-[13px]/5 text-foreground">{slot.effect.label}</span>

      {id && !choosing ? (
        <ChosenLook
          slot={slot}
          selected={selected}
          readOnly={readOnly}
          openDrawer={openDrawer}
          onChange={() => setChoosing(true)}
        />
      ) : (
        <>
          <LookGrid
            slot={slot}
            looks={looks}
            choosing={choosing}
            busy={busy}
            readOnly={readOnly}
            onCreate={create}
            onChosen={() => setChoosing(false)}
          />
          <BrowseOrSearch
            choosing={choosing}
            search={search}
            readOnly={readOnly}
            noun={slot.noun}
            onSearch={setSearch}
            onBrowse={() => setChoosing(true)}
          />
        </>
      )}

      {slot.error && (
        <p role="alert" className="text-xs/4 text-destructive">
          {slot.error}
        </p>
      )}
      <DocumentDrawer />
    </div>
  )
}

/** What the slot holds now, and the way into Studio to change it. */
function ChosenLook({
  slot: { id, noun, placement },
  selected,
  readOnly,
  openDrawer,
  onChange,
}: {
  slot: Slot
  selected: StreakLook | null
  readOnly: boolean | undefined
  openDrawer: () => void
  onChange: () => void
}) {
  const edit = () => {
    if (id) studioStore.patch(sessionKey(id), { placement })
    openDrawer()
  }
  const live = Boolean(selected?.snapshot)
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-input p-2">
      <span
        className="block aspect-video w-36 shrink-0 overflow-hidden rounded-sm"
        style={{ backgroundColor: STUDIO_GROUND.dark }}
      >
        {selected && posterOf(selected) && (
          // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
          <img src={posterOf(selected) ?? ''} alt="" className="size-full object-cover" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px]/5 font-medium">
          {selected?.title ?? `Look #${id}`}
        </span>
        <span className="text-xs/4 text-muted-foreground">
          {live
            ? 'The page shows what is published. Edit it in Studio and publish to change it here.'
            : 'Not published yet, so the page shows the shipped look. Open it in Studio and publish.'}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={edit}>
          Edit {noun}
        </Button>
        {!readOnly && (
          <Button type="button" variant="ghost" size="sm" onClick={onChange}>
            Change
          </Button>
        )}
      </div>
    </div>
  )
}

/** Shipped looks, the author's own while choosing, and a new one made for this slot. */
function LookGrid({
  slot: { id, effect, noun, label, preset, setValue },
  looks,
  choosing,
  busy,
  readOnly,
  onCreate,
  onChosen,
}: {
  slot: Slot
  looks: StreakLook[]
  choosing: boolean
  busy: boolean
  readOnly: boolean | undefined
  onCreate: () => void
  onChosen: () => void
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
      {lookOptions(effect).map((look) => (
        <Card
          key={look.value}
          src={lookPosterSrc(effect, look.value, 'dark')}
          title={look.label}
          caption="Shipped look"
          selected={!id && preset.value === look.value}
          disabled={readOnly}
          onClick={() => {
            preset.setValue(look.value)
            setValue(null)
            onChosen()
          }}
        />
      ))}
      {choosing &&
        looks.map((look) => (
          <Card
            key={look.id}
            src={posterOf(look)}
            title={look.title}
            caption={look.snapshot ? `Your ${noun}` : `Your ${noun}, not published`}
            selected={look.id === id}
            disabled={readOnly}
            onClick={() => {
              setValue(look.id)
              onChosen()
            }}
          />
        ))}
      {!readOnly && <NewLookCard noun={noun} label={label} busy={busy} onCreate={onCreate} />}
    </div>
  )
}

function NewLookCard({
  noun,
  label,
  busy,
  onCreate,
}: {
  noun: string
  label: string
  busy: boolean
  onCreate: () => void
}) {
  return (
    <Card
      title={busy ? 'Creating…' : `New ${noun}`}
      caption={`For this ${label.toLowerCase()}`}
      disabled={busy}
      onClick={onCreate}
    >
      <IconPlus aria-hidden className="size-5" />
    </Card>
  )
}

function BrowseOrSearch({
  choosing,
  search,
  readOnly,
  noun,
  onSearch,
  onBrowse,
}: {
  choosing: boolean
  search: string
  readOnly: boolean | undefined
  noun: string
  onSearch: (search: string) => void
  onBrowse: () => void
}) {
  if (choosing) {
    return (
      <Input
        aria-label="Search your looks"
        placeholder="Search your looks"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        className="h-8 max-w-xs text-xs"
      />
    )
  }
  if (readOnly) return null
  return (
    <button
      type="button"
      className="pressable w-fit cursor-pointer text-xs/4 text-muted-foreground underline hover:text-foreground"
      onClick={onBrowse}
    >
      Use a {noun} made in Studio
    </button>
  )
}
