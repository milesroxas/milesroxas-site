/**
 * The plate's transition: the next picture sweeps in through an ordered
 * (Bayer 8x8) dither. A soft band, `uBand` of the frame deep and warped by
 * low noise so its edge is not a ruler line, travels down the plate when the
 * pointer moves down the list and up when it moves up (`uDirection`). Inside
 * the band each `uCell`-pixel cell flips to the new picture once the band's
 * local progress passes its dither threshold, so the pictures never blend.
 * `uKey` lets the arriving picture's highlights flip first, so it develops
 * out of its own light rather than in a flat wipe.
 *
 * Chromatic aberration rides the band: red and blue pull apart radially,
 * strongest mid-band and faintly across the frame while the sweep runs, and
 * gone at rest. The leaving picture drifts slightly larger and the arriving
 * one settles from `uSettle` scale, so the change has depth.
 *
 * With a bleed (`uBleed`, CSS pixels of canvas past each side of the frame)
 * the frame's own edge joins in: while the sweep runs it frays through a
 * second dither, `uEdge` pixels deep at its peak, eroding inwards and
 * spilling the picture's mirrored edge outwards, and at rest it is the
 * frame's straight edge again. With `uTone`, each cell prints as one-bit
 * halftone in the page's ink (`uInk`) for a moment as it flips, and that share
 * of the rim's cells too, their paper cells left clear so the page shows.
 *
 * Pictures are fitted like `object-fit: cover`: `uFromCover` and `uToCover`
 * scale the UV about its center. A snapshot (`uFromRaw`) is already the
 * whole canvas and is sampled as it stands.
 */

export const PLATE_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const PLATE_FRAGMENT = /* glsl */ `
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromCover;
uniform vec2 uToCover;
uniform float uFromRaw;
uniform float uProgress;
uniform float uDirection;
uniform float uAspect;
uniform float uBand;
uniform float uWarp;
uniform float uCell;
uniform float uAberration;
uniform float uSettle;
uniform float uDrift;
uniform vec2 uCanvas;
uniform float uBleed;
uniform float uEdge;
uniform float uTone;
uniform float uKey;
uniform vec3 uInk;
uniform vec3 uPaper;

varying vec2 vUv;

const vec3 LUMA = vec3(0.299, 0.587, 0.114);

vec2 cover(vec2 uv, vec2 scale) {
  return (uv - 0.5) * scale + 0.5;
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

// Signed distance to a box of half-size b centred on the origin; negative inside.
float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Red and blue sampled apart along shift, green in place.
vec3 split(sampler2D tex, vec2 uv, vec2 shift) {
  return vec3(texture2D(tex, uv + shift).r, texture2D(tex, uv).g, texture2D(tex, uv - shift).b);
}

void main() {
  vec2 px = vUv * uCanvas;
  vec2 frame = uCanvas - 2.0 * uBleed;
  vec2 fuv = (px - uBleed) / frame;
  // Mirrored past the frame, so a spill repeats the picture's edge.
  vec2 uv = 1.0 - abs(1.0 - abs(fuv));
  vec2 cell = gl_FragCoord.xy / uCell;

  // 0 where the sweep starts, 1 where it ends.
  float along = uDirection > 0.0 ? 1.0 - uv.y : uv.y;
  float warp = noise(uv * vec2(uAspect, 1.0) * 2.0) - 0.5;
  float field = clamp(along + warp * uWarp, 0.0, 1.0);

  // Stretched past both ends so 0 and 1 show one picture whole.
  float front = uProgress * (1.0 + uBand);
  float local = clamp((front - field) / uBand, 0.0, 1.0);

  float inBand = 4.0 * local * (1.0 - local);
  float running = sin(3.14159265 * uProgress);
  vec2 shift = (uv - 0.5) * uAberration * (inBand + 0.2 * running);

  float leaving = 1.0 + uDrift * uProgress;
  float arriving = mix(uSettle, 1.0, uProgress);
  vec3 from = uFromRaw > 0.5
    ? texture2D(uFrom, vUv).rgb
    : split(uFrom, cover(uv, uFromCover / leaving), shift);
  vec3 to = split(uTo, cover(uv, uToCover / arriving), shift);

  float threshold = bayer8(cell);
  float keyed = clamp(threshold + (0.5 - dot(to, LUMA)) * uKey, 0.0, 1.0);
  vec3 color = local > keyed ? to : from;

  // The frame's edge: straight at rest, frayed while the sweep runs.
  float depth = box(px - 0.5 * uCanvas, 0.5 * frame);
  float fray = uEdge * running;
  float alpha = step(depth, 0.0);
  float rim = 0.0;
  if (fray > 0.5) {
    // Mostly eroding inwards: the spill past the frame stays shallow.
    float bend = (noise(px / 36.0 + vec2(uProgress * 2.5, 0.0)) - 0.5) * 0.8;
    float held = clamp(0.25 - depth / fray - bend, 0.0, 1.0);
    alpha = held > bayer8(cell + vec2(2.0, 5.0)) ? 1.0 : 0.0;
    rim = 1.0 - smoothstep(0.0, fray, -depth);
  }

  // A cell about to flip, or one on the fraying rim, prints as one-bit
  // halftone: each cell passes through ink on its way from one picture to
  // the next, so the band reads as a printed front rather than a mesh.
  bool flipping = local > 0.0 && local < 1.0 && abs(local - keyed) < uTone * 0.25;
  bool printed = flipping || 0.5 * uTone * rim > hash(floor(cell));
  float paperward = dot(uPaper - uInk, LUMA);
  float tone = clamp(dot(color - uInk, LUMA) / (abs(paperward) < 0.01 ? 1.0 : paperward), 0.0, 1.0);
  if (printed) {
    if (tone > bayer8(cell + vec2(4.0, 1.0))) alpha = 0.0;
    else color = uInk;
  }

  gl_FragColor = vec4(color * alpha, alpha);
}
`
