import * as THREE from 'three';
import { GOT } from './palette';
import {
  createWindGrassMaterial,
  createFireMaterial,
  createSmokeMaterial,
  createRainMaterial,
  createSakuraMaterial,
  createWaterMaterial,
  createInkMaterial,
  createKatanaGlowMaterial,
} from './shaderMaterials';

export function createKatana(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'katana';

  const bladeGeo = new THREE.BoxGeometry(0.04, 1.2, 0.008);
  const bladeMat = createKatanaGlowMaterial();
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.6;
  blade.castShadow = true;
  group.add(blade);

  const guardGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
  const guardMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.9, roughness: 0.3 });
  const guard = new THREE.Mesh(guardGeo, guardMat);
  guard.rotation.x = Math.PI / 2;
  group.add(guard);

  const handleGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.35, 8);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.8 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = -0.2;
  group.add(handle);

  const wrapGeo = new THREE.TorusGeometry(0.028, 0.008, 4, 8);
  for (let i = 0; i < 5; i++) {
    const wrap = new THREE.Mesh(wrapGeo, handleMat);
    wrap.position.y = -0.05 - i * 0.06;
    wrap.rotation.x = Math.PI / 2;
    group.add(wrap);
  }

  group.userData.bladeMaterial = bladeMat;
  return group;
}

export function createSamuraiSilhouette(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'samurai';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: GOT.robe,
    roughness: 0.85,
    metalness: 0.05,
  });

  const legMat = new THREE.MeshStandardMaterial({
    color: GOT.hakama,
    roughness: 0.9,
    metalness: 0.1,
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.2, 8), bodyMat);
  torso.position.y = 1.2;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), bodyMat);
  head.position.y = 2.0;
  head.castShadow = true;
  group.add(head);

  const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.7, 6);
  const leftArm = new THREE.Mesh(armGeo, bodyMat);
  leftArm.position.set(-0.5, 1.4, 0);
  leftArm.rotation.z = 0.3;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, bodyMat);
  rightArm.position.set(0.5, 1.4, 0);
  rightArm.rotation.z = -0.3;
  rightArm.name = 'rightArm';
  group.add(rightArm);

  const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.9, 6);
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.2, 0.45, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.2, 0.45, 0);
  group.add(rightLeg);

  const capeGeo = new THREE.PlaneGeometry(1.2, 1.8, 12, 18);
  const capeMat = new THREE.MeshStandardMaterial({
    color: GOT.cape,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.3, -0.25);
  cape.name = 'cape';
  group.add(cape);

  group.userData.rightArm = rightArm;
  group.userData.cape = cape;
  return group;
}

export function createBambooForest(count = 120): THREE.InstancedMesh {
  const geo = new THREE.CylinderGeometry(0.08, 0.12, 8, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: GOT.bamboo,
    roughness: 0.85,
    metalness: 0.05,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 25;
    dummy.position.set(
      Math.cos(angle) * radius,
      4,
      Math.sin(angle) * radius
    );
    dummy.scale.setScalar(0.6 + Math.random() * 1.2);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createGrassField(count = 800): THREE.InstancedMesh {
  const geo = new THREE.PlaneGeometry(0.15, 0.8);
  geo.translate(0, 0.4, 0);
  const mat = createWindGrassMaterial(GOT.grass, 0.3);

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 40,
      0,
      (Math.random() - 0.5) * 40
    );
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.scale.setScalar(0.5 + Math.random() * 1.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createGround(size = 60, color = GOT.ground): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(size, size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

export function createFogPlane(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(80, 30);
  const mat = new THREE.MeshBasicMaterial({
    color: GOT.fogGold,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const fog = new THREE.Mesh(geo, mat);
  fog.position.set(0, 5, -15);
  return fog;
}

export function createParticleField(count = 200): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 15 + 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: GOT.guideWind,
    size: 0.1,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geo, mat);
}

export function createBirds(count = 5): THREE.Group {
  const group = new THREE.Group();
  const birdGeo = new THREE.ConeGeometry(0.1, 0.3, 4);

  for (let i = 0; i < count; i++) {
    const bird = new THREE.Mesh(
      birdGeo,
      new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    );
    bird.rotation.z = Math.PI / 2;
    bird.position.set(
      (Math.random() - 0.5) * 20,
      12 + Math.random() * 5,
      (Math.random() - 0.5) * 20
    );
    bird.userData.speed = 0.5 + Math.random() * 0.5;
    bird.userData.offset = Math.random() * Math.PI * 2;
    group.add(bird);
  }
  return group;
}

export function createRiver(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(8, 40, 16, 32);
  const mat = createWaterMaterial();
  const river = new THREE.Mesh(geo, mat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(5, 0.02, 0);
  return river;
}

export function createCherryTrees(count = 8): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
  const blossomMat = new THREE.MeshStandardMaterial({ color: GOT.sakura, roughness: 0.8 });

  for (let i = 0; i < count; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 2, 6), trunkMat);
    trunk.position.y = 1;
    tree.add(trunk);

    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), blossomMat);
    canopy.position.y = 3;
    tree.add(canopy);

    tree.position.set(
      (Math.random() - 0.5) * 30,
      0,
      (Math.random() - 0.5) * 20 - 10
    );
    group.add(tree);
  }
  return group;
}

export function createMountains(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: GOT.mountainFar,
    roughness: 0.95,
    fog: true,
  });

  for (let i = 0; i < 5; i++) {
    const height = 8 + Math.random() * 12;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(6 + i * 2, height, 4),
      mat
    );
    mountain.position.set(-20 + i * 10, height / 2 - 2, -30 - i * 5);
    mountain.rotation.y = Math.random() * Math.PI;
    group.add(mountain);
  }
  return group;
}

export function createToriiGate(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: GOT.torii, roughness: 0.65 });

  const pillarGeo = new THREE.BoxGeometry(0.3, 4, 0.3);
  const left = new THREE.Mesh(pillarGeo, mat);
  left.position.set(-2, 2, 0);
  const right = new THREE.Mesh(pillarGeo, mat);
  right.position.set(2, 2, 0);
  group.add(left, right);

  const top = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 0.3), mat);
  top.position.y = 3.8;
  group.add(top);

  const second = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 0.2), mat);
  second.position.y = 3.2;
  group.add(second);

  group.position.set(0, 0, -15);
  return group;
}

export function createBattleFlags(count = 500): THREE.InstancedMesh {
  const geo = new THREE.PlaneGeometry(0.8, 1.2);
  const mat = new THREE.MeshStandardMaterial({
    color: GOT.flag,
    side: THREE.DoubleSide,
    roughness: 0.9,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 80,
      1.5 + Math.random() * 0.5,
      (Math.random() - 0.5) * 80
    );
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createEmberParticles(count = 300): THREE.Points {
  const positions = new Float32Array(count * 3);
  const velocities: number[] = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    velocities.push(Math.random() * 0.02 + 0.01);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: GOT.ember,
    size: 0.12,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.userData.velocities = velocities;
  return points;
}

export function createEnemySilhouettes(count = 8): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

  for (let i = 0; i < count; i++) {
    const silhouette = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.5, 4, 8), mat);
    silhouette.position.set(
      (Math.random() - 0.5) * 30,
      1,
      -5 - Math.random() * 15
    );
    silhouette.material = mat.clone();
    (silhouette.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.random() * 0.4;
    (silhouette.material as THREE.MeshBasicMaterial).transparent = true;
    group.add(silhouette);
  }
  return group;
}

export function createSparkBurst(): THREE.Points {
  const count = 50;
  const positions = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffaa44,
    size: 0.15,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const sparks = new THREE.Points(geo, mat);
  sparks.userData.active = false;
  sparks.userData.life = 0;
  return sparks;
}

export function createFullscreenQuad(material: THREE.Material, name: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.renderOrder = 999;
  return mesh;
}

export function createOverlayMaterial(
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
}

export {
  createRainMaterial,
  createSakuraMaterial,
  createInkMaterial,
  createSmokeMaterial,
  createFireMaterial,
};
