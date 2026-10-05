/**
 * The plate's dissolve: one picture gives way to the next through an fbm
 * noise threshold. `uProgress` 0 shows `uFrom`, 1 shows `uTo`; the front
 * between them is `uSoftness` wide in noise units, so the two pictures never
 * crossfade as a whole. Just ahead of the front a thin line, `uEdgeWidth`
 * pixels, shows the incoming picture `uEdgeScale` larger, so the front reads
 * as the new picture breaking through rather than a mask.
 *
 * Both pictures are fitted like `object-fit: cover`: `uFromCover` and
 * `uToCover` scale the UV about its center (`coverScale`).
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
uniform float uAspect;
uniform float uSoftness;
uniform float uEdgeWidth;
uniform float uEdgeScale;
uniform float uNoiseScale;

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

// Four octaves, normalized back to 0..1.
float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return sum / 0.9375;
}

void main() {
  vec3 from = texture2D(uFrom, cover(vUv, uFromCover)).rgb;
  vec3 to = texture2D(uTo, cover(vUv, uToCover)).rgb;

  float n = fbm(vUv * vec2(uAspect, 1.0) * uNoiseScale);
  // Stretched past both ends so 0 and 1 show one picture whole.
  float threshold = mix(-uSoftness, 1.0 + uSoftness, uProgress);
  float reveal = smoothstep(n - uSoftness, n + uSoftness, threshold);
  vec3 color = mix(from, to, reveal);

  // Distance in pixels from the leading edge of the front.
  float ahead = (n - threshold - uSoftness) / max(fwidth(n), 1e-5);
  float edge = 1.0 - smoothstep(0.0, uEdgeWidth, abs(ahead));
  edge *= step(1e-3, uProgress) * step(uProgress, 1.0 - 1e-3);
  vec3 enlarged = texture2D(uTo, cover(vUv, uToCover / uEdgeScale)).rgb;

  gl_FragColor = vec4(mix(color, enlarged, edge), 1.0);
}
`
