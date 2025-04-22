precision mediump float;

uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_planeAspect;
uniform float u_progress;
uniform sampler2D u_texture;
varying vec2 v_uv;

// Simple per‑pixel hash noise
float noise(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Bilinear‑interpolated noise
float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    f = f * f * (3.0 - 2.0 * f);

    float bl = noise(i);
    float br = noise(i + vec2(1.0, 0.0));
    float tl = noise(i + vec2(0.0, 1.0));
    float tr = noise(i + vec2(1.0, 1.0));

    float b = mix(bl, br, f.x);
    float t = mix(tl, tr, f.x);
    return mix(b, t, f.y);
}

vec2 distort(vec2 uv, vec2 center, float strength, float frequency) {
    vec2 dir   = uv - center;
    vec2 adir  = dir * vec2(u_planeAspect, 1.0);
    float dist = length(adir);
    float d    = sin(dist * frequency - u_time * 0.5) * strength;
    d *= smoothstep(0.5, 0.0, dist);
    return uv + dir * d;
}

vec3 chromaticAberration(sampler2D tex, vec2 uv, float strength) {
    vec2 offset = vec2(strength, 0.0);
    float r = texture2D(tex, uv - offset).r;
    float g = texture2D(tex, uv         ).g;
    float b = texture2D(tex, uv + offset).b;
    return vec3(r, g, b);
}

void main() {
    vec2 uv   = v_uv;
    vec3 base = texture2D(u_texture, uv).rgb;

    // Aspect‑corrected mouse distance
    vec2 md     = (uv - u_mouse) * vec2(u_planeAspect, 1.0);
    float dMouse = length(md);

    // Distortion + noise
    float influence = 1.0 - smoothstep(0.0, 0.5, dMouse);
    float strength = 0.03 + influence * 0.08;
    float freq      = 10.0 + 5.0 * sin(u_time * 0.2);
    float n         = smoothNoise(uv * 3.0 + u_time * 0.1) * 0.02;
    vec2  dUV       = distort(uv, u_mouse, strength + n, freq);

    // Chromatic aberration
    vec3 fancy = chromaticAberration(u_texture, dUV, 0.005 + influence * 0.015);

    // Vignette around mouse
    float v = smoothstep(0.7, 0.2, dMouse) * 0.5;
    fancy *= v;

    // Pulsing glow around mouse
    float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
    float g     = smoothstep(0.4 + 0.1 * pulse, 0.0, dMouse) * 0.5;
    fancy += vec3(0.08, 0.04, 0.15) * g;

    // Blend between base and effect
    vec3 color = mix(base, fancy, u_progress);
    gl_FragColor = vec4(color, 1.0);
}
