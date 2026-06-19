uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float speed = uTime * 8.0;
  vec2 grid = vec2(80.0, 40.0);
  vec2 id = floor(uv * grid);
  vec2 gv = fract(uv * grid) - 0.5;

  float rnd = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
  float drop = smoothstep(0.45, 0.0, abs(gv.x - rnd * 0.3));
  float streak = smoothstep(0.5, -0.5, gv.y + fract(speed * 0.1 + rnd) * 2.0 - 1.0);
  float rain = drop * streak * uIntensity;
  gl_FragColor = vec4(vec3(0.7, 0.75, 0.85), rain * 0.6);
}
