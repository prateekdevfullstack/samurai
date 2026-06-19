uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.3;
  vec2 grid = vec2(30.0, 20.0);
  vec2 id = floor(uv * grid);
  vec2 gv = fract(uv * grid) - 0.5;

  float rnd = hash(id);
  float fall = fract(rnd + t * (0.3 + rnd * 0.4));
  gv.y += fall * 2.0 - 1.0;
  gv.x += sin(t * 3.0 + rnd * 6.28) * 0.15;

  float petal = smoothstep(0.12, 0.0, length(gv));
  float alpha = petal * uIntensity * (0.5 + rnd * 0.5);
  gl_FragColor = vec4(uColor, alpha);
}
