uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = vUv;
  float n = noise(uv * 4.0 + vec2(0.0, -uTime * 2.0));
  n += noise(uv * 8.0 + vec2(0.0, -uTime * 3.5)) * 0.5;
  float flame = smoothstep(0.2, 0.9, n) * (1.0 - uv.y);
  vec3 col = mix(vec3(0.1, 0.0, 0.0), vec3(1.0, 0.4, 0.05), flame);
  col = mix(col, vec3(1.0, 0.9, 0.3), flame * flame);
  gl_FragColor = vec4(col, flame * 0.85);
}
