// Card Fragment Shader

uniform sampler2D uTexture;
uniform float uProgress;
varying vec2 vUv;

vec2 warpUv(vec2 uv, float amt) {
    float angle = sin(uv.y * 3.1415 + amt * 2.0) * 0.01 * amt;
    uv.x += angle;
    uv.y += sin(uv.x * 3.1415 + amt * 2.0) * 0.01 * amt;
    return uv;
}

void main() {
    float progress = smoothstep(0.0, 1.0, uProgress);
    float aberration = 0.05 * progress;
    vec2 uv = vUv;
    uv = warpUv(uv, progress);
    
    float r = texture2D(uTexture, uv + vec2(aberration, -aberration * 0.5)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(aberration, -aberration * 0.5)).b;
    
    vec3 color = vec3(r, g, b);
    gl_FragColor = vec4(color, 1.0);
}