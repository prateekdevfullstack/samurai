import * as THREE from 'three';

export interface LightRig {
  ambient: THREE.AmbientLight;
  sun: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  fill: THREE.PointLight;
  katanaGlow: THREE.PointLight;
}

export function createLights(scene: THREE.Scene): LightRig {
  const ambient = new THREE.AmbientLight(0x4a6a5a, 0.4);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffd4a0, 1.2);
  sun.position.set(8, 15, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x88aacc, 0.5);
  rim.position.set(-10, 5, -8);
  scene.add(rim);

  const fill = new THREE.PointLight(0xffaa66, 0.6, 30);
  fill.position.set(-3, 3, 5);
  scene.add(fill);

  const katanaGlow = new THREE.PointLight(0xffffff, 0, 8);
  katanaGlow.position.set(0, 0.5, 0);
  scene.add(katanaGlow);

  return { ambient, sun, rim, fill, katanaGlow };
}

export function updateLights(lights: LightRig, progress: number): void {
  const scenePhase = progress * 7;
  const phase = Math.floor(scenePhase);
  const local = scenePhase - phase;

  const palettes = [
    { sun: 0xffd4a0, ambient: 0x4a6a5a, sunInt: 1.2, ambInt: 0.4 }, // Dawn - gold/green
    { sun: 0xffc870, ambient: 0x5a7a6a, sunInt: 1.0, ambInt: 0.35 }, // Preparation
    { sun: 0xffaa55, ambient: 0x6a5a4a, sunInt: 1.3, ambInt: 0.4 }, // Journey - amber
    { sun: 0xcc4422, ambient: 0x2a1a1a, sunInt: 0.6, ambInt: 0.2 }, // Battlefield - crimson
    { sun: 0xff6633, ambient: 0x1a1010, sunInt: 0.8, ambInt: 0.15 }, // Duel
    { sun: 0xffffff, ambient: 0x000000, sunInt: 2.0, ambInt: 0.05 }, // Final strike
    { sun: 0xcccccc, ambient: 0x1a1a22, sunInt: 0.4, ambInt: 0.3 }, // Ending - silver
  ];

  const current = palettes[Math.min(phase, palettes.length - 1)];
  const next = palettes[Math.min(phase + 1, palettes.length - 1)];

  const sunColor = new THREE.Color(current.sun).lerp(new THREE.Color(next.sun), local);
  const ambColor = new THREE.Color(current.ambient).lerp(new THREE.Color(next.ambient), local);

  lights.sun.color.copy(sunColor);
  lights.sun.intensity = THREE.MathUtils.lerp(current.sunInt, next.sunInt, local);
  lights.ambient.color.copy(ambColor);
  lights.ambient.intensity = THREE.MathUtils.lerp(current.ambInt, next.ambInt, local);

  lights.rim.intensity = phase >= 3 ? 0.2 : 0.5;
  lights.fill.intensity = phase <= 2 ? 0.6 : 0.2;
}
