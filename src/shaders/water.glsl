uniform float uTime;
uniform vec3 uWaterColor;
uniform vec3 uDeepColor;
uniform float uFlowSpeed;

varying vec2 vUv;
varying vec3 vWorldPosition;

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
  vec2 uv = vUv * 8.0 + vec2(uTime * uFlowSpeed, uTime * uFlowSpeed * 0.5);
  float n = noise(uv) + noise(uv * 2.0 + uTime) * 0.5;
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 1.0, 0.0))), 2.0);
  vec3 col = mix(uDeepColor, uWaterColor, n * 0.5 + fresnel * 0.5);
  float shimmer = sin(uTime * 3.0 + vWorldPosition.x * 5.0) * 0.05 + 0.95;
  gl_FragColor = vec4(col * shimmer, 0.85);
}
