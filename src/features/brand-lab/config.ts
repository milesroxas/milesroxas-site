export const MODES = [
  'frame',
  'name-code',
  'slogan',
  'roundel',
  'plate',
  'receipt',
  'control-map',
] as const
export type Mode = (typeof MODES)[number]

export const MODE_LABELS: Record<Mode, string> = {
  frame: 'frame only',
  'name-code': 'name code',
  slogan: 'slogan stack',
  roundel: 'roundel',
  plate: 'data plate',
  receipt: 'receipt',
  'control-map': 'control map',
}

export const ASPECTS = {
  hero: 16 / 9,
  poster: 4 / 5,
  square: 1,
  social: 1.91,
} as const
export type Aspect = keyof typeof ASPECTS

export const GROUNDS = ['paper', 'ink', 'spot'] as const
export type Ground = (typeof GROUNDS)[number]

export const FAMILIES = {
  geist: { label: 'geist (100–900)', css: 'var(--font-geist-sans), sans-serif', maxWeight: 900 },
  plex: {
    label: 'ibm plex sans (300–700)',
    css: 'var(--font-ibm-plex-sans), sans-serif',
    maxWeight: 700,
  },
} as const
export type Family = keyof typeof FAMILIES

export const MONO = 'var(--font-geist-mono), ui-monospace, monospace'
export const PIXEL = 'var(--font-geist-pixel-square), var(--font-geist-mono), monospace'

/** Brand spot candidates, each traced to a tDR or TE source. */
export const SPOTS = [
  { name: 'signal orange (op-1)', hex: '#f05a24' },
  { name: 'record red (te)', hex: '#b81d13' },
  { name: 'cobalt', hex: '#1f4fd8' },
  { name: 'encoder blue (te)', hex: '#0071bb' },
  { name: 'encoder green (te)', hex: '#006837' },
  { name: 'tri repetae green', hex: '#5d7d66' },
  { name: 'warp purple', hex: '#5b2a86' },
  { name: 'field ochre', hex: '#c8962a' },
] as const

/** Pantone 801–806 fluoro inks, screen approximations. One element per view. */
export const FLUOROS = [
  { name: '801 blue', hex: '#00aedb' },
  { name: '802 green', hex: '#44d62c' },
  { name: '803 yellow', hex: '#ffe900' },
  { name: '804 orange', hex: '#ff9e1b' },
  { name: '805 red', hex: '#ff585d' },
  { name: '806 pink', hex: '#ff3eb5' },
] as const

export const PAPERS = [
  { name: 'te white', hex: '#f5f5f5' },
  { name: 'newsprint', hex: '#efece4' },
  { name: 'bright', hex: '#fbfbfa' },
] as const

export const INK = '#0f0e12'

export const SLOGANS = [
  'design then build',
  'designed and built',
  'systems not slides',
  'problem insight build',
  'make it useful',
  'think make test',
  'craft clarity use',
  'made in brooklyn',
] as const

export type BrandConfig = {
  version: 1
  seed: number
  mode: Mode
  aspect: Aspect
  ground: Ground
  paper: number
  spot: number
  fluoro: number
  fluoroOn: boolean
  family: Family
  frameWeight: number
  momentWeight: number
  momentTracking: number
  scale: number
  columns: number
  gridOpacity: number
  margin: number
  momentSize: number
  density: number
  devices: number
  bar: boolean
  rotate: boolean
  name: string
  code: string
  slogan: string
}

export const DEFAULT_CONFIG: BrandConfig = {
  version: 1,
  seed: 137,
  mode: 'name-code',
  aspect: 'hero',
  ground: 'paper',
  paper: 0,
  spot: 0,
  fluoro: 2,
  fluoroOn: true,
  family: 'geist',
  frameWeight: 300,
  momentWeight: 900,
  momentTracking: -0.05,
  scale: 14,
  columns: 12,
  gridOpacity: 0.08,
  margin: 0.045,
  momentSize: 0.35,
  density: 0.4,
  devices: 2,
  bar: false,
  rotate: true,
  name: 'miles roxas',
  code: 'MR–16',
  slogan: '',
}

type Range = {
  kind: 'range'
  key: keyof BrandConfig
  label: string
  min: number
  max: number
  step: number
}
type Select = {
  kind: 'select'
  key: keyof BrandConfig
  label: string
  options: readonly { value: string | number; label: string }[]
}
type Toggle = { kind: 'toggle'; key: keyof BrandConfig; label: string }
type Text = { kind: 'text'; key: keyof BrandConfig; label: string; placeholder?: string }
export type Knob = Range | Select | Toggle | Text

const indexed = (items: readonly { name: string }[]) =>
  items.map((item, i) => ({ value: i, label: item.name }))

export const KNOB_GROUPS: { title: string; knobs: Knob[] }[] = [
  {
    title: 'composition',
    knobs: [
      {
        kind: 'select',
        key: 'aspect',
        label: 'aspect',
        options: Object.keys(ASPECTS).map((a) => ({ value: a, label: a })),
      },
      {
        kind: 'select',
        key: 'ground',
        label: 'ground',
        options: GROUNDS.map((g) => ({ value: g, label: g })),
      },
      { kind: 'select', key: 'paper', label: 'paper', options: indexed(PAPERS) },
      { kind: 'range', key: 'columns', label: 'columns', min: 4, max: 16, step: 1 },
      { kind: 'range', key: 'gridOpacity', label: 'grid', min: 0, max: 0.3, step: 0.01 },
      { kind: 'range', key: 'margin', label: 'margin', min: 0.025, max: 0.08, step: 0.005 },
    ],
  },
  {
    title: 'colour',
    knobs: [
      { kind: 'select', key: 'spot', label: 'spot', options: indexed(SPOTS) },
      { kind: 'select', key: 'fluoro', label: 'fluoro', options: indexed(FLUOROS) },
      { kind: 'toggle', key: 'fluoroOn', label: 'fluoro on' },
    ],
  },
  {
    title: 'type',
    knobs: [
      {
        kind: 'select',
        key: 'family',
        label: 'family',
        options: (Object.keys(FAMILIES) as Family[]).map((f) => ({
          value: f,
          label: FAMILIES[f].label,
        })),
      },
      { kind: 'range', key: 'frameWeight', label: 'frame weight', min: 100, max: 400, step: 50 },
      { kind: 'range', key: 'momentWeight', label: 'moment weight', min: 600, max: 900, step: 50 },
      { kind: 'range', key: 'momentTracking', label: 'tracking', min: -0.08, max: 0, step: 0.005 },
      { kind: 'range', key: 'scale', label: 'scale ×meta', min: 8, max: 24, step: 1 },
    ],
  },
  {
    title: 'moment',
    knobs: [
      { kind: 'range', key: 'momentSize', label: 'size', min: 0.15, max: 0.5, step: 0.01 },
      { kind: 'range', key: 'density', label: 'density', min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    title: 'breaks & apparatus',
    knobs: [
      { kind: 'range', key: 'devices', label: 'devices', min: 0, max: 3, step: 1 },
      { kind: 'toggle', key: 'bar', label: 'full-bleed bar' },
      { kind: 'toggle', key: 'rotate', label: '90° label' },
    ],
  },
  {
    title: 'copy',
    knobs: [
      { kind: 'text', key: 'name', label: 'name' },
      { kind: 'text', key: 'code', label: 'name code' },
      { kind: 'text', key: 'slogan', label: 'slogan', placeholder: 'empty: seeded pick' },
    ],
  },
]

const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

const oneOf = <T>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

/** Clamp any saved or hand-edited config onto the tested knob bounds. */
export function normalizeConfig(input: Partial<BrandConfig> | null | undefined): BrandConfig {
  const d = DEFAULT_CONFIG
  const c = input ?? {}
  return {
    version: 1,
    seed: clamp(c.seed, 0, 2 ** 32 - 1, d.seed) >>> 0,
    mode: oneOf(c.mode, MODES, d.mode),
    aspect: oneOf(c.aspect, Object.keys(ASPECTS) as Aspect[], d.aspect),
    ground: oneOf(c.ground, GROUNDS, d.ground),
    paper: Math.round(clamp(c.paper, 0, PAPERS.length - 1, d.paper)),
    spot: Math.round(clamp(c.spot, 0, SPOTS.length - 1, d.spot)),
    fluoro: Math.round(clamp(c.fluoro, 0, FLUOROS.length - 1, d.fluoro)),
    fluoroOn: typeof c.fluoroOn === 'boolean' ? c.fluoroOn : d.fluoroOn,
    family: oneOf(c.family, Object.keys(FAMILIES) as Family[], d.family),
    frameWeight: clamp(c.frameWeight, 100, 400, d.frameWeight),
    momentWeight: clamp(c.momentWeight, 600, 900, d.momentWeight),
    momentTracking: clamp(c.momentTracking, -0.08, 0, d.momentTracking),
    scale: clamp(c.scale, 8, 24, d.scale),
    columns: Math.round(clamp(c.columns, 4, 16, d.columns)),
    gridOpacity: clamp(c.gridOpacity, 0, 0.3, d.gridOpacity),
    margin: clamp(c.margin, 0.025, 0.08, d.margin),
    momentSize: clamp(c.momentSize, 0.15, 0.5, d.momentSize),
    density: clamp(c.density, 0, 1, d.density),
    devices: Math.round(clamp(c.devices, 0, 3, d.devices)),
    bar: typeof c.bar === 'boolean' ? c.bar : d.bar,
    rotate: typeof c.rotate === 'boolean' ? c.rotate : d.rotate,
    name: typeof c.name === 'string' ? c.name.slice(0, 40) : d.name,
    code: typeof c.code === 'string' ? c.code.slice(0, 12) : d.code,
    slogan: typeof c.slogan === 'string' ? c.slogan.slice(0, 60) : d.slogan,
  }
}
