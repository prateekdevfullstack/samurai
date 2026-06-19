uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float t = uTime * 0.15;
  float n = noise(uv * 3.0 + vec2(t, t * 0.7));
  n += noise(uv * 6.0 - vec2(t * 0.5, t)) * 0.5;
  float smoke = smoothstep(0.35, 0.75, n) * uIntensity;
  float edge = 1.0 - length(uv) * 0.6;
  smoke *= smoothstep(0.0, 1.0, edge);
  gl_FragColor = vec4(vec3(0.12, 0.11, 0.1), smoke * 0.7);
}
