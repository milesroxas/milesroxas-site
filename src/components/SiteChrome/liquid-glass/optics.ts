/**
 * The chrome's liquid glass, as optics. A port of the material in Codrops'
 * "Building an Infinite Liquid Glass Grid with Three.js, WebGPU and TSL"
 * (2026-09-08): a rounded-box SDF, a superellipse bevel read as a height map,
 * normals from its slope, Snell refraction with a per-channel IOR for
 * dispersion, a fresnel-weighted environment and a rim.
 *
 * The article shades a WebGPU plane that refracts its own video texture. The
 * chrome floats over the page's DOM, which no canvas can sample, so the same
 * functions are evaluated here, once per surface size, into two images:
 *
 * - a displacement map the backdrop is refracted through
 *   (`backdrop-filter: url(#…)`, see `attach.ts`), one scale per colour
 *   channel for the dispersion;
 * - a highlight (fresnel environment and rim) drawn over the glass's tint.
 *
 * The glass is flat inside its bevel, so only a band along the edge is
 * evaluated; everything inside it is neutral. Lengths are CSS px.
 */

export type GlassOptics = {
  /** Height of the glass where the bevel has fully risen. */
  thickness: number
  /** How far in from the edge the bevel rises. */
  bevelWidth: number
  /** Superellipse exponent of the bevel: 2 is a pillow, higher a sharper shoulder. */
  bevelPower: number
  /** Index of refraction of the green tap. */
  ior: number
  /** IOR spread to the red (lower) and blue (higher) taps. */
  dispersion: number
  /** Multiplier on the refracted offset. */
  refractStrength: number
  /** Fresnel reflectance looking straight on. */
  fresnelF0: number
  /** How much of the environment the fresnel term lets through. */
  envIntensity: number
  /** Width of the rim light inside the edge. */
  rimWidth: number
  /** Rim light at the top edge; it falls to a third of this at the bottom. */
  rimIntensity: number
}

/** The dock's controls and the Ask field: a thin glass with a strong lens at the edge. */
export const GLASS_CONTROL: GlassOptics = {
  thickness: 14,
  bevelWidth: 10,
  bevelPower: 2.2,
  ior: 1.5,
  dispersion: 0.05,
  refractStrength: 1.8,
  fresnelF0: 0.04,
  envIntensity: 0.8,
  rimWidth: 1.25,
  rimIntensity: 0.85,
}

/** The Ask panel and sheet: thicker glass, a wider bevel, a quieter rim. */
export const GLASS_PANEL: GlassOptics = {
  thickness: 18,
  bevelWidth: 14,
  bevelPower: 3,
  ior: 1.5,
  dispersion: 0.04,
  refractStrength: 1.6,
  fresnelF0: 0.04,
  envIntensity: 0.6,
  rimWidth: 1.25,
  rimIntensity: 0.7,
}

type Vec3 = [number, number, number]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Distance to the edge of a rounded rectangle centred on the origin: negative inside. */
export function roundedBoxDistance(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
): number {
  const r = Math.min(radius, halfWidth, halfHeight)
  const qx = Math.abs(x) - halfWidth + r
  const qy = Math.abs(y) - halfHeight + r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
}

/** The glass's height over a point `distance` from its edge: 0 at the edge, `thickness` past the bevel. */
export function bevelHeight(distance: number, optics: GlassOptics): number {
  const edge = clamp(1 + distance / Math.max(optics.bevelWidth, 0.001), 0, 1)
  const power = Math.max(optics.bevelPower, 1)
  return Math.max(1 - edge ** power, 0) ** (1 / power) * optics.thickness
}

/** GLSL's `refract`: the incident ray `i` through the surface `n` at IOR ratio `eta`; zero past total internal reflection. */
export function refract(i: Vec3, n: Vec3, eta: number): Vec3 {
  const cos = n[0] * i[0] + n[1] * i[1] + n[2] * i[2]
  const k = 1 - eta * eta * (1 - cos * cos)
  if (k < 0) return [0, 0, 0]
  const s = eta * cos + Math.sqrt(k)
  return [eta * i[0] - s * n[0], eta * i[1] - s * n[1], eta * i[2] - s * n[2]]
}

/** Looking straight down onto the page. */
const VIEW_RAY: Vec3 = [0, 0, -1]

/** Where the refracted ray lands, in px from where it entered: the article's `ray.xy * travel`. */
function refractedOffset(normal: Vec3, ior: number, optics: GlassOptics): [number, number] {
  const ray = refract(VIEW_RAY, normal, 1 / Math.max(ior, 1.0001))
  const travel = optics.thickness / Math.max(Math.abs(ray[2]), 0.05)
  return [ray[0] * travel * optics.refractStrength, ray[1] * travel * optics.refractStrength]
}

/**
 * The red and blue taps' offsets relative to the green one. The lateral
 * shift grows with `1 - 1/ior`, so each channel's displacement scale is the
 * green scale times this ratio.
 */
export function dispersionRatios(optics: GlassOptics): [number, number, number] {
  const bend = (ior: number) => 1 - 1 / Math.max(ior, 1.0001)
  const green = bend(optics.ior)
  return [
    bend(optics.ior - optics.dispersion) / green,
    1,
    bend(optics.ior + optics.dispersion) / green,
  ]
}

type Shape = { width: number; height: number; radius: number }

/** Pixel size of an image of the shape at `density` pixels per px. */
const imageSize = (shape: Shape, density: number) => ({
  columns: Math.max(1, Math.round(shape.width * density)),
  rows: Math.max(1, Math.round(shape.height * density)),
})

/**
 * Calls `visit` for every pixel of an image of the shape (at `density`
 * pixels per px) that lies inside the edge band, with its distance to the
 * edge, the surface normal there, and how near the top it is (1 at the top
 * row, 0 at the bottom). Pixels outside the band are left to the caller's
 * neutral fill.
 */
function forEachBevelPixel(
  shape: Shape,
  optics: GlassOptics,
  density: number,
  visit: (index: number, distance: number, normal: Vec3, fromTop: number) => void,
) {
  const { columns, rows } = imageSize(shape, density)
  const halfWidth = shape.width / 2
  const halfHeight = shape.height / 2
  const band = Math.ceil((Math.max(shape.radius, optics.bevelWidth) + 2) * density)
  const step = 0.5 / density
  const height = (x: number, y: number) =>
    bevelHeight(roundedBoxDistance(x, y, halfWidth, halfHeight, shape.radius), optics)

  const pixel = (column: number, row: number) => {
    const x = (column + 0.5) / density - halfWidth
    const y = (row + 0.5) / density - halfHeight
    const distance = roundedBoxDistance(x, y, halfWidth, halfHeight, shape.radius)
    if (distance > 0 || distance < -optics.bevelWidth - 1) return
    // The slope of the height map, by central differences, is the normal.
    const dx = (height(x + step, y) - height(x - step, y)) / (2 * step)
    const dy = (height(x, y + step) - height(x, y - step)) / (2 * step)
    const length = Math.hypot(dx, dy, 1)
    const fromTop = 1 - row / Math.max(rows - 1, 1)
    visit(row * columns + column, distance, [-dx / length, -dy / length, 1 / length], fromTop)
  }

  for (let row = 0; row < rows; row++) {
    if (row < band || row >= rows - band) {
      for (let column = 0; column < columns; column++) pixel(column, row)
    } else {
      for (let column = 0; column < Math.min(band, columns); column++) pixel(column, row)
      for (let column = Math.max(band, columns - band); column < columns; column++)
        pixel(column, row)
    }
  }
}

export type GlassImage = {
  columns: number
  rows: number
  /** RGBA, row-major, not premultiplied. */
  data: Uint8ClampedArray
}

export type DisplacementMap = GlassImage & {
  /** `feDisplacementMap` scale in px for the red, green and blue channels. */
  scales: [number, number, number]
}

/**
 * The refraction as an `feDisplacementMap` input at one pixel per px: red
 * and green carry the x and y offset around 128, so a pixel samples the
 * backdrop at `scale * (channel / 255 - 0.5)` from itself.
 */
export function displacementMap(shape: Shape, optics: GlassOptics): DisplacementMap {
  const { columns, rows } = imageSize(shape, 1)
  const offsets = new Map<number, [number, number]>()
  let reach = 0
  forEachBevelPixel(shape, optics, 1, (index, _distance, normal) => {
    const offset = refractedOffset(normal, optics.ior, optics)
    offsets.set(index, offset)
    reach = Math.max(reach, Math.abs(offset[0]), Math.abs(offset[1]))
  })

  const data = new Uint8ClampedArray(columns * rows * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128
    data[i + 1] = 128
    data[i + 3] = 255
  }
  const scale = Math.max(reach * 2, 1)
  for (const [index, [x, y]] of offsets) {
    data[index * 4] = Math.round((0.5 + x / scale) * 255)
    data[index * 4 + 1] = Math.round((0.5 + y / scale) * 255)
  }
  const [red, green, blue] = dispersionRatios(optics)
  return { columns, rows, data, scales: [scale * red, scale * green, scale * blue] }
}

/**
 * The light on the glass as white with alpha, at `density` pixels per px:
 * the environment the fresnel term reflects at the bevel (a studio sky,
 * bright overhead, dim below, since the page has no environment map) and
 * the rim, brighter along the top edge. Flat glass reflects nothing extra:
 * the tint already stands for its base reflectance.
 */
export function highlightMap(shape: Shape, optics: GlassOptics, density: number): GlassImage {
  const { columns, rows } = imageSize(shape, density)
  const data = new Uint8ClampedArray(columns * rows * 4)
  forEachBevelPixel(shape, optics, density, (index, distance, normal, fromTop) => {
    // How much more than straight-on the fresnel term reflects here.
    const grazing = (1 - clamp(normal[2], 0, 1)) ** 5
    const fresnel = optics.fresnelF0 + (1 - optics.fresnelF0) * grazing
    const reflected = (fresnel - optics.fresnelF0) / (1 - optics.fresnelF0)
    // The reflected ray's heading in the page plane: up (screen -y) sees the sky.
    const up = -normal[1] / Math.max(Math.hypot(normal[0], normal[1]), 1e-4)
    const sky = 0.25 + 0.75 * (0.5 + 0.5 * up)
    const environment = clamp(reflected * optics.envIntensity * sky, 0, 1)
    const rim =
      smoothstep(-optics.rimWidth, 0, distance) * optics.rimIntensity * (1 / 3 + (2 / 3) * fromTop)
    const alpha = 1 - (1 - environment) * (1 - clamp(rim, 0, 1))
    data[index * 4] = 255
    data[index * 4 + 1] = 255
    data[index * 4 + 2] = 255
    data[index * 4 + 3] = Math.round(alpha * 255)
  })
  return { columns, rows, data }
}
