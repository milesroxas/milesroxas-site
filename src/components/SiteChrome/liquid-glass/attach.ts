import { displacementMap, type GlassImage, type GlassOptics, highlightMap } from './optics'

/**
 * Puts the liquid glass (`optics.ts`) on one element and keeps it matched to
 * the element's size and corner.
 *
 * Every browser gets the highlight: `--glass-highlight` is an image the
 * glass material paints over its tint (globals.css, `.chrome-material`).
 * Chromium also gets the refraction: `--glass-filter` names an SVG filter
 * that pulls the backdrop through the displacement map, once per colour
 * channel at its own scale, and screens the three back together. Only
 * Chromium applies an SVG filter as a `backdrop-filter`; elsewhere the
 * material stays frosted.
 *
 * The images are drawn for the element's layout box (transforms ignored,
 * so a press or an entrance scale never redraws them), again whenever that
 * box or its corner changes, at most once a frame. A redraw that finishes
 * after a newer one started is dropped.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

/** The highlight's pixel density: crisp on 2x screens, no more. */
const HIGHLIGHT_DENSITY_MAX = 2

type UADataNavigator = Navigator & { userAgentData?: { brands: { brand: string }[] } }

/** Chromium applies SVG filters as `backdrop-filter`; Safari and Firefox do not. */
const refracts = () =>
  (navigator as UADataNavigator).userAgentData?.brands.some(({ brand }) => brand === 'Chromium') ??
  false

let host: SVGSVGElement | null = null
let serial = 0

/** The hidden SVG that holds every glass filter. */
function filterHost(): SVGSVGElement {
  if (host?.isConnected) return host
  host = document.createElementNS(SVG_NS, 'svg')
  host.setAttribute('aria-hidden', 'true')
  host.setAttribute('width', '0')
  host.setAttribute('height', '0')
  host.style.position = 'absolute'
  host.style.pointerEvents = 'none'
  document.body.append(host)
  return host
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
  return element
}

/** Keeps one colour channel, alpha untouched. */
const CHANNEL_ONLY = [
  '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
]

/**
 * The refraction filter: the map, the backdrop displaced through it once
 * per channel, each pass reduced to its own channel, and the three screened
 * back into one image.
 */
function createFilter(id: string) {
  const filter = svg('filter', {
    id,
    x: '0',
    y: '0',
    filterUnits: 'userSpaceOnUse',
    primitiveUnits: 'userSpaceOnUse',
    'color-interpolation-filters': 'sRGB',
  })
  const map = svg('feImage', { result: 'map', preserveAspectRatio: 'none', x: '0', y: '0' })
  const passes = CHANNEL_ONLY.map((values, channel) => [
    svg('feDisplacementMap', {
      in: 'SourceGraphic',
      in2: 'map',
      xChannelSelector: 'R',
      yChannelSelector: 'G',
      result: `displaced${channel}`,
    }),
    svg('feColorMatrix', {
      in: `displaced${channel}`,
      type: 'matrix',
      values,
      result: `channel${channel}`,
    }),
  ])
  filter.append(
    map,
    ...passes.flat(),
    svg('feBlend', { in: 'channel0', in2: 'channel1', mode: 'screen', result: 'rg' }),
    svg('feBlend', { in: 'rg', in2: 'channel2', mode: 'screen' }),
  )
  filterHost().append(filter)
  const displacements = passes.map(([displacement]) => displacement)

  return {
    filter,
    update(width: number, height: number, mapUrl: string, scales: number[]) {
      for (const element of [filter, map]) {
        element.setAttribute('width', String(width))
        element.setAttribute('height', String(height))
      }
      map.setAttribute('href', mapUrl)
      displacements.forEach((displacement, channel) => {
        displacement.setAttribute('scale', scales[channel].toFixed(3))
      })
    },
  }
}

/** An image as an object URL. */
async function toUrl({ columns, rows, data }: GlassImage): Promise<string> {
  const canvas = new OffscreenCanvas(columns, rows)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No 2D context for the glass')
  context.putImageData(new ImageData(new Uint8ClampedArray(data), columns, rows), 0, 0)
  return URL.createObjectURL(await canvas.convertToBlob())
}

/** Glass on `element`; returns the detach. */
export function attachLiquidGlass(element: HTMLElement, optics: GlassOptics): () => void {
  const lens = refracts() ? createFilter(`chrome-glass-${++serial}`) : null
  let urls: string[] = []
  let drawn = ''
  let latest = 0
  let frame = 0
  let size = { width: 0, height: 0 }
  let detached = false

  const draw = () => {
    frame = 0
    const { width, height } = size
    const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0
    const key = `${width}×${height}@${radius}`
    if (width < 1 || height < 1 || key === drawn) return
    drawn = key
    const run = ++latest
    const shape = { width, height, radius }
    const density = Math.min(window.devicePixelRatio || 1, HIGHLIGHT_DENSITY_MAX)
    const displacement = lens ? displacementMap(shape, optics) : null

    Promise.all([
      toUrl(highlightMap(shape, optics, density)),
      displacement ? toUrl(displacement) : null,
    ]).then(
      (next) => {
        const fresh = next.filter((url): url is string => url !== null)
        if (detached || run !== latest) {
          for (const url of fresh) URL.revokeObjectURL(url)
          return
        }
        const [highlight, map] = next
        element.style.setProperty('--glass-highlight', `url("${highlight}")`)
        if (lens && map && displacement) {
          lens.update(width, height, map, displacement.scales)
          element.style.setProperty('--glass-filter', `url(#${lens.filter.id})`)
        }
        for (const url of urls) URL.revokeObjectURL(url)
        urls = fresh
      },
      // A browser that cannot encode keeps the plain frosted material.
      () => {},
    )
  }

  const observer = new ResizeObserver(([entry]) => {
    const box = entry.borderBoxSize[0]
    size = { width: box.inlineSize, height: box.blockSize }
    if (!frame) frame = requestAnimationFrame(draw)
  })
  observer.observe(element)

  return () => {
    detached = true
    observer.disconnect()
    cancelAnimationFrame(frame)
    element.style.removeProperty('--glass-filter')
    element.style.removeProperty('--glass-highlight')
    lens?.filter.remove()
    for (const url of urls) URL.revokeObjectURL(url)
  }
}
