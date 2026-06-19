import * as THREE from 'three';

import fireFrag from '../shaders/fire.glsl?raw';
import smokeFrag from '../shaders/smoke.glsl?raw';
import rainFrag from '../shaders/rain.glsl?raw';
import sakuraFrag from '../shaders/sakura.glsl?raw';
import waterFrag from '../shaders/water.glsl?raw';
import inkFrag from '../shaders/ink.glsl?raw';
import { GOT } from './palette';

const basicVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const windVert = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    float wave = sin(position.x * 2.0 + uTime * 1.5) * 0.5
               + sin(position.z * 3.0 + uTime * 2.0) * 0.3;
    pos.y += wave * uStrength * uv.y;
    pos.x += wave * 0.15 * uStrength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const grassFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uTipColor;
  varying vec2 vUv;

  void main() {
    float tip = smoothstep(0.0, 1.0, vUv.y);
    vec3 base = uColor * 0.55;
    vec3 top = uTipColor * 1.15;
    vec3 col = mix(base, top, tip);
    col += vec3(0.08, 0.05, 0.0) * tip * tip;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createWindGrassMaterial(color: number, strength = 0.3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uStrength: { value: strength },
      uColor: { value: new THREE.Color(color) },
      uTipColor: { value: new THREE.Color(GOT.grassTip) },
    },
    vertexShader: windVert,
    fragmentShader: grassFrag,
    side: THREE.DoubleSide,
  });
}

export function createFireMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: basicVert,
    fragmentShader: fireFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createSmokeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
    },
    vertexShader: basicVert,
    fragmentShader: smokeFrag,
    transparent: true,
    depthWrite: false,
  });
}

export function createRainMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: basicVert,
    fragmentShader: rainFrag,
    transparent: true,
    depthWrite: false,
  });
}

export function createSakuraMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(GOT.sakura) },
    },
    vertexShader: basicVert,
    fragmentShader: sakuraFrag,
    transparent: true,
    depthWrite: false,
  });
}

export function createWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFlowSpeed: { value: 0.15 },
      uWaterColor: { value: new THREE.Color(GOT.water) },
      uDeepColor: { value: new THREE.Color(GOT.waterDeep) },
    },
    vertexShader: basicVert,
    fragmentShader: waterFrag,
    transparent: true,
  });
}

export function createInkMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uInkColor: { value: new THREE.Color(GOT.ink) },
    },
    vertexShader: basicVert,
    fragmentShader: inkFrag,
    transparent: true,
    depthWrite: false,
  });
}

export function createKatanaGlowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGlow: { value: 0 },
      uHover: { value: 0 },
    },
    vertexShader: basicVert,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uGlow;
      uniform float uHover;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
        float shimmer = sin(uTime * 4.0 + vUv.y * 20.0) * 0.5 + 0.5;
        float glow = fresnel * (0.3 + uGlow * 0.7 + uHover * 0.5) * shimmer;
        vec3 steel = vec3(0.75, 0.78, 0.82);
        vec3 gold = vec3(1.0, 0.85, 0.55);
        vec3 col = mix(steel, gold, glow);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    metalness: 1,
  });
}

export interface ShaderRegistry {
  grass: THREE.ShaderMaterial[];
  fire: THREE.ShaderMaterial[];
  smoke: THREE.ShaderMaterial[];
  rain: THREE.ShaderMaterial;
  sakura: THREE.ShaderMaterial;
  water: THREE.ShaderMaterial[];
  ink: THREE.ShaderMaterial;
}

export function collectShaderMaterials(root: THREE.Object3D): ShaderRegistry {
  const registry: ShaderRegistry = {
    grass: [],
    fire: [],
    smoke: [],
    rain: createRainMaterial(),
    sakura: createSakuraMaterial(),
    water: [],
    ink: createInkMaterial(),
  };

  root.traverse((obj) => {
    const mat = (obj as THREE.Mesh).material;
    if (!mat) return;
    const materials = Array.isArray(mat) ? mat : [mat];
    materials.forEach((m) => {
      if (m instanceof THREE.ShaderMaterial) {
        if (m.uniforms.uStrength) registry.grass.push(m);
        if (m.uniforms.uFlowSpeed) registry.water.push(m);
        if (m.uniforms.uIntensity && m.fragmentShader.includes('smoke')) registry.smoke.push(m);
        if (m.uniforms.uIntensity && m.fragmentShader.includes('flame')) registry.fire.push(m);
      }
    });
  });

  return registry;
}

export function updateShaders(registry: ShaderRegistry, time: number, progress: number): void {
  const phase = progress * 7;

  registry.grass.forEach((m) => {
    m.uniforms.uTime.value = time;
  });

  registry.fire.forEach((m) => {
    m.uniforms.uTime.value = time;
  });

  registry.smoke.forEach((m) => {
    m.uniforms.uTime.value = time;
    m.uniforms.uIntensity.value = phase > 3 ? 1.5 : 0.3;
  });

  registry.water.forEach((m) => {
    m.uniforms.uTime.value = time;
  });

  registry.rain.uniforms.uTime.value = time;
  registry.rain.uniforms.uIntensity.value = phase > 5.5 ? 1 : phase > 2 ? 0.3 : 0;

  registry.sakura.uniforms.uTime.value = time;
  registry.sakura.uniforms.uIntensity.value = phase > 1.5 && phase < 3.5 ? 1 : 0;
  if (registry.sakura.uniforms.uColor) {
    const petalColor = phase > 2 && phase < 3 ? GOT.maple : GOT.sakura;
    registry.sakura.uniforms.uColor.value.setHex(petalColor);
  }

  registry.ink.uniforms.uTime.value = time;
  registry.ink.uniforms.uProgress.value = phase > 5 ? (phase - 5) * 2 : 0;
}
