import {
  CURSORS,
  FILLS,
  MIXES,
  SHADER_GROUNDS,
  SHAPES,
  type ShaderConfig,
  YELLOWS,
} from '@/features/aim-field/config'
import { PAPERS } from '../config'

export * from '@/features/aim-field/config'

type Key = keyof ShaderConfig
type Range = { kind: 'range'; key: Key; label: string; min: number; max: number; step: number }
type Select = {
  kind: 'select'
  key: Key
  label: string
  options: readonly { value: string | number; label: string }[]
}
type Toggle = { kind: 'toggle'; key: Key; label: string }
export type ShaderKnob = Range | Select | Toggle

const list = (items: readonly string[]) => items.map((v) => ({ value: v, label: v }))

export const SHADER_KNOBS: { title: string; knobs: ShaderKnob[] }[] = [
  {
    title: 'ground',
    knobs: [
      { kind: 'select', key: 'ground', label: 'ground', options: list(SHADER_GROUNDS) },
      {
        kind: 'select',
        key: 'paper',
        label: 'paper',
        options: PAPERS.map((p, i) => ({ value: i, label: p.name })),
      },
      { kind: 'toggle', key: 'overlay', label: 'page on top' },
    ],
  },
  {
    title: 'lattice',
    knobs: [
      { kind: 'range', key: 'cell', label: 'cell px', min: 8, max: 40, step: 1 },
      { kind: 'select', key: 'shape', label: 'mark', options: list(SHAPES) },
      { kind: 'select', key: 'mix', label: 'mixed by', options: list(MIXES) },
      { kind: 'select', key: 'fill', label: 'fill', options: list(FILLS) },
      { kind: 'range', key: 'markSize', label: 'mark size', min: 0.15, max: 1, step: 0.05 },
      { kind: 'range', key: 'stroke', label: 'stroke px', min: 1, max: 4, step: 0.5 },
      { kind: 'range', key: 'tone', label: 'tone', min: 0.04, max: 0.6, step: 0.01 },
      { kind: 'range', key: 'levels', label: 'levels', min: 2, max: 8, step: 1 },
      { kind: 'toggle', key: 'dither', label: 'bayer dither' },
    ],
  },
  {
    title: 'field',
    knobs: [
      { kind: 'range', key: 'threshold', label: 'threshold', min: 0, max: 0.9, step: 0.01 },
      { kind: 'range', key: 'noiseScale', label: 'scale', min: 0.5, max: 8, step: 0.1 },
      { kind: 'range', key: 'warp', label: 'warp', min: 0, max: 2, step: 0.05 },
      { kind: 'range', key: 'speed', label: 'drift', min: 0, max: 0.3, step: 0.005 },
    ],
  },
  {
    title: 'scan & glitch',
    knobs: [
      { kind: 'toggle', key: 'scan', label: 'scan band' },
      { kind: 'range', key: 'scanPeriod', label: 'sweep s', min: 4, max: 40, step: 1 },
      { kind: 'range', key: 'scanHeight', label: 'band cells', min: 1, max: 12, step: 1 },
      { kind: 'range', key: 'glitch', label: 'glitch', min: 0, max: 1, step: 0.05 },
      { kind: 'range', key: 'glitchRate', label: 'glitch hz', min: 0.1, max: 4, step: 0.1 },
    ],
  },
  {
    title: 'hover (the moment)',
    knobs: [
      { kind: 'select', key: 'cursor', label: 'cursor', options: list(CURSORS) },
      { kind: 'range', key: 'radius', label: 'radius cells', min: 1, max: 20, step: 1 },
      { kind: 'range', key: 'rings', label: 'rings', min: 1, max: 6, step: 1 },
      { kind: 'range', key: 'ease', label: 'ease ms', min: 100, max: 1200, step: 10 },
      { kind: 'range', key: 'follow', label: 'follow ms', min: 0, max: 400, step: 10 },
      { kind: 'toggle', key: 'crosshair', label: 'crosshair' },
      { kind: 'toggle', key: 'spotCore', label: 'orange core' },
      { kind: 'select', key: 'yellow', label: 'yellow', options: list(YELLOWS) },
    ],
  },
  {
    title: 'aim',
    knobs: [
      { kind: 'toggle', key: 'aimLock', label: 'lock on content' },
      { kind: 'range', key: 'lockMs', label: 'lock ms', min: 40, max: 600, step: 10 },
      { kind: 'range', key: 'reticle', label: 'reticle px', min: 2, max: 16, step: 1 },
      { kind: 'range', key: 'spread', label: 'move spread px', min: 0, max: 40, step: 1 },
      { kind: 'range', key: 'recoil', label: 'recoil px', min: 0, max: 30, step: 1 },
      { kind: 'toggle', key: 'hideCursor', label: 'hide os cursor' },
    ],
  },
  {
    title: 'click ripple',
    knobs: [
      { kind: 'toggle', key: 'ripple', label: 'ripple' },
      { kind: 'toggle', key: 'rippleRound', label: 'round (off: square)' },
      { kind: 'range', key: 'rippleSpeed', label: 'speed px/s', min: 200, max: 1600, step: 20 },
      { kind: 'range', key: 'wavelength', label: 'wavelength', min: 2, max: 12, step: 1 },
      { kind: 'range', key: 'rippleRings', label: 'rings', min: 1, max: 8, step: 1 },
      { kind: 'range', key: 'rippleDecay', label: 'decay s', min: 0.3, max: 3, step: 0.1 },
      { kind: 'range', key: 'rippleFalloff', label: 'falloff', min: 0, max: 0.3, step: 0.01 },
    ],
  },
  {
    title: 'cost',
    knobs: [{ kind: 'range', key: 'dpr', label: 'max dpr', min: 1, max: 2, step: 0.5 }],
  },
]
