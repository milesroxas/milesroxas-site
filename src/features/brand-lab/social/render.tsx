import type { ReactElement, ReactNode } from 'react'

import { FAMILIES, INK, MONO } from '../config'
import { CASE, type LabWork, POSTS, WORKS, workById } from '../content'
import { createRng } from '../random'
import { headlineCase, palette, renderBrand } from '../render'
import { FORMATS, type SocialConfig } from './config'

type Box = { x: number; y: number; w: number; h: number }
type Kind = 'caps' | 'text' | 'mono'

const r1 = (v: number) => Math.round(v * 10) / 10
const pad2 = (n: number) => String(n).padStart(2, '0')

const perEm = (kind: Kind, weight: number, tracking: number) =>
  (kind === 'mono'
    ? 0.6
    : kind === 'caps'
      ? 0.6 + (Math.max(0, weight - 400) / 500) * 0.12
      : 0.5 + (Math.max(0, weight - 300) / 600) * 0.08) + tracking

function wrap(words: string[], maxChars: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars || !line) line = next
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Largest size at which the text wraps inside the box (greedy wrap, estimated advance). */
function fitLines(
  text: string,
  box: { w: number; h: number },
  o: {
    max: number
    min: number
    kind: Kind
    weight: number
    tracking: number
    lh: number
    maxLines?: number
  },
) {
  const words = text.split(/\s+/).filter(Boolean)
  let size = o.max
  let lines = [text]
  while (size >= o.min) {
    const maxChars = Math.floor(box.w / (size * perEm(o.kind, o.weight, o.tracking)))
    lines = wrap(words, maxChars)
    const fitsWidth = lines.every((l) => l.length <= maxChars)
    const fitsHeight = (lines.length - 1) * size * o.lh + size * 0.75 <= box.h
    if (fitsWidth && fitsHeight && (!o.maxLines || lines.length <= o.maxLines)) break
    size *= 0.95
  }
  return { size: Math.max(size, o.min), lines }
}

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
  anchor?: 'start' | 'end' | 'middle'
}

const txt = (o: TextOpts) => (
  <text
    fill={o.fill}
    fontFamily={o.family}
    fontSize={r1(o.size)}
    fontWeight={o.weight ?? 400}
    key={o.key}
    letterSpacing={o.tracking ? `${o.tracking}em` : undefined}
    textAnchor={o.anchor}
    x={r1(o.x)}
    y={r1(o.y)}
  >
    {o.text}
  </text>
)

const rect = (key: string, b: Box, fill: string, stroke?: string, sw = 2) => (
  <rect
    fill={fill}
    height={r1(b.h)}
    key={key}
    stroke={stroke}
    strokeWidth={stroke ? sw : undefined}
    width={r1(b.w)}
    x={r1(b.x)}
    y={r1(b.y)}
  />
)

const headlineFor = (cfg: SocialConfig, work: LabWork) => {
  if (cfg.headline.trim()) return cfg.headline.trim()
  if (cfg.template === 'quote') return work.id === CASE.workId ? CASE.pull : work.description
  const short: Record<number, string> = {
    17: 'ten screens to three',
    15: 'events without the noise',
    14: 'craft and code',
    10: 'design systems at scale',
    1: 'brand through narrative',
  }
  return short[work.id] ?? work.title.split(' ').slice(0, 4).join(' ')
}

/** Pure: a social config (brand and seed included) always draws the same post. */
export function renderSocial(cfg: SocialConfig, opts: { idPrefix?: string } = {}): ReactElement {
  const { w: W, h: H } = FORMATS[cfg.format]
  const S = Math.min(W, H)
  const brand = cfg.brand
  if (cfg.template === 'moment') {
    return renderBrand(brand, {
      idPrefix: opts.idPrefix ?? 'social',
      size: { width: W, height: H },
      meta: S * 0.016,
      title: `${cfg.format} moment`,
    })
  }

  const pal = palette(brand)
  const fam = FAMILIES[brand.family]
  const sans = fam.css
  const wm = Math.min(brand.momentWeight, fam.maxWeight)
  const wf = brand.frameWeight
  const fluoro = brand.fluoroOn ? pal.fluoro : pal.mark
  const onFluoro = brand.fluoroOn ? INK : pal.onMark
  const rng = createRng((brand.seed ^ 0x50c) >>> 0)
  const work = workById(cfg.workId)
  const idx = WORKS.indexOf(work)
  const partNo = `${brand.code}–W${pad2(idx + 1)}`
  const meta = S * 0.022
  const body = meta * 1.6
  const m = S * Math.max(0.05, brand.margin * 1.2)
  const gut = W * 0.012
  const landscape = W / H >= 1.3
  const portrait = H / W >= 1.2
  const id = `${opts.idPrefix ?? 'social'}-${brand.seed}`

  const metaText = (
    key: string,
    x: number,
    y: number,
    text: string,
    fill = pal.muted,
    anchor?: TextOpts['anchor'],
  ) =>
    txt({
      key,
      x,
      y,
      size: meta,
      text: text.toUpperCase(),
      family: MONO,
      fill,
      tracking: 0.05,
      anchor,
    })

  const image = (key: string, b: Box) =>
    work.image ? (
      <image
        height={r1(b.h)}
        href={work.image}
        key={key}
        preserveAspectRatio="xMidYMid slice"
        width={r1(b.w)}
        x={r1(b.x)}
        y={r1(b.y)}
      />
    ) : (
      <g key={key}>
        {rect(`${key}-bg`, b, mix(pal.fg, pal.bg, 0.94))}
        {metaText(`${key}-p`, b.x + meta, b.y + meta * 2, partNo)}
        {metaText(`${key}-c`, b.x + meta, b.y + b.h - meta, work.client)}
      </g>
    )

  const grid: ReactNode[] = []
  if (brand.gridOpacity > 0 && cfg.template !== 'thumb') {
    const cw = (W - 2 * m - gut * (brand.columns - 1)) / brand.columns
    for (let i = 0; i < brand.columns; i++) {
      const x = m + i * (cw + gut)
      for (const xx of [x, x + cw]) {
        grid.push(
          <line
            key={`g${i}-${xx}`}
            opacity={brand.gridOpacity}
            stroke={pal.fg}
            strokeWidth={1}
            x1={r1(xx)}
            x2={r1(xx)}
            y1={0}
            y2={H}
          />,
        )
      }
    }
  }

  // Frame bands (TE): name and code on top, address and part on the bottom.
  const frame: ReactNode[] = [
    txt({
      key: 'f-name',
      x: m,
      y: m + body * 0.75,
      size: body,
      text: brand.name.toLowerCase(),
      family: sans,
      fill: pal.fg,
      weight: wf,
      tracking: -0.01,
    }),
    metaText('f-code', W - m, m + body * 0.75, brand.code, pal.fg, 'end'),
    <line
      key="f-rule"
      stroke={pal.fg}
      strokeWidth={2}
      x1={m}
      x2={W - m}
      y1={r1(m + body * 1.4)}
      y2={r1(m + body * 1.4)}
    />,
    metaText('f-url', m, H - m, 'milesroxas.com'),
    metaText('f-role', W - m, H - m, 'designer & builder', pal.muted, 'end'),
  ]
  const C: Box = { x: m, y: m + body * 2.6, w: W - 2 * m, h: H - m * 2 - body * 2.6 - meta * 3 }

  let content: ReactNode[] = []
  let framed = true

  if (cfg.template === 'case') {
    const keyW = meta * 4.2
    const keyH = meta * 1.9
    // Square: the name runs full width on top, image and title split the rest.
    const square = !landscape && !portrait
    const half = (C.w - gut) / 2
    const tbW = landscape ? W / 2 - m - gut * 1.5 : square ? half : C.w
    const metaLines = square ? 1 : 2
    // Rule 6: the long title drops to body size; the project name is the moment.
    const title = fitLines(
      headlineCase(work.title),
      { w: tbW, h: body * 3 },
      {
        max: body,
        min: body,
        kind: 'text',
        weight: wf,
        tracking: -0.01,
        lh: 1.3,
      },
    )
    const titleH = body + (title.lines.length - 1) * body * 1.3
    const bandH = metaLines === 2 ? meta * 3.4 : meta * 1.8
    const below = meta * 2 + titleH + meta * 1.8 + bandH
    const markOpts = {
      max: S * 0.26,
      min: meta * 8,
      kind: 'caps' as const,
      weight: wm,
      tracking: brand.momentTracking,
      lh: 0.88,
    }
    const markText = work.client.toUpperCase()
    // Landscape gives the name the height beside the image; narrower formats size the name
    // first and hand the image what is left.
    const t = landscape
      ? fitLines(markText, { w: tbW, h: C.h - keyH - meta * 2.2 - below }, markOpts)
      : fitLines(markText, { w: C.w, h: C.h * (square ? 0.42 : 0.34) }, markOpts)
    const markH = t.size * 0.72 + (t.lines.length - 1) * t.size * 0.88
    const textH = keyH + meta * 2.2 + markH + below
    const head = square ? { x: C.x, y: C.y } : null
    const splitY = C.y + keyH + meta * 2.2 + markH + meta * 2.6
    const imgBox: Box = landscape
      ? { x: W / 2 + gut / 2, y: C.y, w: W / 2 - m - gut / 2, h: C.h }
      : square
        ? { x: C.x, y: splitY, w: half, h: C.y + C.h - splitY }
        : { x: C.x, y: C.y, w: C.w, h: C.h - textH - meta * 2.4 }
    const tb: Box = landscape
      ? { x: C.x, y: C.y, w: tbW, h: C.h }
      : square
        ? { x: C.x + half + gut, y: splitY, w: half, h: C.y + C.h - splitY }
        : { x: C.x, y: imgBox.y + imgBox.h + meta * 2.4, w: C.w, h: textH }
    const top = head ?? { x: tb.x, y: tb.y }
    const ruleY = tb.y + tb.h - bandH
    const titleLast = ruleY - meta * 1.8
    const titleTop = titleLast - (title.lines.length - 1) * body * 1.3
    const markTop = top.y + keyH + meta * 2.2
    const markBase = markTop + t.size * 0.72
    content = [
      image('c-img', imgBox),
      rect('c-new', { x: top.x, y: top.y, w: keyW, h: keyH }, fluoro),
      metaText(
        'c-new-t',
        top.x + keyW / 2,
        top.y + keyH / 2 + meta * 0.36,
        'new',
        onFluoro,
        'middle',
      ),
      metaText(
        'c-part',
        top.x + keyW + meta,
        top.y + keyH / 2 + meta * 0.36,
        `case study / ${partNo}`,
        pal.fg,
      ),
      ...t.lines.map((l, i) =>
        txt({
          key: `c-m${i}`,
          x: top.x - t.size * 0.03,
          y: markBase + i * t.size * 0.88,
          size: t.size,
          text: l,
          family: sans,
          fill: pal.mark,
          weight: wm,
          tracking: brand.momentTracking,
        }),
      ),
      ...title.lines.map((l, i) =>
        txt({
          key: `c-t${i}`,
          x: tb.x,
          y: titleTop + i * body * 1.3,
          size: body,
          text: l,
          family: sans,
          fill: pal.fg,
          weight: wf,
          tracking: -0.01,
        }),
      ),
      <line
        key="c-rule"
        stroke={pal.fg}
        strokeWidth={2}
        x1={r1(tb.x)}
        x2={r1(tb.x + tb.w)}
        y1={r1(ruleY)}
        y2={r1(ruleY)}
      />,
      metaText(
        'c-role',
        tb.x,
        tb.y + tb.h - (metaLines === 2 ? meta * 1.6 : 0),
        work.role ?? 'designer & builder',
        pal.fg,
      ),
      // Narrow columns drop the capabilities line rather than shrink it.
      metaLines === 2 ? metaText('c-caps', tb.x, tb.y + tb.h, work.capabilities.join(' / ')) : null,
    ]
  }

  if (cfg.template === 'post') {
    const post = POSTS[cfg.postIndex] ?? POSTS[0]
    const text = headlineCase(cfg.headline.trim() || post?.title || '')
    const box = { w: C.w * (landscape ? 0.82 : 1), h: C.h - meta * 9 }
    const t = fitLines(text, box, {
      max: S * 0.12,
      min: meta * 1.4,
      kind: 'text',
      weight: wf,
      tracking: -0.03,
      lh: 1.02,
    })
    const top = C.y + meta * 4 + t.size * 0.78
    const ruleY = C.y + C.h - meta * 2.6
    content = [
      rect('p-led', { x: C.x, y: C.y + meta * 0.2, w: meta * 1.1, h: meta * 1.1 }, fluoro),
      metaText(
        'p-label',
        C.x + meta * 2,
        C.y + meta * 1.1,
        `new post / P–${pad2(cfg.postIndex + 1)} / ${post?.date ?? ''}`,
        pal.fg,
      ),
      ...t.lines.map((l, i) =>
        txt({
          key: `p-t${i}`,
          x: C.x - t.size * 0.04,
          y: top + i * t.size * 1.02,
          size: t.size,
          text: l,
          family: sans,
          fill: pal.fg,
          weight: wf,
          tracking: -0.03,
        }),
      ),
      <line
        key="p-rule"
        stroke={pal.fg}
        strokeWidth={2}
        x1={r1(C.x)}
        x2={r1(C.x + C.w)}
        y1={r1(ruleY)}
        y2={r1(ruleY)}
      />,
      metaText('p-read', C.x, ruleY + meta * 2, 'read at milesroxas.com/posts', pal.fg),
      metaText('p-arrow', C.x + C.w, ruleY + meta * 2, '→', pal.fg, 'end'),
    ]
  }

  if (cfg.template === 'quote') {
    const text = headlineFor(cfg, work).toUpperCase().replace(/\.$/, '')
    const box = { w: C.w, h: C.h - meta * 6 }
    const t = fitLines(text, box, {
      max: S * 0.15,
      min: meta * 1.4,
      kind: 'caps',
      weight: wm,
      tracking: brand.momentTracking,
      lh: 0.9,
    })
    const cap = t.size * 0.72
    const top = C.y + meta * 2 + cap
    const last = t.lines.length - 1
    // The advance estimate runs wide on purpose for fitting; trim it for the marker.
    const lastW =
      (t.lines[last] ?? '').length * t.size * perEm('caps', wm, brand.momentTracking) * 0.88
    const lastBase = top + last * t.size * 0.9
    content = [
      rect(
        'q-hi',
        {
          x: C.x - gut * 0.4,
          y: lastBase - cap * 0.36,
          w: Math.min(C.w, lastW) + gut * 0.8,
          h: cap * 0.34,
        },
        fluoro,
      ),
      ...t.lines.map((l, i) =>
        txt({
          key: `q-t${i}`,
          x: C.x - t.size * 0.03,
          y: top + i * t.size * 0.9,
          size: t.size,
          text: l,
          family: sans,
          fill: pal.mark,
          weight: wm,
          tracking: brand.momentTracking,
        }),
      ),
      metaText(
        'q-src',
        C.x,
        lastBase + meta * 3.4,
        `from / ${work.client} case study / ${partNo}`,
        pal.fg,
      ),
    ]
  }

  if (cfg.template === 'thumb') {
    framed = false
    const words = headlineFor(cfg, work).toUpperCase().split(/\s+/).slice(0, 4).join(' ')
    const stripe = S * 0.018
    const imgBox: Box = landscape
      ? { x: W * 0.55, y: 0, w: W * 0.45, h: H }
      : { x: 0, y: 0, w: W, h: H * (portrait ? 0.46 : 0.44) }
    const stripeBox: Box = landscape
      ? { x: imgBox.x - stripe, y: 0, w: stripe, h: H }
      : { x: 0, y: imgBox.h, w: W, h: stripe }
    const tb: Box = landscape
      ? { x: m, y: m + meta * 3, w: imgBox.x - stripe - m - gut * 2, h: H - m * 2 - meta * 6.5 }
      : {
          x: m,
          y: imgBox.h + stripe + m * 0.8 + meta * 2.5,
          w: W - m * 2,
          h: H - imgBox.h - stripe - m * 1.8 - meta * 6,
        }
    const t = fitLines(words, tb, {
      max: S * 0.3,
      min: meta * 2,
      kind: 'caps',
      weight: wm,
      tracking: brand.momentTracking,
      lh: 0.88,
    })
    const cap = t.size * 0.72
    const blockH = cap + (t.lines.length - 1) * t.size * 0.88
    const top = tb.y + Math.max(0, (tb.h - blockH) / 2) + cap
    const hi = rng.int(0, t.lines.length - 1)
    const hiW = (t.lines[hi] ?? '').length * t.size * perEm('caps', wm, brand.momentTracking) * 0.88
    const hiBase = top + hi * t.size * 0.88
    const labelY = landscape ? m + meta : tb.y - meta * 1.2
    content = [
      image('t-img', imgBox),
      rect('t-stripe', stripeBox, pal.mark),
      metaText('t-label', m, labelY, `${brand.code} / ${work.client}`, pal.fg),
      rect(
        't-hi',
        {
          x: tb.x - gut * 0.4,
          y: hiBase - cap * 0.38,
          w: Math.min(tb.w, hiW) + gut * 0.8,
          h: cap * 0.36,
        },
        fluoro,
      ),
      ...t.lines.map((l, i) =>
        txt({
          key: `t-t${i}`,
          x: tb.x - t.size * 0.03,
          y: top + i * t.size * 0.88,
          size: t.size,
          text: l,
          family: sans,
          fill: pal.mark,
          weight: wm,
          tracking: brand.momentTracking,
        }),
      ),
      // Bottom left only: YouTube draws its timestamp over the bottom right.
      txt({
        key: 't-name',
        x: m,
        y: H - m,
        size: body,
        text: brand.name.toLowerCase(),
        family: sans,
        fill: pal.fg,
        weight: wf,
        tracking: -0.01,
      }),
    ]
  }

  return (
    <svg
      height={H}
      role="img"
      style={{ display: 'block' }}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{`${cfg.template} ${cfg.format}`}</title>
      <rect fill={pal.bg} height={H} width={W} />
      <g id={id}>
        {grid}
        {framed ? frame : null}
        {content}
      </g>
    </svg>
  )
}

function mix(a: string, b: string, t: number) {
  const pa = Number.parseInt(a.slice(1), 16)
  const pb = Number.parseInt(b.slice(1), 16)
  const ch = (n: number, s: number) => (n >> s) & 255
  const out = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t))
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
