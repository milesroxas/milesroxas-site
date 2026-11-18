/**
 * Background field: a quantized mark lattice (tDR halftone, Marathon data-grid)
 * with one bounded hover region as the view's moment. Every output pixel is a
 * closed-palette token or a solid ground-to-foreground step: no blending, no AA.
 * The cursor is an aiming device: a reticle layer above the content that locks
 * onto text lines, media and controls, and clears the field under the lock.
 */
import { CURSORS, FILLS, MIXES, PAPERS, SHADER_COLORS, SHAPES, type ShaderConfig } from './config'

const RIPPLES = 6

const ACT = 'a[href], button, input, select, textarea, summary, [role="button"], [data-aim="act"]'
const MEDIA = 'img, picture, video, svg, figure, [data-aim="media"]'
const TEXT =
  'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, label, dt, dd, [data-aim="text"]'

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec3 uPointer;
uniform vec2 uAim;
uniform float uR;
uniform vec4 uBox;
uniform float uLocked;
uniform vec3 uRipple[${RIPPLES}];
uniform vec3 uGround;
uniform vec3 uFg;
uniform vec3 uSpot;
uniform vec3 uFluoro;
uniform float uCell;
uniform int uShape;
uniform int uMix;
uniform int uFill;
uniform float uMarkSize;
uniform float uStroke;
uniform float uTone;
uniform float uLevels;
uniform float uDither;
uniform float uThreshold;
uniform float uNoiseScale;
uniform float uSpeed;
uniform float uWarp;
uniform float uScan;
uniform float uScanPeriod;
uniform float uScanHeight;
uniform float uGlitch;
uniform float uGlitchRate;
uniform int uCursor;
uniform float uRings;
uniform float uCrosshair;
uniform float uSpotCore;
uniform float uRippleSpeed;
uniform float uWave;
uniform float uRippleRings;
uniform float uRippleDecay;
uniform float uRippleFalloff;
uniform float uRippleRound;
uniform float uYellowCell;
uniform float uSeed;

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash(i), hash(i + vec3(1, 0, 0)), f.x);
  float b = mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x);
  float c = mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x);
  float d = mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x);
  return mix(mix(a, b, f.y), mix(c, d, f.y), f.z);
}

float fbm(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(17.1, 9.2, 3.3);
    a *= 0.5;
  }
  return s / 0.9375;
}

float bayer4(vec2 c) {
  ivec2 p = ivec2(mod(c, 4.0));
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[p.x + p.y * 4]) + 0.5) / 16.0;
}

float cheb(vec2 a, vec2 b) {
  vec2 d = abs(a - b);
  return max(d.x, d.y);
}

// 1 plus, 2 square, 3 dash, 4 glyph; mixed deals plus and square
int shapeFor(vec2 cid, float q, vec2 uv) {
  if (uShape != 0) return uShape;
  if (uMix == 1) return q > 0.5 ? 2 : 1;
  if (uMix == 2) return hash(vec3(cid, uSeed + 4.0)) < 0.5 ? 1 : 2;
  float z = fbm(vec3(uv * 0.45 + 11.0, uTime * uSpeed * 0.3 + uSeed));
  return z < 0.5 ? 1 : 2;
}

bool mark(vec2 lp, float q, vec2 cid, int shape) {
  if (q <= 0.0) return false;
  float s = q * uMarkSize * 0.5;
  float th = max(uStroke * uDpr * 0.5 / uCell, 0.5 / uCell);
  bool solid = uFill == 1;
  if (shape == 1) {
    return (abs(lp.x) < th && abs(lp.y) < s) || (abs(lp.y) < th && abs(lp.x) < s);
  }
  if (shape == 2) {
    float d = max(abs(lp.x), abs(lp.y)) - s * 0.85;
    return solid ? d < 0.0 : abs(d) < th;
  }
  if (shape == 3) {
    float x0 = -uMarkSize * 0.5;
    return lp.x > x0 && lp.x < x0 + q * uMarkSize && abs(lp.y) < th;
  }
  vec2 g = lp / uMarkSize + 0.5;
  if (any(lessThan(g, vec2(0.0))) || any(greaterThanEqual(g, vec2(1.0)))) return false;
  vec2 bits = g * vec2(3.0, 5.0);
  vec2 f = fract(bits);
  if (f.x > 0.78 || f.y > 0.72) return false;
  vec2 b = floor(bits);
  float slot = floor(uTime * 0.35 + hash(vec3(cid, 7.0)) * 8.0);
  return hash(vec3(cid.x * 1.7 + b.x * 13.1, cid.y * 1.7 + b.y * 7.7 + slot, uSeed)) < q;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cid = floor(p / uCell);
  vec2 lp = fract(p / uCell) - 0.5;
  float px = 1.0 / uCell;
  float step1 = 1.0 / uLevels;
  float dith = uDither > 0.5 ? bayer4(cid) : 0.5;

  bool inBox = p.x >= uBox.x && p.x <= uBox.z && p.y >= uBox.y && p.y <= uBox.w;
  if (uLocked > 0.5 && inBox) {
    outColor = vec4(uGround, 1.0);
    return;
  }

  vec2 sid = cid;
  if (uGlitch > 0.0) {
    float rows = 1.0 + floor(hash(vec3(uSeed, 3.0, 1.0)) * 4.0);
    float band = floor(cid.y / rows);
    float slot = floor(uTime * uGlitchRate);
    if (hash(vec3(band, slot, uSeed)) < uGlitch * 0.2) {
      sid.x += floor((hash(vec3(band, slot, uSeed + 9.0)) - 0.5) * 16.0);
    }
  }

  vec2 uv = (sid + 0.5) * uCell / uRes.y * uNoiseScale + uSeed * 0.013;
  float t = uTime * uSpeed;
  vec2 w = vec2(fbm(vec3(uv, t)), fbm(vec3(uv + 5.2, t + 1.3))) - 0.5;
  float v = fbm(vec3(uv + uWarp * w * 2.0, t * 0.7 + 3.0));
  v = clamp((v - 0.5) * 1.9 + 0.5, 0.0, 1.0);
  float n = clamp((v - uThreshold) / max(1.0 - uThreshold, 0.001), 0.0, 1.0);
  float q = n <= 0.0 ? 0.0 : clamp(floor(n * uLevels + dith) / uLevels, 0.0, 1.0);
  int shape = shapeFor(sid, q, uv);

  vec3 bg = uGround;
  vec3 ink = mix(uGround, uFg, uTone);
  vec3 lineTone = mix(uGround, uFg, min(1.0, uTone * 2.5));
  bool line = false;

  if (uScan > 0.5) {
    float rows = uRes.y / uCell;
    float head = floor(fract(uTime / uScanPeriod) * (rows + uScanHeight + 2.0)) - uScanHeight;
    if (cid.y >= head && cid.y < head + uScanHeight) {
      q = max(q, step1);
      ink = lineTone;
    }
    if (cid.y == head + uScanHeight && lp.y < -0.5 + px * uDpr) line = true;
  }

  float strength = uPointer.z;
  vec2 pc = floor(uPointer.xy / uCell);
  float d = cheb(cid, pc);
  bool inside = uLocked < 0.5 && strength > 0.01 && uR >= 1.0 && d <= uR;

  if (inside) {
    float ring = floor(d / (uR + 1.0) * uRings);
    float cq = 1.0 - ring / uRings;
    if (uCursor == 0) {
      q = max(q, cq);
      ink = uFg;
    } else if (uCursor == 1) {
      bg = uFg;
      ink = uGround;
    } else {
      q = max(q, cq);
      ink = ring >= uRings - 1.0 ? lineTone : uFg;
    }
    if (uSpotCore > 0.5 && d <= 1.0) {
      ink = uSpot;
      q = max(q, cq);
    }
  }

  // Damped ripple: a packet of rings behind the front, fading with time,
  // distance and ring order, quantized and dithered so it breaks up as it dies.
  float rippleQ = 0.0;
  float rippleRing = 0.0;
  for (int k = 0; k < ${RIPPLES}; k++) {
    vec3 rp = uRipple[k];
    if (rp.z < 0.0) continue;
    vec2 dc = cid + 0.5 - rp.xy / uCell;
    float dist = uRippleRound > 0.5 ? length(dc) : max(abs(dc.x), abs(dc.y));
    float front = rp.z * uRippleSpeed * uDpr / uCell;
    float behind = front - dist;
    if (behind < 0.0 || behind >= uRippleRings * uWave) continue;
    if (mod(behind, uWave) >= 1.0) continue;
    float order = floor(behind / uWave);
    float amp = exp(-rp.z / uRippleDecay) / (1.0 + dist * uRippleFalloff);
    amp *= 1.0 - order / uRippleRings;
    float rq = clamp(floor(amp * uLevels + dith) / uLevels, 0.0, 1.0);
    if (rq > rippleQ) {
      rippleQ = rq;
      rippleRing = order;
    }
  }
  if (rippleQ > 0.0) {
    q = max(q, rippleQ);
    ink = rippleRing == 0.0 && rippleQ >= 0.5 ? uSpot : rippleQ >= 0.5 ? uFg : lineTone;
  }

  vec3 col = mark(lp, q, cid, shape) ? ink : bg;
  if (line) col = lineTone;

  if (uCrosshair > 0.5 && strength > 0.01) {
    vec2 dl = abs(p - uAim);
    float th = max(uStroke * uDpr * 0.5, 0.5);
    vec2 bc = (uBox.xy + uBox.zw) * 0.5;
    vec2 gap = (uBox.zw - uBox.xy) * 0.5 + uCell;
    bool outside = abs(p.x - bc.x) > gap.x || abs(p.y - bc.y) > gap.y;
    if (outside && (dl.x < th || dl.y < th)) col = lineTone;
  }

  if (uYellowCell > 0.5 && uLocked < 0.5 && strength > 0.5 && cid == pc) {
    if (max(abs(lp.x), abs(lp.y)) < uMarkSize * 0.5) col = uFluoro;
  }

  outColor = vec4(col, 1.0);
}`

type Rgb = [number, number, number]

const rgb = (hex: string): Rgb => {
  const n = Number.parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const hex = ([r, g, b]: Rgb) =>
  `#${[r, g, b]
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

/** Any CSS colour (oklch, lab, var-resolved) to sRGB, via a 1px 2D canvas. */
function cssToRgb(color: string, probe: CanvasRenderingContext2D): Rgb | null {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = '#000'
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
  if (!a) return null
  return [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255]
}

export type AimTarget = 'free' | 'text' | 'media' | 'act'
export type FieldPointer = {
  x: number
  y: number
  cellX: number
  cellY: number
  inside: boolean
  target: AimTarget
}

export type FieldHandle = {
  update: (config: ShaderConfig) => void
  destroy: () => void
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader: createShader failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`shader: ${gl.getShaderInfoLog(shader)}`)
  }
  return shader
}

type Rect = { x0: number; y0: number; x1: number; y1: number }
type Lock = { kind: Exclude<AimTarget, 'free'>; rect: () => DOMRect }

/** The line box of text under the point, or null between lines. */
function textLine(el: Element, x: number, y: number): DOMRect | null {
  const range = document.createRange()
  range.selectNodeContents(el)
  let hit: Rect | null = null
  for (const r of Array.from(range.getClientRects())) {
    if (r.width === 0 || y < r.top || y > r.bottom) continue
    hit = hit
      ? {
          x0: Math.min(hit.x0, r.left),
          y0: Math.min(hit.y0, r.top),
          x1: Math.max(hit.x1, r.right),
          y1: Math.max(hit.y1, r.bottom),
        }
      : { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }
  }
  if (!hit || x < hit.x0 - 8 || x > hit.x1 + 8) return null
  return new DOMRect(hit.x0, hit.y0, hit.x1 - hit.x0, hit.y1 - hit.y0)
}

/** What the aim is over: a live rect in client px, or null for free aim. */
function acquire(x: number, y: number, canvas: HTMLCanvasElement): Lock | null {
  const hit = document.elementFromPoint(x, y)
  if (!hit || hit === canvas || hit.closest('[data-aim="off"]')) return null
  const act = hit.closest(ACT)
  if (act) return { kind: 'act', rect: () => act.getBoundingClientRect() }
  const media = hit.closest(MEDIA)
  if (media) return { kind: 'media', rect: () => media.getBoundingClientRect() }
  const text = hit.closest(TEXT)
  if (!text) return null
  const line = textLine(text, x, y)
  if (!line) return null
  // Keep the line pinned to its element when the page scrolls under the lock.
  const anchor = text.getBoundingClientRect()
  const dx = line.x - anchor.x
  const dy = line.y - anchor.y
  return {
    kind: 'text',
    rect: () => {
      const now = text.getBoundingClientRect()
      return new DOMRect(now.x + dx, now.y + dy, line.width, line.height)
    },
  }
}

/** The reticle: plain DOM above the content, so it reads over text and images. */
function mountReticle(root: HTMLElement) {
  const make = (css: string) => {
    const el = document.createElement('div')
    el.style.cssText = `position:absolute;left:0;top:0;transform-origin:0 0;${css}`
    root.appendChild(el)
    return el
  }
  root.style.pointerEvents = 'none'
  const corners = [0, 1, 2, 3].map(() => make('border-style:solid;border-width:0;'))
  const ticks = [0, 1, 2, 3].map(() => make(''))
  const hits = [0, 1, 2, 3].map(() => make(''))
  const dot = make('')
  return {
    root,
    corners,
    ticks,
    hits,
    dot,
    destroy() {
      root.replaceChildren()
    },
  }
}

const CORNER_SIDES = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
] as const

/** Mounts the field on a canvas. Pointer input is read from the window, so content can sit on top. */
export function createShaderField(
  canvas: HTMLCanvasElement,
  initial: ShaderConfig,
  options: {
    reticle?: HTMLElement | null
    onPointer?: (pointer: FieldPointer) => void
    /** Paint with this element's background and text colour (theme-aware) instead of the config's ground. */
    palette?: HTMLElement | null
  } = {},
): FieldHandle | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  })
  if (!gl) return null

  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`shader: ${gl.getProgramInfoLog(program)}`)
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
  gl.useProgram(program)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const loc = new Map<string, WebGLUniformLocation | null>()
  const u = (name: string) => {
    if (!loc.has(name)) loc.set(name, gl.getUniformLocation(program, name))
    return loc.get(name) ?? null
  }

  const reticle = options.reticle ? mountReticle(options.reticle) : null

  let config = initial
  let dpr = 1
  let width = 0
  let height = 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

  let inherited: { ground: Rgb; fg: Rgb } | null = null
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const readPalette = () => {
    const host = options.palette
    if (!host || !probe) return
    const style = getComputedStyle(host)
    const ground = cssToRgb(style.backgroundColor, probe)
    const fg = cssToRgb(style.color, probe)
    if (ground && fg) inherited = { ground, fg }
  }
  readPalette()
  const themeWatch = new MutationObserver(readPalette)
  themeWatch.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class', 'style'],
  })

  let visible = true
  const viewport = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
  })
  viewport.observe(canvas)

  const client = { x: -1, y: -1 }
  const target = { x: 0, y: 0, on: 0 }
  const smooth = { x: 0, y: 0, on: 0 }
  const box: Rect = { x0: 0, y0: 0, x1: 0, y1: 0 }
  let boxLive = false
  let lock: Lock | null = null
  let aimDirty = true
  let speed = 0
  let gap = 0
  let kick = 0
  let pressed = false
  let hitAt = -1
  const ripples: { x: number; y: number; born: number }[] = []
  let time = 0
  let clock = 0
  let last = performance.now()
  let raf = 0

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, config.dpr)
    width = Math.max(1, Math.round(rect.width * dpr))
    height = Math.max(1, Math.round(rect.height * dpr))
    canvas.width = width
    canvas.height = height
    aimDirty = true
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  const local = (cx: number, cy: number) => {
    const rect = canvas.getBoundingClientRect()
    const x = cx - rect.left
    const y = cy - rect.top
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height }
  }

  let prevMove = { x: 0, y: 0, t: performance.now() }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    client.x = e.clientX
    client.y = e.clientY
    aimDirty = true
    const { x, y, inside } = local(e.clientX, e.clientY)
    const now = performance.now()
    const dt = Math.max(1, now - prevMove.t) / 1000
    speed = Math.max(speed, Math.hypot(x - prevMove.x, y - prevMove.y) / dt)
    prevMove = { x, y, t: now }
    target.x = x * dpr
    target.y = y * dpr
    target.on = inside ? 1 : 0
    if (smooth.on < 0.01) {
      smooth.x = target.x
      smooth.y = target.y
    }
  }
  const onDown = (e: PointerEvent) => {
    const { x, y, inside } = local(e.clientX, e.clientY)
    if (!inside) return
    pressed = true
    kick = config.recoil
    hitAt = clock
    if (!config.ripple || reduced.matches) return
    ripples.push({ x: x * dpr, y: y * dpr, born: clock })
    if (ripples.length > RIPPLES) ripples.shift()
  }
  const onUp = () => {
    pressed = false
  }
  const onLeave = () => {
    target.on = 0
    pressed = false
  }
  const onScroll = () => {
    aimDirty = true
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  window.addEventListener('blur', onLeave)

  const rippleData = new Float32Array(RIPPLES * 3)
  let lastKey = ''

  const drawReticle = (fg: string, locked: boolean) => {
    if (!reticle) return
    const show = target.on > 0
    reticle.root.style.visibility = show ? 'visible' : 'hidden'
    if (!show) return
    const stroke = config.stroke
    const x0 = box.x0 / dpr
    const y0 = box.y0 / dpr
    const x1 = box.x1 / dpr
    const y1 = box.y1 / dpr
    const arm = Math.max(3, Math.min(config.reticle * 2, Math.min(x1 - x0, y1 - y0) * 0.25))
    const showBox = x1 - x0 > 4 && y1 - y0 > 4
    const cornerColor = locked && lock?.kind === 'act' ? SHADER_COLORS.spot : fg
    reticle.corners.forEach((el, i) => {
      const [v, h] = CORNER_SIDES[i] ?? CORNER_SIDES[0]
      const cx = h === 'left' ? x0 : x1 - arm
      const cy = v === 'top' ? y0 : y1 - arm
      el.style.display = showBox ? 'block' : 'none'
      el.style.width = `${arm}px`
      el.style.height = `${arm}px`
      el.style.borderColor = cornerColor
      el.style.borderWidth = '0'
      el.style.setProperty(`border-${v}-width`, `${stroke}px`)
      el.style.setProperty(`border-${h}-width`, `${stroke}px`)
      el.style.transform = `translate(${cx}px, ${cy}px)`
    })
    const ax = target.x / dpr
    const ay = target.y / dpr
    const tick = config.reticle
    const hitOn = hitAt >= 0 && clock - hitAt < 0.16
    reticle.ticks.forEach((el, i) => {
      el.style.width = `${tick}px`
      el.style.height = `${stroke}px`
      el.style.background = fg
      el.style.transform = `translate(${ax}px, ${ay}px) rotate(${i * 90}deg) translate(${gap}px, ${-stroke / 2}px)`
    })
    reticle.hits.forEach((el, i) => {
      el.style.display = hitOn ? 'block' : 'none'
      el.style.width = `${tick}px`
      el.style.height = `${stroke}px`
      el.style.background = SHADER_COLORS.spot
      el.style.transform = `translate(${ax}px, ${ay}px) rotate(${45 + i * 90}deg) translate(${gap + 1}px, ${-stroke / 2}px)`
    })
    const ds = Math.max(2, stroke * 1.5)
    reticle.dot.style.width = `${ds}px`
    reticle.dot.style.height = `${ds}px`
    reticle.dot.style.background = hitOn ? SHADER_COLORS.spot : fg
    reticle.dot.style.transform = `translate(${ax - ds / 2}px, ${ay - ds / 2}px)`
  }

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (document.hidden || !visible) {
      last = now
      return
    }
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    clock += dt
    const still = reduced.matches
    if (!still) time += dt

    const approach = (ms: number) => (ms <= 0 || still ? 1 : 1 - Math.exp(-dt / (ms / 3000)))
    smooth.on += (target.on - smooth.on) * approach(config.ease)
    const follow = approach(config.follow)
    smooth.x += (target.x - smooth.x) * follow
    smooth.y += (target.y - smooth.y) * follow

    if (aimDirty) {
      aimDirty = false
      lock = config.aimLock && target.on > 0 ? acquire(client.x, client.y, canvas) : null
    }
    const locked = lock !== null

    const cell = Math.max(4, Math.round(config.cell * dpr))
    const cellX = Math.floor(smooth.x / cell)
    const cellY = Math.floor(smooth.y / cell)
    const r = Math.floor(config.radius * smooth.on * (pressed ? 0.6 : 1) + 0.5)

    let goal: Rect
    if (lock) {
      const rect = lock.rect()
      const origin = canvas.getBoundingClientRect()
      const pad = 4
      goal = {
        x0: (rect.left - origin.left - pad) * dpr,
        y0: (rect.top - origin.top - pad) * dpr,
        x1: (rect.right - origin.left + pad) * dpr,
        y1: (rect.bottom - origin.top + pad) * dpr,
      }
    } else {
      const cx = (cellX + 0.5) * cell
      const cy = (cellY + 0.5) * cell
      const half = r >= 1 ? (r + 1) * cell : 0
      goal = { x0: cx - half, y0: cy - half, x1: cx + half, y1: cy + half }
    }
    if (!boxLive) Object.assign(box, goal)
    boxLive = target.on > 0 || smooth.on > 0.05
    const k = approach(config.lockMs)
    box.x0 += (goal.x0 - box.x0) * k
    box.y0 += (goal.y0 - box.y0) * k
    box.x1 += (goal.x1 - box.x1) * k
    box.y1 += (goal.y1 - box.y1) * k

    speed *= Math.exp(-dt / 0.08)
    kick *= Math.exp(-dt / 0.18)
    const base = Math.max(2, config.reticle * 0.5)
    const spreadGoal = pressed
      ? base * 0.5 + kick * 0.5
      : base + Math.min(config.spread, speed * 0.02) + kick
    gap += (spreadGoal - gap) * approach(60)

    const key = `${cellX}:${cellY}:${lock?.kind ?? 'free'}`
    if (key !== lastKey) {
      lastKey = key
      options.onPointer?.({
        x: smooth.x / dpr,
        y: smooth.y / dpr,
        cellX,
        cellY,
        inside: target.on > 0,
        target: lock?.kind ?? 'free',
      })
    }

    while (ripples.length && clock - (ripples[0]?.born ?? 0) > config.rippleDecay * 4 + 2) {
      ripples.shift()
    }
    rippleData.fill(-1)
    ripples.forEach((s, i) => {
      rippleData.set([s.x, s.y, clock - s.born], i * 3)
    })

    const paper = (PAPERS[config.paper] ?? PAPERS[0]).hex
    const ground = inherited
      ? hex(inherited.ground)
      : config.ground === 'ink'
        ? SHADER_COLORS.ink
        : paper
    const fg = inherited ? hex(inherited.fg) : config.ground === 'ink' ? paper : SHADER_COLORS.ink

    gl.viewport(0, 0, width, height)
    gl.uniform2f(u('uRes'), width, height)
    gl.uniform1f(u('uDpr'), dpr)
    gl.uniform1f(u('uTime'), time + (config.seed % 997))
    gl.uniform3f(u('uPointer'), smooth.x, smooth.y, smooth.on)
    gl.uniform2f(u('uAim'), target.x, target.y)
    gl.uniform1f(u('uR'), r)
    gl.uniform4f(u('uBox'), box.x0, box.y0, box.x1, box.y1)
    gl.uniform1f(u('uLocked'), locked ? 1 : 0)
    gl.uniform3fv(u('uRipple'), rippleData)
    gl.uniform3fv(u('uGround'), rgb(ground))
    gl.uniform3fv(u('uFg'), rgb(fg))
    gl.uniform3fv(u('uSpot'), rgb(SHADER_COLORS.spot))
    gl.uniform3fv(u('uFluoro'), rgb(SHADER_COLORS.fluoro))
    gl.uniform1f(u('uCell'), cell)
    gl.uniform1i(u('uShape'), SHAPES.indexOf(config.shape))
    gl.uniform1i(u('uMix'), MIXES.indexOf(config.mix))
    gl.uniform1i(u('uFill'), FILLS.indexOf(config.fill))
    gl.uniform1f(u('uMarkSize'), config.markSize)
    gl.uniform1f(u('uStroke'), config.stroke)
    gl.uniform1f(u('uTone'), config.tone)
    gl.uniform1f(u('uLevels'), config.levels)
    gl.uniform1f(u('uDither'), config.dither ? 1 : 0)
    gl.uniform1f(u('uThreshold'), config.threshold)
    gl.uniform1f(u('uNoiseScale'), config.noiseScale)
    gl.uniform1f(u('uSpeed'), config.speed)
    gl.uniform1f(u('uWarp'), config.warp)
    gl.uniform1f(u('uScan'), config.scan && !still ? 1 : 0)
    gl.uniform1f(u('uScanPeriod'), config.scanPeriod)
    gl.uniform1f(u('uScanHeight'), config.scanHeight)
    gl.uniform1f(u('uGlitch'), still ? 0 : config.glitch)
    gl.uniform1f(u('uGlitchRate'), config.glitchRate)
    gl.uniform1i(u('uCursor'), CURSORS.indexOf(config.cursor))
    gl.uniform1f(u('uRings'), config.rings)
    gl.uniform1f(u('uCrosshair'), config.crosshair ? 1 : 0)
    gl.uniform1f(u('uSpotCore'), config.spotCore ? 1 : 0)
    gl.uniform1f(u('uRippleSpeed'), config.rippleSpeed)
    gl.uniform1f(u('uWave'), config.wavelength)
    gl.uniform1f(u('uRippleRings'), config.rippleRings)
    gl.uniform1f(u('uRippleDecay'), config.rippleDecay)
    gl.uniform1f(u('uRippleFalloff'), config.rippleFalloff)
    gl.uniform1f(u('uRippleRound'), config.rippleRound ? 1 : 0)
    gl.uniform1f(u('uYellowCell'), config.yellow === 'cell' ? 1 : 0)
    gl.uniform1f(u('uSeed'), config.seed % 9973)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    drawReticle(fg, locked)
  }
  // First frame now, so a fresh opaque canvas never shows its cleared black.
  frame(performance.now())

  return {
    update(next) {
      const dprChanged = next.dpr !== config.dpr
      config = next
      aimDirty = true
      if (dprChanged) resize()
    },
    destroy() {
      cancelAnimationFrame(raf)
      observer.disconnect()
      viewport.disconnect()
      themeWatch.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll, { capture: true })
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      reticle?.destroy()
      gl.deleteProgram(program)
      gl.deleteVertexArray(vao)
    },
  }
}
