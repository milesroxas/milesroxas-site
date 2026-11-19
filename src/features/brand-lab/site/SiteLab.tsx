'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { KnobRow, LabViews } from '../BrandLab'
import { type BrandConfig, KNOB_GROUPS, MODE_LABELS } from '../config'
import { renderBrand } from '../render'
import {
  CASE_MODES,
  DEFAULT_SITE,
  momentsOn,
  normalizeSite,
  PAGE_LABELS,
  PAGE_SECTIONS,
  PAGES,
  type SectionKey,
  type SiteConfig,
} from './config'
import { renderSite } from './sections'

type Saved<T> = { file: string; config: T }

const API = '/lab/brand/configs'

function readHash(): SiteConfig | null {
  try {
    const raw = window.location.hash.slice(1)
    return raw ? normalizeSite(JSON.parse(decodeURIComponent(raw))) : null
  } catch {
    return null
  }
}

export function SiteLab() {
  const [site, setSite] = useState<SiteConfig>(DEFAULT_SITE)
  const [hydrated, setHydrated] = useState(false)
  const [sites, setSites] = useState<Saved<SiteConfig>[]>([])
  const [moments, setMoments] = useState<Saved<BrandConfig>[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const fromHash = readHash()
    if (fromHash) setSite(fromHash)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.history.replaceState(null, '', `#${encodeURIComponent(JSON.stringify(site))}`)
  }, [site, hydrated])

  const loadSaved = useCallback(async () => {
    const res = await fetch(API, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setSites(data.sites)
    setMoments(data.configs)
  }, [])

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const update = useCallback((patch: Partial<SiteConfig>) => {
    setSite((s) => normalizeSite({ ...s, ...patch }))
  }, [])

  const setBrand = useCallback(<K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => {
    setSite((s) => normalizeSite({ ...s, brand: { ...s.brand, [key]: value } }))
  }, [])

  const setVariant = (key: SectionKey, value: number) =>
    setSite((s) => normalizeSite({ ...s, variants: { ...s.variants, [key]: value } }))

  const reseed = useCallback(
    () =>
      setSite((s) => ({ ...s, brand: { ...s.brand, seed: Math.floor(Math.random() * 2 ** 32) } })),
    [],
  )

  const shuffle = () =>
    setSite((s) => {
      const variants = { ...s.variants }
      for (const def of PAGE_SECTIONS[s.page]) {
        variants[def.key] = Math.floor(Math.random() * def.variants.length)
      }
      return normalizeSite({ ...s, variants })
    })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        reseed()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reseed])

  const page = useMemo(() => renderSite(site), [site])
  const spent = momentsOn(site)

  const save = async () => {
    const json = JSON.stringify(site, null, 2)
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      // Clipboard needs focus; the file write is the real save.
    }
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: json,
    })
    if (res.ok) {
      setStatus(`saved ${(await res.json()).path} (and copied)`)
      void loadSaved()
    } else {
      setStatus(`save failed: ${res.status}`)
    }
  }

  return (
    <div className="lab">
      <section className="lab-stage">
        <div className="lab-under lab-under-top">
          <span>
            {PAGE_LABELS[site.page]} · seed <b>{site.brand.seed}</b> · poster mode{' '}
            {MODE_LABELS[site.brand.mode]} · space for a new seed
          </span>
          <span className={spent.length > 1 ? 'lab-warn' : ''}>
            {spent.length > 1
              ? `${spent.length} moments on this page (${spent.map((s) => s.label).join(', ')}): rule 1 allows one`
              : `moments: ${spent.length}/1`}
          </span>
        </div>
        <div className={`bs-viewport ${site.viewport}`}>{page}</div>
        <div className="lab-under">
          <span>{status}</span>
        </div>
        <div className="lab-rail">
          {sites.map((s) => (
            <button
              className="lab-thumb lab-thumb-text"
              key={s.file}
              onClick={() => setSite(s.config)}
              type="button"
            >
              <span>{s.file.replace(/\.json$/, '')}</span>
            </button>
          ))}
          {moments.map((m, i) => (
            <button
              className="lab-thumb"
              key={m.file}
              onClick={() => update({ brand: m.config })}
              title={`Use this poster's brand: ${m.file}`}
              type="button"
            >
              {renderBrand(m.config, { idPrefix: `sm${i}`, title: m.file })}
              <span>brand from {m.file.replace(/\.json$/, '')}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="lab-panel">
        <LabViews current="site" />
        <div className="lab-tabs" role="tablist">
          {PAGES.map((p) => (
            <button
              aria-selected={site.page === p}
              key={p}
              onClick={() => update({ page: p })}
              role="tab"
              type="button"
            >
              {PAGE_LABELS[p]}
            </button>
          ))}
        </div>

        <fieldset>
          <legend>sections</legend>
          {PAGE_SECTIONS[site.page].map((def) => (
            <div className="lab-row" key={def.key}>
              <label htmlFor={`v-${def.key}`}>{def.label}</label>
              <select
                id={`v-${def.key}`}
                onChange={(e) => setVariant(def.key, Number(e.target.value))}
                value={site.variants[def.key]}
              >
                {def.variants.map((v, i) => (
                  <option key={v.label} value={i}>
                    {v.label}
                    {v.moment ? ' ◆' : ''}
                  </option>
                ))}
              </select>
              <span />
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>page</legend>
          <div className="lab-row">
            <label htmlFor="v-viewport">viewport</label>
            <select
              id="v-viewport"
              onChange={(e) =>
                update({ viewport: e.target.value === 'mobile' ? 'mobile' : 'desktop' })
              }
              value={site.viewport}
            >
              <option value="desktop">desktop</option>
              <option value="mobile">phone 390</option>
            </select>
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="v-case">lowercase</label>
            <select
              id="v-case"
              onChange={(e) => update({ caseMode: e.target.value as SiteConfig['caseMode'] })}
              value={site.caseMode}
            >
              {CASE_MODES.map((m) => (
                <option key={m} value={m}>
                  {m === 'nav' ? 'nav + labels' : 'nothing'}
                </option>
              ))}
            </select>
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="v-lead">lead ×body</label>
            <input
              id="v-lead"
              max={3}
              min={1}
              onChange={(e) => update({ lead: Number(e.target.value) })}
              step={0.05}
              type="range"
              value={site.lead}
            />
            <output>{site.lead.toFixed(2)}</output>
          </div>
        </fieldset>

        {KNOB_GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend>brand · {group.title}</legend>
            {group.knobs.map((knob) => (
              <KnobRow config={site.brand} key={knob.key} knob={knob} set={setBrand} />
            ))}
          </fieldset>
        ))}

        <div className="lab-actions">
          <button className="lab-primary" onClick={save} type="button">
            save
          </button>
          <button onClick={shuffle} type="button">
            shuffle sections
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(site, null, 2))}
            type="button"
          >
            copy json
          </button>
          <button
            onClick={() => setSite({ ...DEFAULT_SITE, page: site.page, brand: site.brand })}
            type="button"
          >
            reset sections
          </button>
        </div>
      </aside>
    </div>
  )
}
