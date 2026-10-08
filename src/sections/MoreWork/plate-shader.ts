/**
 * The plate's transition: the next picture sweeps in through an ordered
 * (Bayer 8x8) dither. A soft band, `uBand` of the frame deep and warped by
 * low noise so its edge is not a ruler line, travels down the plate when the
 * pointer moves down the list and up when it moves up (`uDirection`). Inside
 * the band each `uCell`-pixel cell flips to the new picture once the band's
 * local progress passes its dither threshold, so the pictures never blend.
 *
 * Chromatic aberration rides the band: red and blue pull apart radially,
 * strongest mid-band and faintly across the frame while the sweep runs, and
 * gone at rest. The leaving picture drifts slightly larger and the arriving
 * one settles from `uSettle` scale, so the change has depth.
 *
 * Pictures are fitted like `object-fit: cover`: `uFromCover` and `uToCover`
 * scale the UV about its center.
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
uniform float uProgress;
uniform float uDirection;
uniform float uAspect;
uniform float uBand;
uniform float uWarp;
uniform float uCell;
uniform float uAberration;
uniform float uSettle;
uniform float uDrift;

varying vec2 vUv;

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

// Red and blue sampled apart along shift, green in place.
vec3 split(sampler2D tex, vec2 uv, vec2 shift) {
  return vec3(texture2D(tex, uv + shift).r, texture2D(tex, uv).g, texture2D(tex, uv - shift).b);
}

void main() {
  // 0 where the sweep starts, 1 where it ends.
  float along = uDirection > 0.0 ? 1.0 - vUv.y : vUv.y;
  float warp = noise(vUv * vec2(uAspect, 1.0) * 2.0) - 0.5;
  float field = clamp(along + warp * uWarp, 0.0, 1.0);

  // Stretched past both ends so 0 and 1 show one picture whole.
  float front = uProgress * (1.0 + uBand);
  float local = clamp((front - field) / uBand, 0.0, 1.0);
  float threshold = bayer8(gl_FragCoord.xy / uCell);
  float reveal = local > threshold ? 1.0 : 0.0;

  float inBand = 4.0 * local * (1.0 - local);
  float running = sin(3.14159265 * uProgress);
  vec2 shift = (vUv - 0.5) * uAberration * (inBand + 0.2 * running);

  float leaving = 1.0 + uDrift * uProgress;
  float arriving = mix(uSettle, 1.0, uProgress);
  vec3 from = split(uFrom, cover(vUv, uFromCover / leaving), shift);
  vec3 to = split(uTo, cover(vUv, uToCover / arriving), shift);

  gl_FragColor = vec4(mix(from, to, reveal), 1.0);
}
`

/**
 * The dial's transition: a liquid wave that runs up the plate with the page
 * and bends the plate itself, not only the picture inside it. The plate is a
 * fine mesh drawn on a canvas `uInset` larger than the frame, so its edges
 * are free to move: the wave stretches and squeezes it vertically by
 * `uAmplitude` of the frame at most, sways its sides, and swells it sideways
 * by `uSwell` where the front passes, so the frame's outline ripples like
 * cloth. The arriving picture rises in from the bottom behind a soft front,
 * `uBand` of the frame deep and bent by the wave, and the slopes are shaded
 * by `uShade`. The wave is strongest on the front and rises and falls with
 * the transition, so a plate at rest is a still, exact rectangle, and its
 * phase follows `uProgress`, so a scrubbed wave runs back when the page does.
 */
const PLATE_RIPPLE_WAVE = /* glsl */ `
uniform float uProgress;
uniform float uAspect;
uniform float uBand;
uniform float uAmplitude;
uniform float uSwell;
uniform float uWaves;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

struct Ripple {
  float phase;
  float local;
  float reach;
  vec2 bend;
};

Ripple ripple(vec2 uv) {
  Ripple r;
  // Wavefronts across the frame, gently bowed so they read as water, not stripes.
  r.phase = TAU * (uv.y * uWaves - uProgress * 1.25) + sin(uv.x * uAspect * 2.2) * 0.7;
  float wave = sin(r.phase);

  // 0 at the bottom, where the arriving picture enters, 1 at the top.
  float field = uv.y + wave * 0.06;
  float front = uProgress * (1.0 + uBand);
  r.local = clamp((front - field) / uBand, 0.0, 1.0);

  float running = sin(PI * uProgress);
  // Squared, so the swell eases in and out of the front and the edges never crease.
  float crest = 4.0 * r.local * (1.0 - r.local);
  crest *= crest;
  r.reach = running * (0.45 + 0.55 * crest);
  r.bend = vec2(0.35 * cos(r.phase * 0.8 + uv.x * 3.0) / uAspect, wave) * uAmplitude * r.reach;
  r.bend.x += (uv.x - 0.5) * 2.0 * uSwell * running * crest;
  return r;
}
`

export const PLATE_RIPPLE_VERTEX = /* glsl */ `
${PLATE_RIPPLE_WAVE}
uniform float uInset;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec2 p = uv + ripple(uv).bend;
  gl_Position = vec4((p * 2.0 - 1.0) * uInset, 0.0, 1.0);
}
`

export const PLATE_RIPPLE_FRAGMENT = /* glsl */ `
${PLATE_RIPPLE_WAVE}
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromCover;
uniform vec2 uToCover;
uniform float uShade;

varying vec2 vUv;

vec2 cover(vec2 uv, vec2 scale) {
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  Ripple r = ripple(vUv);
  vec3 from = texture2D(uFrom, cover(vUv, uFromCover)).rgb;
  vec3 to = texture2D(uTo, cover(vUv, uToCover)).rgb;
  vec3 color = mix(from, to, smoothstep(0.0, 1.0, r.local));

  gl_FragColor = vec4(color * (1.0 + uShade * r.reach * cos(r.phase)), 1.0);
}
`
