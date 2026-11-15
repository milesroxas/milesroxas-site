import type { ReactElement, ReactNode } from 'react'

import {
  ASPECTS,
  type BrandConfig,
  FAMILIES,
  FLUOROS,
  INK,
  MODES,
  MONO,
  type Mode,
  PAPERS,
  PIXEL,
  SLOGANS,
  SPOTS,
} from './config'
import { createRng, type Rng } from './random'

export const RENDER_WIDTH = 1600

type Rect = { x: number; y: number; w: number; h: number }
type Kind = 'caps' | 'lower' | 'mono'

export type Palette = {
  bg: string
  fg: string
  muted: string
  mark: string
  onMark: string
  barFill: string
  onBar: string
  fluoro: string
}

type Ctx = {
  cfg: BrandConfig
  rng: Rng
  W: number
  H: number
  m: number
  gut: number
  cols: number
  colW: number
  meta: number
  body: number
  colX: (i: number) => number
  span: (n: number) => number
  A: Rect
  pal: Palette
  sans: string
  momentWeight: number
  id: string
  /** The single fluoro element per view; falls back to the given colour when fluoro is off. */
  fl: (fallback: string) => string
}

const CAP = 0.72
const r1 = (v: number) => Math.round(v * 10) / 10

const MODE_CODES: Record<Mode, string> = {
  frame: 'FRM',
  'name-code': 'COD',
  slogan: 'SLG',
  roundel: 'RND',
  plate: 'PLT',
  receipt: 'RCT',
  'control-map': 'CTL',
}

const SPEC = [
  ['role', 'designer & builder'],
  ['disciplines', 'brand / product / technology'],
  ['base', 'brooklyn, ny'],
  ['practice', '16 yrs'],
] as const

const RECEIPT_ITEMS = [
  ['role', 'designer & builder'],
  ['disciplines', '3'],
  ['years in practice', '16'],
  ['base', 'brooklyn ny'],
  ['method', 'problem > insight > build'],
  ['em dashes', '0'],
  ['hype', '0'],
] as const

const CONTROL_LABELS = [
  'brand',
  'product',
  'technology',
  'research',
  'systems',
  'interaction',
  'type',
  'motion',
  'code',
  'test',
] as const

// Colour ------------------------------------------------------------------

const hexToRgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A.map((v, i) => v + ((B[i] as number) - v) * t))
}
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}
const readableOn = (bg: string, light: string) =>
  contrast(bg, light) >= contrast(bg, INK) ? light : INK

export function palette(cfg: BrandConfig): Palette {
  const paper = PAPERS[cfg.paper]?.hex ?? '#f5f5f5'
  const spot = SPOTS[cfg.spot]?.hex ?? '#f05a24'
  const fluoro = FLUOROS[cfg.fluoro]?.hex ?? '#ff3eb5'
  if (cfg.ground === 'spot') {
    const fg = readableOn(spot, paper)
    return {
      bg: spot,
      fg,
      muted: mix(fg, spot, 0.4),
      mark: fg,
      onMark: spot,
      barFill: fg,
      onBar: spot,
      fluoro,
    }
  }
  const bg = cfg.ground === 'ink' ? INK : paper
  const fg = cfg.ground === 'ink' ? paper : INK
  return {
    bg,
    fg,
    muted: mix(fg, bg, 0.48),
    mark: spot,
    onMark: readableOn(spot, paper),
    barFill: spot,
    onBar: readableOn(spot, paper),
    fluoro,
  }
}

// Type --------------------------------------------------------------------

const perEm = (kind: Kind, weight: number, tracking: number) =>
  (kind === 'mono'
    ? 0.6
    : kind === 'caps'
      ? 0.6 + (Math.max(0, weight - 400) / 500) * 0.12
      : 0.5 + (Math.max(0, weight - 300) / 600) * 0.08) + tracking

const measure = (text: string, size: number, kind: Kind, weight = 400, tracking = 0) =>
  text.length * size * perEm(kind, weight, tracking)

const fitSize = (
  text: string,
  width: number,
  kind: Kind,
  weight: number,
  tracking: number,
  max: number,
) => Math.min(max, width / Math.max(1, text.length * perEm(kind, weight, tracking)))

type TextOpts = {
  key: string
  x: number
  y: number
  size: number
  text: string
  family: string
  fill: string
  weight?: number
  tracking?: number
  anchor?: 'start' | 'middle' | 'end'
  opacity?: number
  transform?: string
}

function txt(o: TextOpts): ReactNode {
  return (
    <text
      fill={o.fill}
      fontFamily={o.family}
      fontSize={r1(o.size)}
      fontWeight={o.weight ?? 400}
      key={o.key}
      letterSpacing={o.tracking ? `${o.tracking}em` : undefined}
      opacity={o.opacity}
      textAnchor={o.anchor}
      transform={o.transform}
      x={r1(o.x)}
      y={r1(o.y)}
    >
      {o.text}
    </text>
  )
}

const meta = (
  ctx: Ctx,
  key: string,
  x: number,
  y: number,
  text: string,
  fill?: string,
  anchor?: TextOpts['anchor'],
) =>
  txt({
    key,
    x,
    y,
    size: ctx.meta,
    text: text.toUpperCase(),
    family: MONO,
    fill: fill ?? ctx.pal.muted,
    tracking: 0.04,
    anchor,
  })

const line = (
  key: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  width = 1,
  opacity?: number,
) => (
  <line
    key={key}
    opacity={opacity}
    stroke={stroke}
    strokeWidth={width}
    x1={r1(x1)}
    x2={r1(x2)}
    y1={r1(y1)}
    y2={r1(y2)}
  />
)

const box = (
  key: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke?: string,
  sw = 1.5,
) => (
  <rect
    fill={fill}
    height={r1(h)}
    key={key}
    stroke={stroke}
    strokeWidth={stroke ? sw : undefined}
    width={r1(w)}
    x={r1(x)}
    y={r1(y)}
  />
)

// Devices -----------------------------------------------------------------

function barcode(
  ctx: Ctx,
  key: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): ReactNode {
  const unit = w / 90
  const bars: ReactNode[] = []
  let cx = x
  let i = 0
  while (cx < x + w) {
    const bw = ctx.rng.pick([1, 1, 2, 2, 3, 4] as const) * unit
    if (cx + bw > x + w) break
    bars.push(box(`${key}-${i++}`, cx, y, bw, h, fill))
    cx += bw + ctx.rng.pick([1, 1, 2, 3] as const) * unit
  }
  return <g key={key}>{bars}</g>
}

function regmark(key: string, cx: number, cy: number, r: number, stroke: string): ReactNode {
  return (
    <g key={key}>
      <circle cx={r1(cx)} cy={r1(cy)} fill="none" r={r1(r)} stroke={stroke} strokeWidth={1} />
      {line(`${key}-h`, cx - r * 1.5, cy, cx + r * 1.5, cy, stroke)}
      {line(`${key}-v`, cx, cy - r * 1.5, cx, cy + r * 1.5, stroke)}
    </g>
  )
}

const serial = (seed: number) => `NO. ${String(seed % 10000).padStart(4, '0')}`
const digits = (code: string) => code.replace(/\D/g, '') || '00'

// Frame (the TE half: always present) --------------------------------------

function frameUnder(ctx: Ctx): ReactNode[] {
  const { cfg, cols, colX, colW, H, m, pal } = ctx
  if (cfg.gridOpacity <= 0) return []
  const lines: ReactNode[] = []
  for (let i = 0; i < cols; i++) {
    const x = colX(i)
    lines.push(line(`g${i}a`, x, m * 0.5, x, H - m * 0.5, pal.fg, 1, cfg.gridOpacity))
    lines.push(line(`g${i}b`, x + colW, m * 0.5, x + colW, H - m * 0.5, pal.fg, 1, cfg.gridOpacity))
  }
  return lines
}

function frameOver(ctx: Ctx, moment: Rect | null): ReactNode[] {
  const { cfg, rng, W, H, m, body, cols, colX, colW, gut, pal, sans } = ctx
  const out: ReactNode[] = []
  const yName = m + body * 0.8
  const name = cfg.name.toLowerCase()
  const nameW = measure(name, body, 'lower', cfg.frameWeight, -0.01)

  out.push(
    txt({
      key: 'name',
      x: m,
      y: yName,
      size: body,
      text: name,
      family: sans,
      fill: pal.fg,
      weight: cfg.frameWeight,
      tracking: -0.01,
    }),
  )
  out.push(meta(ctx, 'code', W - m, yName, cfg.code, pal.fg, 'end'))
  out.push(line('top-rule', m, m + body * 1.5, W - m, m + body * 1.5, pal.fg))

  // Corporate apparatus lives in the top band only, max 3 (rule 8).
  const kinds = rng
    .shuffle(['trademark', 'barcode', 'serial', 'regmark', 'part'] as const)
    .slice(0, cfg.devices)
  if (kinds.includes('trademark')) {
    out.push(
      txt({
        key: 'tm',
        x: m + nameW + 2,
        y: yName - body * 0.42,
        size: ctx.meta,
        text: '™',
        family: MONO,
        fill: pal.fg,
      }),
    )
  }
  const slotted = kinds.filter((k) => k !== 'trademark')
  const startCol = Math.ceil((nameW + gut * 3) / (colW + gut))
  const endCol = cols - 2
  slotted.forEach((kind, i) => {
    if (startCol > endCol) return
    const col = Math.min(
      endCol,
      startCol + Math.round((i * (endCol - startCol)) / Math.max(1, slotted.length)),
    )
    const x = colX(col)
    if (kind === 'barcode')
      out.push(
        barcode(
          ctx,
          'bc',
          x,
          yName - body * 0.78,
          Math.min(colW * 1.1, W * 0.07),
          body * 0.95,
          pal.fg,
        ),
      )
    if (kind === 'serial') out.push(meta(ctx, 'ser', x, yName, serial(cfg.seed)))
    if (kind === 'regmark')
      out.push(regmark('reg', x + body * 0.5, yName - body * 0.32, body * 0.32, pal.fg))
    if (kind === 'part')
      out.push(meta(ctx, 'part', x, yName, `part ${cfg.code}–${MODE_CODES[cfg.mode]}`))
  })

  // Spec blocks: label over value, numbered (TE).
  const valueY = H - m
  const labelY = valueY - body * 1.4
  const bottomTop = labelY - ctx.meta * 2.4
  out.push(line('bottom-rule', m, bottomTop, W - m, bottomTop, pal.fg))
  // Four blocks only when every value fits its share of the width.
  const fitsFour =
    cols >= 8 &&
    SPEC.every(
      ([, v]) => measure(v, body, 'lower', cfg.frameWeight, -0.01) < ctx.span(Math.floor(cols / 4)),
    )
  const blocks = fitsFour ? 4 : 2
  const step = Math.floor(cols / blocks)
  SPEC.slice(0, blocks).forEach(([label, value], i) => {
    const x = colX(i * step)
    out.push(meta(ctx, `sl${i}`, x, labelY, `${String(i + 1).padStart(2, '0')} ${label}`))
    out.push(
      txt({
        key: `sv${i}`,
        x,
        y: valueY,
        size: body,
        text: value,
        family: sans,
        fill: pal.fg,
        weight: cfg.frameWeight,
        tracking: -0.01,
      }),
    )
  })

  // Rule 7: at most one full-bleed bar, kept clear of the moment when there is room.
  if (cfg.bar) {
    const barH = ctx.meta * 3
    const { A } = ctx
    let y = A.y + A.h * rng.range(0.2, 0.8)
    if (moment) {
      const above = moment.y - A.y
      const below = A.y + A.h - (moment.y + moment.h)
      const zone = above >= below ? { y: A.y, h: above } : { y: moment.y + moment.h, h: below }
      y =
        zone.h >= barH + gut * 4
          ? zone.y + gut * 2 + (zone.h - barH - gut * 4) * rng.next()
          : moment.y + moment.h - barH * 0.5
    }
    const phrase = `designed and built by ${cfg.name} · brooklyn ny · ${cfg.code} · `.toUpperCase()
    const repeat = Math.ceil(W / measure(phrase, ctx.meta, 'mono', 400, 0.04)) + 1
    out.push(
      <g key="bar">
        {box('bar-fill', 0, y, W, barH, pal.barFill)}
        {meta(
          ctx,
          'bar-text',
          m * 0.5,
          y + barH / 2 + ctx.meta * 0.36,
          phrase.repeat(repeat),
          pal.onBar,
        )}
      </g>,
    )
  }

  if (cfg.rotate) {
    // One whole element turned 90° (rule 7).
    const x = W - m / 2 + ctx.meta * 0.36
    out.push(
      txt({
        key: 'rot',
        x: 0,
        y: 0,
        size: ctx.meta,
        text: `${cfg.code} / designer & builder / brand · product · technology`.toUpperCase(),
        family: MONO,
        fill: pal.muted,
        tracking: 0.04,
        transform: `translate(${r1(x)} ${r1(bottomTop)}) rotate(-90)`,
      }),
    )
  }
  return out
}

// Texture: dense detail confined to the moment (rule 9) -------------------

function texture(
  ctx: Ctx,
  R: Rect,
  kinds: readonly ('graph' | 'speed' | 'ticks' | 'hatch')[],
): ReactNode {
  const { cfg, rng, pal, meta: mt } = ctx
  const kind = rng.pick(kinds)
  if (cfg.density < 0.05) return null
  const d = cfg.density
  const out: ReactNode[] = []
  if (kind === 'graph') {
    const step = mt * (2.4 - d * 1.2)
    for (let x = R.x; x <= R.x + R.w + 0.1; x += step)
      out.push(line(`tx${x}`, x, R.y, x, R.y + R.h, pal.fg, 1, 0.1))
    for (let y = R.y; y <= R.y + R.h + 0.1; y += step)
      out.push(line(`ty${y}`, R.x, y, R.x + R.w, y, pal.fg, 1, 0.1))
  }
  if (kind === 'speed') {
    const n = Math.round(4 + d * 18)
    const right = rng.chance(0.5)
    for (let i = 0; i < n; i++) {
      const len = R.w * rng.range(0.25, 1) * (1 - (i / n) * 0.6)
      const y = R.y + R.h - i * mt * 0.9
      const th = rng.pick([1, 1, 2, 3] as const)
      out.push(box(`sp${i}`, right ? R.x + R.w - len : R.x, y - th, len, th, pal.fg))
    }
    return <g opacity={0.22}>{out}</g>
  }
  if (kind === 'ticks') {
    const step = mt * 0.8
    let i = 0
    for (let x = R.x; x <= R.x + R.w; x += step, i++) {
      const major = i % 10 === 0
      const len = major ? mt * 1.4 : i % 5 === 0 ? mt : mt * 0.5
      out.push(line(`tk${i}`, x, R.y - mt * 1.6, x, R.y - mt * 1.6 + len, pal.fg, 1, 0.7))
      if (major && d > 0.4) out.push(meta(ctx, `tn${i}`, x + 2, R.y - mt * 2, String(i), pal.muted))
    }
    if (d > 0.6) {
      i = 0
      for (let y = R.y; y <= R.y + R.h; y += step, i++) {
        const len = i % 10 === 0 ? mt * 1.4 : i % 5 === 0 ? mt : mt * 0.5
        out.push(line(`tv${i}`, R.x - mt * 1.6, y, R.x - mt * 1.6 + len, y, pal.fg, 1, 0.7))
      }
    }
  }
  if (kind === 'hatch') {
    const id = `${ctx.id}-hatch`
    const gap = mt * (2.6 - d * 1.6)
    const hatch: ReactNode[] = []
    for (let x = R.x - R.h; x < R.x + R.w; x += gap) {
      hatch.push(line(`h${x}`, x, R.y + R.h, x + R.h, R.y, pal.fg, mt * 0.45))
    }
    return (
      <g key="texture">
        <defs>
          <clipPath id={id}>
            <rect height={r1(R.h)} width={r1(R.w)} x={r1(R.x)} y={r1(R.y)} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`} opacity={0.1}>
          {hatch}
        </g>
      </g>
    )
  }
  return <g key="texture">{out}</g>
}

// Moment placement --------------------------------------------------------

function chooseSpan(ctx: Ctx, minFrac: number, minPx = 0) {
  const { cfg, rng, cols, span, colX } = ctx
  let n = Math.round(cols * Math.sqrt(cfg.momentSize) * rng.range(0.95, 1.3))
  n = Math.max(n, Math.ceil(cols * minFrac))
  while (n < cols && span(n) < minPx) n++
  n = Math.min(cols, Math.max(1, n))
  const start = rng.int(0, cols - n)
  return { start, n, x: colX(start), w: span(n) }
}

function placeY(ctx: Ctx, h: number) {
  const v = ctx.rng.pick([0, 0.5, 1] as const)
  return ctx.A.y + Math.max(0, ctx.A.h - h) * v
}

type Moment = { node: ReactNode; rect: Rect | null }

// Modes (the tDR half: one per view) --------------------------------------

function frameMode(ctx: Ctx): Moment {
  const { cfg, meta: mt, pal, sans } = ctx
  const sp = chooseSpan(ctx, 0.6)
  const text = cfg.name.toLowerCase()
  const size = fitSize(text, sp.w, 'lower', cfg.frameWeight, -0.03, mt * cfg.scale)
  const h = size * 0.95
  const y = placeY(ctx, h)
  const base = y + size * 0.74
  return {
    rect: { x: sp.x, y, w: sp.w, h },
    node: (
      <g key="moment">
        {txt({
          key: 'm-name',
          x: sp.x - size * 0.04,
          y: base,
          size,
          text,
          family: sans,
          fill: pal.fg,
          weight: cfg.frameWeight,
          tracking: -0.03,
        })}
        {box('m-led', sp.x, base + mt * 1.6, mt * 0.9, mt * 0.9, pal.mark)}
        {meta(ctx, 'm-cap', sp.x + mt * 1.8, base + mt * 2.4, 'designer & builder')}
      </g>
    ),
  }
}

function nameCodeMode(ctx: Ctx): Moment {
  const { cfg, cols, meta: mt, pal, sans, momentWeight: w } = ctx
  const tr = cfg.momentTracking
  const text = cfg.code.toUpperCase()
  let sp = chooseSpan(ctx, 0.45)
  let size = fitSize(text, sp.w, 'caps', w, tr, mt * cfg.scale)
  if (size < mt * 8 && sp.n < cols) {
    sp = { start: 0, n: cols, x: ctx.colX(0), w: ctx.span(cols) }
    size = fitSize(text, sp.w, 'caps', w, tr, mt * cfg.scale)
  }
  const cap = size * CAP
  const h = cap + mt * 4.6
  const y = placeY(ctx, h)
  const base = y + cap
  const R = { x: sp.x, y, w: sp.w, h }
  return {
    rect: R,
    node: (
      <g key="moment">
        {texture(ctx, { x: R.x, y: R.y, w: R.w, h: cap }, ['speed', 'hatch', 'ticks', 'graph'])}
        {txt({
          key: 'm-code',
          x: sp.x - size * 0.03,
          y: base,
          size,
          text,
          family: sans,
          fill: pal.mark,
          weight: w,
          tracking: tr,
        })}
        {box('m-led', sp.x, base + mt * 1.55, mt * 1.1, mt * 1.1, ctx.fl(pal.mark))}
        {meta(ctx, 'm-l1', sp.x + mt * 2, base + mt * 2.5, 'designer & builder', pal.fg)}
        {meta(ctx, 'm-l2', sp.x + mt * 2, base + mt * 4.1, 'brand · product · technology')}
      </g>
    ),
  }
}

function sloganMode(ctx: Ctx): Moment {
  const { cfg, rng, cols, meta: mt, pal, sans, momentWeight: w, A } = ctx
  const tr = cfg.momentTracking
  const words = (cfg.slogan.trim() || rng.pick(SLOGANS)).toUpperCase().split(/\s+/).slice(0, 4)
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '')
  const lead = 0.86
  let sp = chooseSpan(ctx, 0.35)
  const sizeFor = (width: number) =>
    Math.min(
      fitSize(longest, width, 'caps', w, tr, mt * cfg.scale),
      (A.h - mt * 3) / (CAP + (words.length - 1) * lead),
    )
  let size = sizeFor(sp.w)
  if (size < mt * 8 && sp.n < cols) {
    sp = { start: 0, n: cols, x: ctx.colX(0), w: ctx.span(cols) }
    size = sizeFor(sp.w)
  }
  const cap = size * CAP
  const stackH = cap + (words.length - 1) * size * lead
  const h = stackH + mt * 3
  const y = placeY(ctx, h)
  const R = { x: sp.x, y, w: sp.w, h }
  const hi = rng.int(0, words.length - 1)
  const lines: ReactNode[] = []
  words.forEach((word, i) => {
    const base = y + cap + i * size * lead
    if (i === hi)
      lines.push(
        box(
          'm-hi',
          sp.x - ctx.gut * 0.5,
          base - cap * 0.34,
          sp.w + ctx.gut * 0.5,
          cap * 0.34,
          ctx.fl(pal.muted),
        ),
      )
    lines.push(
      txt({
        key: `m-w${i}`,
        x: sp.x - size * 0.03,
        y: base,
        size,
        text: word,
        family: sans,
        fill: pal.mark,
        weight: w,
        tracking: tr,
      }),
    )
  })
  return {
    rect: R,
    node: (
      <g key="moment">
        {texture(ctx, { x: R.x, y: R.y, w: R.w, h: stackH }, ['speed', 'hatch', 'graph'])}
        {lines}
        {meta(ctx, 'm-cap', sp.x, y + stackH + mt * 2.6, `principle ${serial(cfg.seed)}`)}
      </g>
    ),
  }
}

function roundelMode(ctx: Ctx): Moment {
  const { cfg, rng, meta: mt, pal, sans, momentWeight: w, A, id } = ctx
  const sp = chooseSpan(ctx, 0.3)
  const d = Math.min(sp.w, A.h)
  const r = d / 2
  const y = placeY(ctx, d)
  const cx = sp.x + (rng.chance(0.5) ? r : sp.w / 2)
  const cy = y + r
  const rt = r - mt * 1.5
  const ringText = `${cfg.name} · designer & builder · brooklyn ny · ${cfg.code} · `.toUpperCase()
  const circ = 2 * Math.PI * rt
  const repeat = Math.max(1, Math.floor(circ / measure(ringText, mt * 1.05, 'mono', 400, 0.18)))
  const pathId = `${id}-ring`
  const rings: ReactNode[] = []
  const ringCount = 1 + Math.round(cfg.density * 4)
  for (let i = 0; i < ringCount; i++) {
    const rr = r * (0.66 - i * 0.07)
    if (rr > 0) {
      rings.push(
        <circle
          cx={r1(cx)}
          cy={r1(cy)}
          fill="none"
          key={`ring${i}`}
          r={r1(rr)}
          stroke={pal.fg}
          strokeWidth={1}
        />,
      )
    }
  }
  const text = cfg.code.toUpperCase()
  const size = fitSize(text, r * 1.05, 'caps', w, cfg.momentTracking, mt * cfg.scale)
  const theta = rng.range(0, Math.PI * 2)
  return {
    rect: { x: cx - r, y, w: d, h: d },
    node: (
      <g key="moment">
        <defs>
          <path
            d={`M ${r1(cx - rt)} ${r1(cy)} a ${r1(rt)} ${r1(rt)} 0 1 1 ${r1(rt * 2)} 0 a ${r1(rt)} ${r1(rt)} 0 1 1 ${r1(-rt * 2)} 0`}
            id={pathId}
          />
        </defs>
        <circle cx={r1(cx)} cy={r1(cy)} fill="none" r={r1(r)} stroke={pal.fg} strokeWidth={1.5} />
        {rings}
        <text
          fill={pal.fg}
          fontFamily={MONO}
          fontSize={r1(mt * 1.05)}
          letterSpacing="0.18em"
          lengthAdjust="spacing"
          textLength={r1(circ * 0.995)}
        >
          <textPath href={`#${pathId}`}>{ringText.repeat(repeat)}</textPath>
        </text>
        {txt({
          key: 'm-code',
          x: cx,
          y: cy + (size * CAP) / 2,
          size,
          text,
          family: sans,
          fill: pal.mark,
          weight: w,
          tracking: cfg.momentTracking,
          anchor: 'middle',
        })}
        <circle
          cx={r1(cx + Math.cos(theta) * r)}
          cy={r1(cy + Math.sin(theta) * r)}
          fill={ctx.fl(pal.mark)}
          r={r1(mt * 0.75)}
        />
      </g>
    ),
  }
}

function plateMode(ctx: Ctx): Moment {
  const { cfg, meta: mt, pal, sans, momentWeight: w } = ctx
  const sp = chooseSpan(ctx, 0.3, 440)
  const pad = mt * 1.6
  const iw = sp.w - pad * 2
  const x0 = sp.x + pad
  const head = cfg.name.toUpperCase()
  const size = fitSize(head, iw * 0.96, 'caps', w, cfg.momentTracking, mt * cfg.scale * 0.7)
  const cap = size * CAP
  const rows = [['model', cfg.code], ...SPEC.map(([l, v]) => [l, v] as const)].slice(
    0,
    3 + Math.round(cfg.density * 2),
  )
  const rowH = mt * 2.2
  const footH = mt * 5
  const h = pad + cap + mt * 1.6 + mt * 1.6 + rows.length * rowH + mt * 1.2 + footH + pad
  const y = placeY(ctx, h)
  const out: ReactNode[] = [box('p-body', sp.x, y, sp.w, h, pal.bg, pal.fg)]
  let cy = y + pad + cap
  out.push(
    txt({
      key: 'p-head',
      x: x0,
      y: cy,
      size,
      text: head,
      family: sans,
      fill: pal.mark,
      weight: w,
      tracking: cfg.momentTracking,
    }),
  )
  out.push(meta(ctx, 'p-r', x0 + iw, y + pad + mt * 0.8, '®', pal.fg, 'end'))
  cy += mt * 1.6
  out.push(line('p-rule', x0, cy, x0 + iw, cy, pal.fg))
  cy += mt * 1.6
  rows.forEach(([label, value], i) => {
    const base = cy + i * rowH + mt * 0.9
    out.push(meta(ctx, `p-l${i}`, x0, base, label))
    out.push(meta(ctx, `p-v${i}`, x0 + iw, base, value, pal.fg, 'end'))
    out.push(line(`p-rr${i}`, x0, base + mt * 1.1, x0 + iw, base + mt * 1.1, pal.fg, 1, 0.25))
  })
  cy += rows.length * rowH + mt * 1.2
  out.push(barcode(ctx, 'p-bc', x0, cy, iw * 0.45, mt * 3.1, pal.fg))
  out.push(
    meta(ctx, 'p-ser', x0, cy + footH - mt * 0.2, `${serial(cfg.seed)} / ${MODE_CODES[cfg.mode]}`),
  )
  const sw = iw * 0.3
  const screenFill = INK
  out.push(
    box(
      'p-screen',
      x0 + iw - sw,
      cy,
      sw,
      footH,
      screenFill,
      cfg.ground === 'ink' ? pal.fg : undefined,
      1,
    ),
  )
  out.push(
    txt({
      key: 'p-readout',
      x: x0 + iw - sw / 2,
      y: cy + footH / 2 + mt * 1.05,
      size: mt * 2.9,
      text: digits(cfg.code),
      family: PIXEL,
      fill: ctx.fl('#f5f5f5'),
      anchor: 'middle',
    }),
  )
  return { rect: { x: sp.x, y, w: sp.w, h }, node: <g key="moment">{out}</g> }
}

function receiptMode(ctx: Ctx): Moment {
  const { cfg, meta: mt, pal, sans, momentWeight: w } = ctx
  const sp = chooseSpan(ctx, 0.25, 380)
  const items = RECEIPT_ITEMS.slice(0, 3 + Math.round(cfg.density * 4))
  const rowH = mt * 2.1
  const num = digits(cfg.code)
  const size = fitSize(num, sp.w * 0.45, 'caps', w, cfg.momentTracking, mt * cfg.scale)
  const cap = size * CAP
  const totalH = cap + mt * 2.4
  const h = mt * 2.6 + items.length * rowH + mt * 1.4 + totalH + mt * 3.6
  const y = placeY(ctx, h)
  const x0 = sp.x
  const x1 = sp.x + sp.w
  const out: ReactNode[] = []
  out.push(meta(ctx, 'r-h1', x0, y + mt, `${cfg.code} / receipt`, pal.fg))
  out.push(meta(ctx, 'r-h2', x1, y + mt, serial(cfg.seed), pal.fg, 'end'))
  const dash = (key: string, yy: number) => (
    <line
      key={key}
      stroke={pal.fg}
      strokeDasharray="2 4"
      strokeWidth={1}
      x1={r1(x0)}
      x2={r1(x1)}
      y1={r1(yy)}
      y2={r1(yy)}
    />
  )
  out.push(dash('r-d1', y + mt * 2))
  let cy = y + mt * 2.6
  items.forEach(([label, value], i) => {
    const base = cy + i * rowH + mt * 1.1
    const lw = measure(label.toUpperCase(), mt, 'mono', 400, 0.04)
    const vw = measure(value.toUpperCase(), mt, 'mono', 400, 0.04)
    out.push(meta(ctx, `r-l${i}`, x0, base, label, pal.fg))
    out.push(meta(ctx, `r-v${i}`, x1, base, value, pal.fg, 'end'))
    if (x1 - vw - mt > x0 + lw + mt) {
      out.push(
        <line
          key={`r-dot-${label}`}
          opacity={0.5}
          stroke={pal.fg}
          strokeDasharray="1 5"
          strokeLinecap="round"
          strokeWidth={1.5}
          x1={r1(x0 + lw + mt * 0.6)}
          x2={r1(x1 - vw - mt * 0.6)}
          y1={r1(base - mt * 0.15)}
          y2={r1(base - mt * 0.15)}
        />,
      )
    }
  })
  cy += items.length * rowH + mt * 0.6
  out.push(dash('r-d2', cy))
  cy += mt * 0.8
  const blockFill = ctx.fl(pal.mark)
  const onBlock = cfg.fluoroOn ? INK : pal.onMark
  out.push(box('r-total', x0, cy, sp.w, totalH, blockFill))
  out.push(meta(ctx, 'r-tl', x0 + mt, cy + mt * 1.9, 'total / years', onBlock))
  out.push(
    txt({
      key: 'r-num',
      x: x1 - mt * 0.6,
      y: cy + mt * 1.2 + cap,
      size,
      text: num,
      family: sans,
      fill: onBlock,
      weight: w,
      tracking: cfg.momentTracking,
      anchor: 'end',
    }),
  )
  cy += totalH + mt * 2.4
  out.push(meta(ctx, 'r-foot', x0, cy, 'thank you for reading'))
  return { rect: { x: sp.x, y, w: sp.w, h }, node: <g key="moment">{out}</g> }
}

function controlMapMode(ctx: Ctx): Moment {
  const { cfg, rng, meta: mt, pal, gut, A } = ctx
  const sp = chooseSpan(ctx, 0.45, 640)
  const dw = sp.w * 0.64
  const n = 3 + Math.round(cfg.density * 7)
  const dh = Math.min(
    A.h - mt * 4,
    dw * rng.pick([0.38, 0.46, 0.56] as const),
    Math.max(n * mt * 2.1, dw * 0.3),
  )
  const h = dh + mt * 4
  const y = placeY(ctx, h) + mt * 3
  const x0 = sp.x
  const pad = mt * 2.2
  const gcols = Math.min(n, Math.max(2, Math.round(Math.sqrt((n * dw) / dh))))
  const grows = Math.ceil(n / gcols)
  const cw = (dw - pad * 2) / gcols
  const ch = (dh - pad * 2) / grows
  const live = rng.int(0, n - 1)
  const out: ReactNode[] = []

  // Engineering dimension line over the body.
  const dimY = y - mt * 1.6
  out.push(line('c-dim', x0, dimY, x0 + dw, dimY, pal.fg, 1, 0.7))
  out.push(line('c-dim-a', x0, dimY - mt * 0.6, x0, dimY + mt * 0.6, pal.fg, 1, 0.7))
  out.push(line('c-dim-b', x0 + dw, dimY - mt * 0.6, x0 + dw, dimY + mt * 0.6, pal.fg, 1, 0.7))
  out.push(
    meta(
      ctx,
      'c-dim-t',
      x0 + dw / 2,
      dimY - mt * 0.6,
      `${Math.round(dw / 5)} mm`,
      pal.muted,
      'middle',
    ),
  )

  out.push(box('c-body', x0, y, dw, dh, pal.bg, pal.fg))
  const centers: { cx: number; cy: number; gapY: number }[] = []
  for (let i = 0; i < n; i++) {
    const col = i % gcols
    const row = Math.floor(i / gcols)
    const cx = x0 + pad + cw * (col + 0.5)
    const cy = y + pad + ch * (row + 0.5)
    const s = Math.min(cw, ch)
    const kind = rng.pick(['encoder', 'encoder', 'key', 'fader'] as const)
    const isLive = i === live
    const fill = isLive ? pal.mark : pal.bg
    if (kind === 'encoder') {
      const rr = s * 0.3
      const a = rng.range(-Math.PI * 0.8, -Math.PI * 0.2)
      out.push(
        <circle
          cx={r1(cx)}
          cy={r1(cy)}
          fill={fill}
          key={`c${i}`}
          r={r1(rr)}
          stroke={pal.fg}
          strokeWidth={1.5}
        />,
      )
      out.push(
        line(
          `c${i}-i`,
          cx,
          cy,
          cx + Math.cos(a) * rr,
          cy + Math.sin(a) * rr,
          isLive ? pal.onMark : pal.fg,
          1.5,
        ),
      )
    } else if (kind === 'key') {
      const k = s * 0.5
      out.push(box(`c${i}`, cx - k / 2, cy - k / 2, k, k, fill, pal.fg))
    } else {
      const fh = ch * 0.7
      out.push(line(`c${i}-s`, cx, cy - fh / 2, cx, cy + fh / 2, pal.fg, 1.5))
      const kh = s * 0.16
      const ky = cy - fh / 2 + (fh - kh) * rng.next()
      out.push(box(`c${i}`, cx - s * 0.18, ky, s * 0.36, kh, fill, pal.fg))
    }
    out.push(meta(ctx, `c${i}-n`, cx - s * 0.48, cy - s * 0.36, String(i + 1).padStart(2, '0')))
    // The wire leaves along the gap under its row, clear of other controls.
    centers.push({ cx, cy, gapY: y + pad + ch * (row + 1) })
  }
  out.push(
    box(
      'c-led',
      x0 + dw - pad * 0.5 - mt * 0.9,
      y + pad * 0.5 - mt * 0.45,
      mt * 0.9,
      mt * 0.9,
      ctx.fl(pal.mark),
    ),
  )

  // Legend: numbered like a manual, the live control wired to its label in spot.
  const lx = x0 + dw + gut * 2
  const step = Math.min(mt * 2.2, dh / Math.max(1, n))
  for (let i = 0; i < n; i++) {
    const ly = y + mt * 1.2 + i * step
    const isLive = i === live
    out.push(
      meta(
        ctx,
        `l${i}`,
        lx,
        ly,
        `${String(i + 1).padStart(2, '0')} ${CONTROL_LABELS[i % CONTROL_LABELS.length]}`,
        isLive ? pal.fg : pal.muted,
      ),
    )
    if (isLive) {
      const c = centers[i]
      if (c) {
        out.push(
          <path
            d={`M ${r1(c.cx)} ${r1(c.cy)} V ${r1(c.gapY)} H ${r1(x0 + dw + gut)} V ${r1(ly - mt * 0.35)} H ${r1(lx - mt * 0.5)}`}
            fill="none"
            key="c-wire"
            stroke={pal.mark}
            strokeWidth={1.5}
          />,
        )
      }
    }
  }
  return {
    rect: { x: sp.x, y: y - mt * 3, w: sp.w, h },
    node: (
      <g key="moment">
        {cfg.density > 0.3 ? texture(ctx, { x: x0, y, w: dw, h: dh }, ['graph']) : null}
        {out}
      </g>
    ),
  }
}

const MODE_RENDERERS: Record<Mode, (ctx: Ctx) => Moment> = {
  frame: frameMode,
  'name-code': nameCodeMode,
  slogan: sloganMode,
  roundel: roundelMode,
  plate: plateMode,
  receipt: receiptMode,
  'control-map': controlMapMode,
}

// Entry -------------------------------------------------------------------

export function renderSize(cfg: BrandConfig) {
  return { width: RENDER_WIDTH, height: Math.round(RENDER_WIDTH / ASPECTS[cfg.aspect]) }
}

/** Pure: the same config (seed included) always draws the same composition. */
export function renderBrand(
  cfg: BrandConfig,
  opts: {
    idPrefix?: string
    title?: string
    bare?: boolean
    /** Exact pixel size (social formats) instead of the aspect knob. */
    size?: { width: number; height: number }
    /** Metadata type size in px; defaults to a fixed share of the width. */
    meta?: number
  } = {},
): ReactElement {
  const { width: W, height: H } = opts.size ?? renderSize(cfg)
  const rng = createRng(cfg.seed ^ (MODES.indexOf(cfg.mode) * 0x9e3779b1))
  const m = W * cfg.margin
  const gut = W * 0.012
  const cols = cfg.columns
  const innerW = W - m * 2
  const colW = (innerW - gut * (cols - 1)) / cols
  const metaSize = opts.meta ?? W * 0.0078
  const body = metaSize * 1.6
  const pal = palette(cfg)
  const family = FAMILIES[cfg.family]
  // Bare: the moment alone, for a page that draws its own frame and grid.
  const top = opts.bare ? m * 0.5 : m + body * 1.5 + body * 1.6
  const bottom = opts.bare ? H - m * 0.5 : H - m - body * 1.4 - metaSize * 2.4 - body * 1.6
  const ctx: Ctx = {
    cfg,
    rng,
    W,
    H,
    m,
    gut,
    cols,
    colW,
    meta: metaSize,
    body,
    colX: (i) => m + i * (colW + gut),
    span: (n) => n * colW + (n - 1) * gut,
    A: { x: m, y: top, w: innerW, h: bottom - top },
    pal,
    sans: family.css,
    momentWeight: Math.min(cfg.momentWeight, family.maxWeight),
    id: `${opts.idPrefix ?? 'brand'}-${cfg.seed}`,
    fl: (fallback) => (cfg.fluoroOn ? pal.fluoro : fallback),
  }
  const under = opts.bare ? null : frameUnder(ctx)
  const moment = MODE_RENDERERS[cfg.mode](ctx)
  const over = opts.bare ? null : frameOver(ctx, moment.rect)
  // Bare crops to the moment so a page opening carries no empty band.
  const crop =
    opts.bare && moment.rect
      ? {
          y: Math.max(0, moment.rect.y - m * 0.6),
          h: Math.min(H, moment.rect.h + m * 1.2),
        }
      : { y: 0, h: H }
  return (
    <svg
      role="img"
      viewBox={`0 ${r1(crop.y)} ${W} ${r1(crop.h)}`}
      xmlns="http://www.w3.org/2000/svg"
      height={r1(crop.h)}
      style={{ display: 'block' }}
      width={W}
    >
      <title>{opts.title ?? `${cfg.mode} ${cfg.seed}`}</title>
      {opts.bare ? null : <rect fill={pal.bg} height={H} width={W} />}
      {under}
      {moment.node}
      {over}
    </svg>
  )
}
