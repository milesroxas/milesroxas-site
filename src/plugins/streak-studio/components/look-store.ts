'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { effectOf } from '@/features/immersive/studio/effects'
import { type LookGround, lookGround } from '@/features/immersive/studio/ground'
import {
  canonicalJSON,
  type Recipe,
  type Snapshot,
  snapshotRecipe,
} from '@/features/immersive/studio/recipe'
import { type PublishedStill, publishedStills } from '@/features/immersive/studio/stills'
import type { Media } from '@/payload-types'
import { LOOKS_SLUG, STILL_MEDIA_FIELD, STILLS_FIELD } from './paths'

/** One published state of a look, newest first in `history`. */
export type PublishedState = {
  /** The version's id, or `live` for the published document itself. */
  id: string
  at: string
  recipe: Recipe
  /** Canonical snapshot: equal keys draw equal pixels. */
  key: string
  /** The ground the state was published with; not part of the key. */
  ground: LookGround
  /** The stills the state was published with, each with its render. */
  stills: PublishedStill[]
  poster: string | null
  /** Each still's render, by media id: the file and its admin thumbnail. */
  renders: Map<number, Render>
}

export type Render = { url: string; thumbnail: string }

export type LookUse = {
  content: string
  title: string
  url: string
  draft: boolean
  historical: boolean
}

export type LookState = {
  loaded: boolean
  /** What the site shows now, or `null` for a field that was never published. */
  live: PublishedState | null
  history: PublishedState[]
  uses: LookUse[]
}

const EMPTY: LookState = { loaded: false, live: null, history: [], uses: [] }
const looks = new Map<string, LookState>()
const mounted = new Map<string, number>()
const listeners = new Set<() => void>()

const posterOf = (media: unknown) =>
  media && typeof media === 'object'
    ? ((media as Media).sizes?.thumbnail?.url ?? (media as Media).url ?? null)
    : null

/** A state's rendered stills, from the relationship the state populates. */
const rendersOf = (media: unknown) => {
  const renders = new Map<number, Render>()
  if (!Array.isArray(media)) return renders
  for (const row of media) {
    const doc = row && typeof row === 'object' ? (row as Media) : null
    const thumbnail = posterOf(doc)
    if (doc?.url && thumbnail) renders.set(doc.id, { url: doc.url, thumbnail })
  }
  return renders
}

/** A stored state as the Studio reads it; `null` when today's ranges no longer accept the recipe. */
function stateOf(
  id: string,
  at: string,
  doc: {
    effect?: unknown
    recipe?: unknown
    snapshot?: unknown
    thumbnail?: unknown
    ground?: unknown
    [STILLS_FIELD]?: unknown
    [STILL_MEDIA_FIELD]?: unknown
  },
): PublishedState | null {
  try {
    // The stored snapshot is what the site draws. Looks published under the
    // earlier release model carry none on their versions, so theirs resolves
    // from the recipe.
    const snapshot =
      (doc.snapshot as Snapshot | null) ?? snapshotRecipe(effectOf(doc.effect), doc.recipe)
    return {
      id,
      at,
      recipe: doc.recipe as Recipe,
      key: canonicalJSON(snapshot),
      ground: lookGround(doc.ground),
      stills: publishedStills(doc[STILLS_FIELD]),
      poster: posterOf(doc.thumbnail),
      renders: rendersOf(doc[STILL_MEDIA_FIELD]),
    }
  } catch {
    return null
  }
}

async function load(id: string) {
  const versions = new URLSearchParams({
    'where[parent][equals]': id,
    'where[version._status][equals]': 'published',
    sort: '-updatedAt',
    limit: '30',
    depth: '1',
  })
  const [live, history, usage] = await Promise.all([
    fetch(`/api/${LOOKS_SLUG}/${id}?draft=false&depth=1`).then((r) => (r.ok ? r.json() : null)),
    fetch(`/api/${LOOKS_SLUG}/versions?${versions}`).then((r) => (r.ok ? r.json() : null)),
    fetch(`/api/${LOOKS_SLUG}/${id}/usage`).then((r) => (r.ok ? r.json() : null)),
  ])
  const states: PublishedState[] = []
  for (const row of history?.docs ?? []) {
    const state = stateOf(String(row.id), row.updatedAt, row.version ?? {})
    // Revert to published writes the same state again; one row per state.
    if (state && states.at(-1)?.key !== state.key) states.push(state)
  }
  looks.set(id, {
    loaded: true,
    live: live?._status === 'published' ? stateOf('live', live.updatedAt, live) : null,
    history: states,
    uses: usage?.usages ?? [],
  })
  for (const listener of listeners) listener()
}

/**
 * Reload every look on the page now. The Studio's pieces sit in separate
 * branches of Payload's form, so the one that published says so here and the
 * rest catch up.
 */
export const refreshStudio = () => {
  for (const id of mounted.keys()) void load(id).catch(() => {})
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** What is published for a look, its published history and where it is used. One fetch per page, shared. */
export function useLook(id: number | string | undefined): LookState {
  const key = id == null ? '' : String(id)
  useEffect(() => {
    if (!key) return
    const count = mounted.get(key) ?? 0
    mounted.set(key, count + 1)
    if (!count) void load(key).catch(() => {})
    return () => {
      const left = (mounted.get(key) ?? 1) - 1
      if (left) mounted.set(key, left)
      else mounted.delete(key)
    }
  }, [key])
  return useSyncExternalStore(
    subscribe,
    () => looks.get(key) ?? EMPTY,
    () => EMPTY,
  )
}
