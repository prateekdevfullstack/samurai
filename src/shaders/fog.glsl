uniform float uTime;
uniform float uDensity;
uniform vec3 uFogColor;
uniform float uHeightFalloff;

varying vec3 vWorldPosition;

void main() {
  float heightFactor = exp(-vWorldPosition.y * uHeightFalloff);
  float dist = length(vWorldPosition - cameraPosition);
  float fogFactor = 1.0 - exp(-dist * uDensity * heightFactor);
  gl_FragColor = vec4(uFogColor, fogFactor);
}
