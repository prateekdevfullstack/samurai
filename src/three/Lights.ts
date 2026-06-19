import * as THREE from 'three';
import { lerpScenePalette } from './palette';

export interface LightRig {
  ambient: THREE.AmbientLight;
  sun: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  fill: THREE.PointLight;
  katanaGlow: THREE.PointLight;
}

export function createLights(scene: THREE.Scene): LightRig {
  const ambient = new THREE.AmbientLight(0x5a7a48, 0.45);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffb84d, 1.6);
  sun.position.set(12, 8, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0xffa060, 0.7);
  rim.position.set(-12, 6, -10);
  scene.add(rim);

  const fill = new THREE.PointLight(0xffc878, 0.5, 35);
  fill.position.set(-4, 4, 6);
  scene.add(fill);

  const katanaGlow = new THREE.PointLight(0xffe8c0, 0, 10);
  katanaGlow.position.set(0, 0.5, 0);
  scene.add(katanaGlow);

  return { ambient, sun, rim, fill, katanaGlow };
}

export function updateLights(lights: LightRig, progress: number): void {
  const phase = progress * 7;
  const palette = lerpScenePalette(phase);

  lights.sun.color.setHex(palette.sun);
  lights.sun.intensity = palette.sunInt;
  lights.ambient.color.setHex(palette.ambient);
  lights.ambient.intensity = palette.ambInt;
  lights.rim.intensity = palette.rimInt;
  lights.rim.color.setHex(phase > 3 ? 0xcc4030 : 0xffa060);

  lights.fill.intensity = phase <= 2.5 ? 0.55 : phase > 5 ? 0.15 : 0.25;
  lights.fill.color.setHex(phase > 3 ? 0xff6030 : 0xffc878);

  if (phase < 3.5) {
    const sunHeight = THREE.MathUtils.lerp(6, 10, phase / 3.5);
    lights.sun.position.set(14, sunHeight, 8);
  } else if (phase < 5) {
    lights.sun.position.set(6, 4, 4);
  } else {
    lights.sun.position.set(0, 12, 2);
  }
}
