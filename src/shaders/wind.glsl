uniform float uTime;
uniform float uStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  float wave = sin(vPosition.x * 2.0 + uTime * 1.5) * 0.5
             + sin(vPosition.z * 3.0 + uTime * 2.0) * 0.3;
  wave *= uStrength;
  vec3 displaced = vPosition;
  displaced.y += wave * vUv.y;
  displaced.x += wave * 0.2;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
