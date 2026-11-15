'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { KnobRow, LabViews } from '../BrandLab'
import { type BrandConfig, KNOB_GROUPS } from '../config'
import { POSTS, WORKS } from '../content'
import { downloadPng, downloadSvg } from '../export'
import { renderBrand } from '../render'
import {
  DEFAULT_SOCIAL,
  FORMAT_IDS,
  FORMATS,
  type Format,
  normalizeSocial,
  type SocialConfig,
  TEMPLATE_IDS,
  TEMPLATES,
} from './config'
import { renderSocial } from './render'

type Saved<T> = { file: string; config: T }

const API = '/lab/brand/configs'

function readHash(): SocialConfig | null {
  try {
    const raw = window.location.hash.slice(1)
    return raw ? normalizeSocial(JSON.parse(decodeURIComponent(raw))) : null
  } catch {
    return null
  }
}

export function SocialLab() {
  const [cfg, setCfg] = useState<SocialConfig>(DEFAULT_SOCIAL)
  const [hydrated, setHydrated] = useState(false)
  const [socials, setSocials] = useState<Saved<SocialConfig>[]>([])
  const [moments, setMoments] = useState<Saved<BrandConfig>[]>([])
  const [status, setStatus] = useState('')
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fromHash = readHash()
    if (fromHash) setCfg(fromHash)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.history.replaceState(null, '', `#${encodeURIComponent(JSON.stringify(cfg))}`)
  }, [cfg, hydrated])

  const loadSaved = useCallback(async () => {
    const res = await fetch(API, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setSocials(data.socials ?? [])
    setMoments(data.configs ?? [])
  }, [])

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const update = useCallback((patch: Partial<SocialConfig>) => {
    setCfg((c) => normalizeSocial({ ...c, ...patch }))
  }, [])

  const setBrand = useCallback(<K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => {
    setCfg((c) => normalizeSocial({ ...c, brand: { ...c.brand, [key]: value } }))
  }, [])

  const reseed = useCallback(
    () =>
      setCfg((c) => ({ ...c, brand: { ...c.brand, seed: Math.floor(Math.random() * 2 ** 32) } })),
    [],
  )

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

  const art = useMemo(
    () =>
      (cfg.showAll ? FORMAT_IDS : [cfg.format]).map((format) => ({
        format,
        node: renderSocial({ ...cfg, format }, { idPrefix: `s-${format}` }),
      })),
    [cfg],
  )

  const exportAll = async (kind: 'png' | 'svg') => {
    const nodes = stageRef.current?.querySelectorAll<SVGSVGElement>('[data-format] > svg') ?? []
    setStatus('exporting…')
    try {
      for (const svg of Array.from(nodes)) {
        const format = svg.parentElement?.dataset.format ?? cfg.format
        const name = `mr-${cfg.template}-${format}-${cfg.brand.seed}.${kind}`
        if (kind === 'png') await downloadPng(svg, name)
        else await downloadSvg(svg, name)
      }
      setStatus(`exported ${nodes.length} ${kind}`)
    } catch (error) {
      setStatus(`export failed: ${String(error)}`)
    }
  }

  const save = async () => {
    const json = JSON.stringify(cfg, null, 2)
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
            {TEMPLATES[cfg.template]} · seed <b>{cfg.brand.seed}</b> · click or space for a new seed
          </span>
          <span>{status}</span>
        </div>
        <div className={`social-stage ${cfg.showAll ? 'all' : ''}`} ref={stageRef}>
          {art.map(({ format, node }) => (
            <figure key={format}>
              <button
                aria-label="New variation"
                className="social-art"
                data-format={format}
                onClick={reseed}
                type="button"
              >
                {node}
              </button>
              <figcaption>
                {FORMATS[format].label} · {FORMATS[format].w}×{FORMATS[format].h}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="lab-rail">
          {socials.map((s, i) => (
            <button
              className="lab-thumb"
              key={s.file}
              onClick={() => setCfg(s.config)}
              title={s.file}
              type="button"
            >
              {renderSocial(s.config, { idPrefix: `ss${i}` })}
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
              {renderBrand(m.config, { idPrefix: `sb${i}`, title: m.file })}
              <span>brand from {m.file.replace(/\.json$/, '')}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="lab-panel">
        <LabViews current="social" />
        <div className="lab-tabs" role="tablist">
          {TEMPLATE_IDS.map((t) => (
            <button
              aria-selected={cfg.template === t}
              key={t}
              onClick={() => update({ template: t })}
              role="tab"
              type="button"
            >
              {TEMPLATES[t]}
            </button>
          ))}
        </div>

        <fieldset>
          <legend>format & content</legend>
          <div className="lab-row">
            <label htmlFor="s-format">format</label>
            <select
              id="s-format"
              onChange={(e) => update({ format: e.target.value as Format })}
              value={cfg.format}
            >
              {FORMAT_IDS.map((f) => (
                <option key={f} value={f}>
                  {FORMATS[f].label}
                </option>
              ))}
            </select>
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="s-all">all sizes</label>
            <input
              checked={cfg.showAll}
              id="s-all"
              onChange={(e) => update({ showAll: e.target.checked })}
              type="checkbox"
            />
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="s-work">work</label>
            <select
              id="s-work"
              onChange={(e) => update({ workId: Number(e.target.value) })}
              value={cfg.workId}
            >
              {WORKS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.client}
                  {w.image ? '' : ' (no image)'}
                </option>
              ))}
            </select>
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="s-post">post</label>
            <select
              id="s-post"
              onChange={(e) => update({ postIndex: Number(e.target.value) })}
              value={cfg.postIndex}
            >
              {POSTS.map((p, i) => (
                <option key={p.title} value={i}>
                  {p.title}
                </option>
              ))}
            </select>
            <span />
          </div>
          <div className="lab-row">
            <label htmlFor="s-headline">headline</label>
            <input
              id="s-headline"
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="empty: from the content"
              type="text"
              value={cfg.headline}
            />
            <span />
          </div>
        </fieldset>

        {KNOB_GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend>brand · {group.title}</legend>
            {group.knobs.map((knob) => (
              <KnobRow config={cfg.brand} key={knob.key} knob={knob} set={setBrand} />
            ))}
          </fieldset>
        ))}

        <div className="lab-actions">
          <button className="lab-primary" onClick={save} type="button">
            save
          </button>
          <button onClick={() => exportAll('png')} type="button">
            export png
          </button>
          <button onClick={() => exportAll('svg')} type="button">
            export svg
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(cfg, null, 2))}
            type="button"
          >
            copy json
          </button>
        </div>
      </aside>
    </div>
  )
}
