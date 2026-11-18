/** Closed-palette tokens (miles-visual-brand). Papers mirror the brand lab's list. */
export const PAPERS = [
  { name: 'te white', hex: '#f5f5f5' },
  { name: 'newsprint', hex: '#efece4' },
  { name: 'bright', hex: '#fbfbfa' },
] as const

export const SHAPES = ['mixed', 'plus', 'square', 'dash', 'glyph'] as const
export type Shape = (typeof SHAPES)[number]

/** How `mixed` deals plus and square out to the cells. */
export const MIXES = ['zone', 'value', 'random'] as const
export type Mix = (typeof MIXES)[number]

export const FILLS = ['outline', 'solid'] as const
export type Fill = (typeof FILLS)[number]

export const CURSORS = ['reticle', 'invert', 'bloom'] as const
export type Cursor = (typeof CURSORS)[number]

export const YELLOWS = ['readout', 'cell', 'none'] as const
export type Yellow = (typeof YELLOWS)[number]

export const SHADER_GROUNDS = ['paper', 'ink'] as const
export type ShaderGround = (typeof SHADER_GROUNDS)[number]

export const SHADER_COLORS = {
  ink: '#0f0e12',
  spot: '#f05a24',
  fluoro: '#ffe900',
} as const

export type ShaderConfig = {
  kind: 'shader'
  version: 1
  seed: number
  ground: ShaderGround
  paper: number
  cell: number
  shape: Shape
  mix: Mix
  fill: Fill
  markSize: number
  stroke: number
  tone: number
  levels: number
  dither: boolean
  threshold: number
  noiseScale: number
  speed: number
  warp: number
  scan: boolean
  scanPeriod: number
  scanHeight: number
  glitch: number
  glitchRate: number
  cursor: Cursor
  radius: number
  rings: number
  ease: number
  follow: number
  crosshair: boolean
  spotCore: boolean
  ripple: boolean
  rippleRound: boolean
  rippleSpeed: number
  wavelength: number
  rippleRings: number
  rippleDecay: number
  rippleFalloff: number
  aimLock: boolean
  lockMs: number
  spread: number
  recoil: number
  reticle: number
  hideCursor: boolean
  yellow: Yellow
  dpr: number
  overlay: boolean
}

export const DEFAULT_SHADER: ShaderConfig = {
  kind: 'shader',
  version: 1,
  seed: 803,
  ground: 'paper',
  paper: 0,
  cell: 12,
  shape: 'mixed',
  mix: 'zone',
  fill: 'solid',
  markSize: 0.35,
  stroke: 1,
  tone: 0.16,
  levels: 4,
  dither: true,
  threshold: 0.4,
  noiseScale: 2.2,
  speed: 0.04,
  warp: 0.8,
  scan: true,
  scanPeriod: 16,
  scanHeight: 2,
  glitch: 0.15,
  glitchRate: 0.5,
  cursor: 'reticle',
  radius: 3,
  rings: 2,
  ease: 380,
  follow: 90,
  crosshair: true,
  spotCore: true,
  ripple: true,
  rippleRound: true,
  rippleSpeed: 480,
  wavelength: 4,
  rippleRings: 4,
  rippleDecay: 1.4,
  rippleFalloff: 0.03,
  aimLock: true,
  lockMs: 140,
  spread: 8,
  recoil: 5,
  reticle: 4,
  hideCursor: true,
  yellow: 'readout',
  dpr: 1.5,
  overlay: true,
}

const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

const oneOf = <T>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

/** Clamp any saved or hand-edited config onto the tested knob bounds. */
export function normalizeShader(input: Partial<ShaderConfig> | null | undefined): ShaderConfig {
  const d = DEFAULT_SHADER
  const c = input ?? {}
  const int = (v: unknown, min: number, max: number, f: number) => Math.round(clamp(v, min, max, f))
  return {
    kind: 'shader',
    version: 1,
    seed: clamp(c.seed, 0, 2 ** 32 - 1, d.seed) >>> 0,
    ground: oneOf(c.ground, SHADER_GROUNDS, d.ground),
    paper: int(c.paper, 0, PAPERS.length - 1, d.paper),
    cell: int(c.cell, 8, 40, d.cell),
    shape: oneOf(c.shape, SHAPES, d.shape),
    mix: oneOf(c.mix, MIXES, d.mix),
    fill: oneOf(c.fill, FILLS, d.fill),
    markSize: clamp(c.markSize, 0.15, 1, d.markSize),
    stroke: clamp(c.stroke, 1, 4, d.stroke),
    tone: clamp(c.tone, 0.04, 0.6, d.tone),
    levels: int(c.levels, 2, 8, d.levels),
    dither: bool(c.dither, d.dither),
    threshold: clamp(c.threshold, 0, 0.9, d.threshold),
    noiseScale: clamp(c.noiseScale, 0.5, 8, d.noiseScale),
    speed: clamp(c.speed, 0, 0.3, d.speed),
    warp: clamp(c.warp, 0, 2, d.warp),
    scan: bool(c.scan, d.scan),
    scanPeriod: clamp(c.scanPeriod, 4, 40, d.scanPeriod),
    scanHeight: int(c.scanHeight, 1, 12, d.scanHeight),
    glitch: clamp(c.glitch, 0, 1, d.glitch),
    glitchRate: clamp(c.glitchRate, 0.1, 4, d.glitchRate),
    cursor: oneOf(c.cursor, CURSORS, d.cursor),
    radius: int(c.radius, 1, 20, d.radius),
    rings: int(c.rings, 1, 6, d.rings),
    ease: clamp(c.ease, 100, 1200, d.ease),
    follow: clamp(c.follow, 0, 400, d.follow),
    crosshair: bool(c.crosshair, d.crosshair),
    spotCore: bool(c.spotCore, d.spotCore),
    ripple: bool(c.ripple, d.ripple),
    rippleRound: bool(c.rippleRound, d.rippleRound),
    rippleSpeed: clamp(c.rippleSpeed, 200, 1600, d.rippleSpeed),
    wavelength: int(c.wavelength, 2, 12, d.wavelength),
    rippleRings: int(c.rippleRings, 1, 8, d.rippleRings),
    rippleDecay: clamp(c.rippleDecay, 0.3, 3, d.rippleDecay),
    rippleFalloff: clamp(c.rippleFalloff, 0, 0.3, d.rippleFalloff),
    aimLock: bool(c.aimLock, d.aimLock),
    lockMs: clamp(c.lockMs, 40, 600, d.lockMs),
    spread: clamp(c.spread, 0, 40, d.spread),
    recoil: clamp(c.recoil, 0, 30, d.recoil),
    reticle: clamp(c.reticle, 2, 16, d.reticle),
    hideCursor: bool(c.hideCursor, d.hideCursor),
    yellow: oneOf(c.yellow, YELLOWS, d.yellow),
    dpr: clamp(c.dpr, 1, 2, d.dpr),
    overlay: bool(c.overlay, d.overlay),
  }
}
