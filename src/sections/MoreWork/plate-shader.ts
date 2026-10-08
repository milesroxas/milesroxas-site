/**
 * The plate's transition: a liquid wave that runs up the plate, or down it
 * when the list goes back (`uDirection`), and bends the plate itself, not
 * only the picture inside it. The plate is a fine mesh drawn on a canvas
 * `uInset` larger than the frame, so its edges are free to move: the wave
 * stretches and squeezes it vertically by `uAmplitude` of the frame at most,
 * sways its sides, and swells it sideways by `uSwell` where the front passes,
 * so the frame's outline ripples like cloth. The arriving picture rises in
 * from the bottom behind a soft front, `uBand` of the frame deep and bent by
 * the wave, and the slopes are shaded by `uShade`. The wave is strongest on
 * the front and rises and falls with the transition, so a plate at rest is a
 * still, exact rectangle. Between waves the plate bows with the scroll
 * (`uFlex`, signed, -1 to 1), `uFlexDepth` of the frame at most, so a fast
 * scroll moves the plate, not its pictures.
 *
 * Up to `PLATE_WAVES` waves run at once, oldest first: each carries its own
 * picture (`uTex`) over everything below it, starting from `uBase`, the
 * picture at rest. A wave is invisible at progress 0 and whole at 1, so a new
 * one can start over a running one without a cut, and a finished one becomes
 * the base without a pop. Overlapping waves share one wave's worth of bend.
 *
 * Pictures are fitted like `object-fit: cover`: `uBaseCover` and `uCover`
 * scale the UV about its center.
 */
/** How many waves the plate runs at once. */
export const PLATE_WAVES = 4

/** Repeats a GLSL statement for each wave: sampler arrays take only constant indices. */
const eachWave = (statement: (i: number) => string) =>
  Array.from({ length: PLATE_WAVES }, (_, i) => statement(i)).join('\n  ')

const PLATE_WAVE = /* glsl */ `
uniform float uProgress[${PLATE_WAVES}];
uniform float uDirection[${PLATE_WAVES}];
uniform float uAspect;
uniform float uBand;
uniform float uAmplitude;
uniform float uSwell;
uniform float uWaves;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
// How far the wave pushes the front ahead of and behind its line. The front
// starts this far before the plate and ends this far past it, so nothing
// shows at progress 0 and the whole picture shows at 1.
const float REACH = 0.03;

// max(x, 1.0) without its corner, so overlapping waves share the bend without a kink.
float atLeastOne(float x) {
  return 0.5 * (x + 1.0 + sqrt((x - 1.0) * (x - 1.0) + 0.01));
}

struct Ripple {
  float phase;
  float local;
  float reach;
  vec2 bend;
};

Ripple ripple(vec2 uv, float progress, float direction) {
  Ripple r;
  // 0 where the arriving picture enters: the bottom, or the top going back.
  float y = direction < 0.0 ? 1.0 - uv.y : uv.y;
  // Wavefronts across the frame, gently bowed so they read as water, not stripes.
  r.phase = TAU * (y * uWaves - progress * 1.25) + sin(uv.x * uAspect * 2.2) * 0.7;
  float wave = sin(r.phase);

  float field = y + wave * REACH;
  float front = progress * (1.0 + uBand + 2.0 * REACH) - REACH;
  r.local = clamp((front - field) / uBand, 0.0, 1.0);

  // Squared, so the bend leaves rest and returns to it at zero speed rather than snapping on.
  float running = sin(PI * progress);
  running *= running;
  // Squared, so the swell eases in and out of the front and the edges never crease.
  float crest = 4.0 * r.local * (1.0 - r.local);
  crest *= crest;
  r.reach = running * (0.45 + 0.55 * crest);
  r.bend = vec2(0.2 * cos(r.phase * 0.8 + uv.x * 3.0) / uAspect, wave) * uAmplitude * r.reach;
  r.bend.x += (uv.x - 0.5) * 2.0 * uSwell * running * crest;
  return r;
}
`

export const PLATE_VERTEX = /* glsl */ `
${PLATE_WAVE}
uniform float uInset;
uniform float uFlex;
uniform float uFlexDepth;

varying vec2 vUv;

void main() {
  vUv = uv;
  Ripple r;
  vec2 bend = vec2(0.0);
  float reach = 0.0;
  ${eachWave((i) => `r = ripple(uv, uProgress[${i}], uDirection[${i}]); bend += r.bend; reach += r.reach;`)}
  vec2 p = uv + bend / atLeastOne(reach);
  // The middle trails the edges, like a sheet drawn through water.
  p.y += uFlex * uFlexDepth * sin(PI * uv.x);
  gl_Position = vec4((p * 2.0 - 1.0) * uInset, 0.0, 1.0);
}
`

export const PLATE_FRAGMENT = /* glsl */ `
${PLATE_WAVE}
uniform sampler2D uBase;
uniform vec2 uBaseCover;
uniform sampler2D uTex[${PLATE_WAVES}];
uniform vec2 uCover[${PLATE_WAVES}];
uniform float uShade;

varying vec2 vUv;

vec2 cover(vec2 uv, vec2 scale) {
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec3 color = texture2D(uBase, cover(vUv, uBaseCover)).rgb;
  Ripple r;
  float light = 0.0;
  float reach = 0.0;
  ${eachWave(
    (i) =>
      `r = ripple(vUv, uProgress[${i}], uDirection[${i}]); color = mix(color, texture2D(uTex[${i}], cover(vUv, uCover[${i}])).rgb, smoothstep(0.0, 1.0, r.local)); light += r.reach * cos(r.phase); reach += r.reach;`,
  )}
  gl_FragColor = vec4(color * (1.0 + uShade * light / atLeastOne(reach)), 1.0);
}
`
