'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  type BrandConfig,
  DEFAULT_CONFIG,
  KNOB_GROUPS,
  type Knob,
  MODE_LABELS,
  MODES,
  normalizeConfig,
} from './config'
import { downloadPng, downloadSvg } from './export'
import { renderBrand } from './render'

type Saved = { file: string; config: BrandConfig }

const API = '/lab/brand/configs'
const newSeed = () => Math.floor(Math.random() * 2 ** 32)

function readHash(): BrandConfig | null {
  try {
    const raw = window.location.hash.slice(1)
    return raw ? normalizeConfig(JSON.parse(decodeURIComponent(raw))) : null
  } catch {
    return null
  }
}

export function LabViews({ current }: { current: 'moments' | 'site' | 'social' | 'shader' }) {
  return (
    <nav className="lab-views" aria-label="Lab views">
      <a aria-current={current === 'moments' ? 'page' : undefined} href="/lab/brand">
        moments
      </a>
      <a aria-current={current === 'site' ? 'page' : undefined} href="/lab/brand/site">
        site
      </a>
      <a aria-current={current === 'social' ? 'page' : undefined} href="/lab/brand/social">
        social
      </a>
      <a aria-current={current === 'shader' ? 'page' : undefined} href="/lab/brand/shader">
        shader
      </a>
    </nav>
  )
}

export function BrandLab() {
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState<Saved[]>([])
  const [status, setStatus] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const canvasRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const fromHash = readHash()
    if (fromHash) setConfig(fromHash)
    setHydrated(true)
  }, [])

  // The URL hash carries the live config, so any view can be reloaded or shared.
  useEffect(() => {
    if (!hydrated) return
    window.history.replaceState(null, '', `#${encodeURIComponent(JSON.stringify(config))}`)
  }, [config, hydrated])

  const loadSaved = useCallback(async () => {
    const res = await fetch(API, { cache: 'no-store' })
    if (res.ok) setSaved((await res.json()).configs)
  }, [])

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const set = useCallback(<K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => {
    setConfig((c) => normalizeConfig({ ...c, [key]: value }))
  }, [])

  const reroll = useCallback(() => setConfig((c) => ({ ...c, seed: newSeed() })), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        reroll()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reroll])

  const art = useMemo(() => renderBrand(config), [config])

  const save = async () => {
    const json = JSON.stringify(config, null, 2)
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      // Clipboard needs focus; the file write below is the real save.
    }
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: json,
    })
    if (res.ok) {
      const { path } = await res.json()
      setStatus(`saved ${path} (and copied)`)
      void loadSaved()
    } else {
      setStatus(`save failed: ${res.status}`)
    }
  }

  const exportArt = async (kind: 'png' | 'svg') => {
    const svg = canvasRef.current?.querySelector('svg')
    if (!svg) return
    const name = `brand-${config.mode}-${config.seed}.${kind}`
    if (kind === 'png') await downloadPng(svg, name)
    else await downloadSvg(svg, name)
  }

  return (
    <div className="lab">
      <section className="lab-stage">
        <button
          aria-label="New variation"
          className="lab-canvas"
          onClick={reroll}
          ref={canvasRef}
          type="button"
        >
          {art}
        </button>
        <div className="lab-under">
          <span>
            seed <b>{config.seed}</b> · {MODE_LABELS[config.mode]} · click canvas or press space for
            a new one
          </span>
          <span>{status}</span>
        </div>
        <div className="lab-rail">
          {saved.length === 0 ? <span className="lab-empty">no saved configs yet</span> : null}
          {saved.map((s, i) => (
            <button
              className="lab-thumb"
              key={s.file}
              onClick={() => setConfig(s.config)}
              title={s.file}
              type="button"
            >
              {renderBrand(s.config, { idPrefix: `t${i}`, title: s.file })}
              <span>{s.file.replace(/\.json$/, '')}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="lab-panel">
        <LabViews current="moments" />
        <div className="lab-tabs" role="tablist">
          {MODES.map((mode) => (
            <button
              aria-selected={config.mode === mode}
              key={mode}
              onClick={() => set('mode', mode)}
              role="tab"
              type="button"
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        <div className="lab-row">
          <label htmlFor="knob-seed">seed</label>
          <input
            id="knob-seed"
            onChange={(e) => set('seed', Number(e.target.value))}
            type="number"
            value={config.seed}
          />
          <span />
        </div>

        {KNOB_GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            {group.knobs.map((knob) => (
              <KnobRow config={config} key={knob.key} knob={knob} set={set} />
            ))}
          </fieldset>
        ))}

        <div className="lab-actions">
          <button className="lab-primary" onClick={save} type="button">
            save
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
            type="button"
          >
            copy json
          </button>
          <button onClick={() => exportArt('svg')} type="button">
            export svg
          </button>
          <button onClick={() => exportArt('png')} type="button">
            export png
          </button>
          <button onClick={() => setConfig({ ...DEFAULT_CONFIG, seed: config.seed })} type="button">
            reset knobs
          </button>
        </div>
      </aside>
    </div>
  )
}

export type SetKnob = <K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) => void

export function KnobRow({ knob, config, set }: { knob: Knob; config: BrandConfig; set: SetKnob }) {
  const id = `knob-${knob.key}`
  const value = config[knob.key]
  const write = set as (key: keyof BrandConfig, value: unknown) => void
  return (
    <div className="lab-row">
      <label htmlFor={id}>{knob.label}</label>
      {knob.kind === 'range' ? (
        <>
          <input
            id={id}
            max={knob.max}
            min={knob.min}
            onChange={(e) => write(knob.key, Number(e.target.value))}
            step={knob.step}
            type="range"
            value={Number(value)}
          />
          <output>{Number(value).toFixed(knob.step < 0.01 ? 3 : knob.step < 1 ? 2 : 0)}</output>
        </>
      ) : null}
      {knob.kind === 'select' ? (
        <>
          <select
            id={id}
            onChange={(e) => {
              const option = knob.options.find((o) => String(o.value) === e.target.value)
              if (option) write(knob.key, option.value)
            }}
            value={String(value)}
          >
            {knob.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
          <span />
        </>
      ) : null}
      {knob.kind === 'toggle' ? (
        <>
          <input
            checked={Boolean(value)}
            id={id}
            onChange={(e) => write(knob.key, e.target.checked)}
            type="checkbox"
          />
          <span />
        </>
      ) : null}
      {knob.kind === 'text' ? (
        <>
          <input
            id={id}
            onChange={(e) => write(knob.key, e.target.value)}
            placeholder={knob.placeholder}
            type="text"
            value={String(value)}
          />
          <span />
        </>
      ) : null}
    </div>
  )
}
