'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createShaderField, type FieldHandle, type FieldPointer } from '@/features/aim-field/field'
import { LabViews } from '../BrandLab'
import { PAPERS } from '../config'
import {
  DEFAULT_SHADER,
  normalizeShader,
  SHADER_COLORS,
  SHADER_KNOBS,
  type ShaderConfig,
  type ShaderKnob,
} from './config'

type Saved = { file: string; config: ShaderConfig }

const API = '/lab/brand/configs'
const newSeed = () => Math.floor(Math.random() * 2 ** 32)
const pad = (n: number) => String(Math.max(0, n)).padStart(4, '0')

function readHash(): ShaderConfig | null {
  try {
    const raw = window.location.hash.slice(1)
    return raw ? normalizeShader(JSON.parse(decodeURIComponent(raw))) : null
  } catch {
    return null
  }
}

export function ShaderLab() {
  const [config, setConfig] = useState<ShaderConfig>(DEFAULT_SHADER)
  const [saved, setSaved] = useState<Saved[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [panel, setPanel] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<FieldHandle | null>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const aimRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLSpanElement>(null)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    const fromHash = readHash()
    if (fromHash) setConfig(fromHash)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.history.replaceState(null, '', `#${encodeURIComponent(JSON.stringify(config))}`)
  }, [config, hydrated])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onPointer = (p: FieldPointer) => {
      if (readoutRef.current) readoutRef.current.textContent = `${pad(p.cellX)} ${pad(p.cellY)}`
      if (targetRef.current) {
        targetRef.current.textContent =
          p.target === 'free' ? 'aim / free' : `aim / lock / ${p.target}`
      }
    }
    try {
      fieldRef.current = createShaderField(canvas, configRef.current, {
        reticle: aimRef.current,
        onPointer,
      })
      if (!fieldRef.current) setError('webgl2 unavailable')
    } catch (e) {
      setError(String(e))
    }
    return () => {
      fieldRef.current?.destroy()
      fieldRef.current = null
    }
  }, [])

  useEffect(() => {
    fieldRef.current?.update(config)
  }, [config])

  const loadSaved = useCallback(async () => {
    const res = await fetch(API, { cache: 'no-store' })
    if (res.ok) setSaved((await res.json()).shaders ?? [])
  }, [])

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const set = useCallback((key: keyof ShaderConfig, value: unknown) => {
    setConfig((c) => normalizeShader({ ...c, [key]: value }))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        setConfig((c) => ({ ...c, seed: newSeed() }))
      }
      if (e.key === 'h') setPanel((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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

  const paper = (PAPERS[config.paper] ?? PAPERS[0]).hex
  const ground = config.ground === 'ink' ? SHADER_COLORS.ink : paper

  return (
    <div className={panel ? 'lab' : 'lab shader-full'}>
      <section
        className={config.hideCursor ? 'shader-stage no-cursor' : 'shader-stage'}
        style={{ background: ground }}
      >
        <canvas className="shader-canvas" ref={canvasRef} />
        {config.overlay ? (
          <div className="shader-page" data-ground={config.ground}>
            <header className="shader-top">
              <span>miles roxas</span>
              <span className="shader-meta">MR–16</span>
            </header>
            <div className="shader-main">
              <div className="shader-body">
                <h1>designed and built</h1>
                <p>
                  Sixteen years of design and engineering for brands, products and the systems
                  between them. The field behind this text is the page background: aim at it, move,
                  click.
                </p>
                <a className="shader-cta" href="#case">
                  Read the case study
                </a>
              </div>
              <figure className="shader-figure">
                <img
                  alt="Placeholder work"
                  height={600}
                  src="/textures/fpo-vault.jpg"
                  width={800}
                />
                <figcaption className="shader-meta">MR–16–W01</figcaption>
              </figure>
            </div>
            <footer className="shader-bottom">
              <span className="shader-meta">
                BG–01 / shader field / seed {config.seed} / <span ref={targetRef}>aim / free</span>
              </span>
              {config.yellow === 'readout' ? (
                <span className="shader-readout" ref={readoutRef}>
                  0000 0000
                </span>
              ) : null}
            </footer>
          </div>
        ) : null}
        <div className="shader-aim" ref={aimRef} />
        {error ? <p className="shader-error">{error}</p> : null}
      </section>

      {panel ? (
        <aside className="lab-panel">
          <LabViews current="shader" />
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

          {SHADER_KNOBS.map((group) => (
            <fieldset key={group.title}>
              <legend>{group.title}</legend>
              {group.knobs.map((knob) => (
                <Row config={config} key={knob.key} knob={knob} set={set} />
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
            <button
              onClick={() => setConfig({ ...DEFAULT_SHADER, seed: config.seed })}
              type="button"
            >
              reset knobs
            </button>
            <button onClick={() => setPanel(false)} type="button">
              hide panel (h)
            </button>
          </div>
          <p className="shader-status">{status || 'space: new seed · h: toggle panel'}</p>

          <fieldset>
            <legend>saved</legend>
            {saved.length === 0 ? <span className="lab-empty">no saved shaders yet</span> : null}
            {saved.map((s) => (
              <button
                className="shader-saved"
                key={s.file}
                onClick={() => setConfig(s.config)}
                type="button"
              >
                {s.file.replace(/\.json$/, '')}
              </button>
            ))}
          </fieldset>
        </aside>
      ) : null}
    </div>
  )
}

function Row({
  knob,
  config,
  set,
}: {
  knob: ShaderKnob
  config: ShaderConfig
  set: (key: keyof ShaderConfig, value: unknown) => void
}) {
  const id = `knob-${knob.key}`
  const value = config[knob.key]
  return (
    <div className="lab-row">
      <label htmlFor={id}>{knob.label}</label>
      {knob.kind === 'range' ? (
        <>
          <input
            id={id}
            max={knob.max}
            min={knob.min}
            onChange={(e) => set(knob.key, Number(e.target.value))}
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
              if (option) set(knob.key, option.value)
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
            onChange={(e) => set(knob.key, e.target.checked)}
            type="checkbox"
          />
          <span />
        </>
      ) : null}
    </div>
  )
}
