import * as THREE from 'three';
import { CinematicCamera } from './Camera';
import { createLights, updateLights, type LightRig } from './Lights';
import { PostProcessing } from './PostProcessing';
import { AssetLoader } from './AssetLoader';
import {
  createKatana,
  createSamuraiSilhouette,
  createBambooForest,
  createGrassField,
  createGround,
  createFogPlane,
  createParticleField,
  createBirds,
  createRiver,
  createCherryTrees,
  createMountains,
  createToriiGate,
  createBattleFlags,
  createEmberParticles,
  createEnemySilhouettes,
  createSparkBurst,
  createFullscreenQuad,
  createRainMaterial,
  createSakuraMaterial,
  createInkMaterial,
  createSmokeMaterial,
  createFireMaterial,
} from './proceduralAssets';
import { lerpScenePalette, GOT } from './palette';
import { collectShaderMaterials, updateShaders, type ShaderRegistry } from './shaderMaterials';

export interface SceneState {
  progress: number;
  katanaHover: number;
  katanaGlow: number;
  slashActive: boolean;
  slashTime: number;
}

export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera: CinematicCamera;
  readonly lights: LightRig;
  readonly postProcessing: PostProcessing;
  readonly assetLoader = new AssetLoader();

  private shaders: ShaderRegistry;
  private katana: THREE.Group;
  private samurai: THREE.Group;
  private sparks: THREE.Points;
  private embers: THREE.Points;
  private birds: THREE.Group;
  private sceneGroups: Record<string, THREE.Group> = {};
  private fogColor = new THREE.Color(GOT.fogGold);
  private backgroundColor = new THREE.Color(GOT.skyDawn);
  private rainOverlay!: THREE.Mesh;
  private sakuraOverlay!: THREE.Mesh;
  private inkOverlay!: THREE.Mesh;
  private smokePlanes: THREE.Mesh[] = [];
  private firePlanes: THREE.Mesh[] = [];

  constructor(
    private renderer: THREE.WebGLRenderer,
    camera: CinematicCamera
  ) {
    this.camera = camera;
    this.lights = createLights(this.scene);
    this.postProcessing = new PostProcessing(renderer, this.scene, camera.camera);

    this.scene.fog = new THREE.FogExp2(this.fogColor.getHex(), 0.025);
    this.scene.background = this.backgroundColor;

    this.buildWorld();
    this.shaders = collectShaderMaterials(this.scene);

    this.katana = this.scene.getObjectByName('katana') as THREE.Group;
    this.samurai = this.scene.getObjectByName('samurai') as THREE.Group;
    this.sparks = this.scene.getObjectByName('sparks') as THREE.Points;
    this.embers = this.scene.getObjectByName('embers') as THREE.Points;
    this.birds = this.scene.getObjectByName('birds') as THREE.Group;

    this.shaders.rain = (this.rainOverlay.material as THREE.ShaderMaterial);
    this.shaders.sakura = (this.sakuraOverlay.material as THREE.ShaderMaterial);
    this.shaders.ink = (this.inkOverlay.material as THREE.ShaderMaterial);
  }

  private attachOverlayToCamera(overlay: THREE.Mesh): void {
    const distance = 3;
    const fov = (this.camera.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * distance;
    const width = height * this.camera.camera.aspect;
    overlay.scale.set(width * 1.2, height * 1.2, 1);
    overlay.position.set(0, 0, -distance);
    this.camera.camera.add(overlay);
  }

  private buildWorld(): void {
    const dawn = new THREE.Group();
    dawn.name = 'scene1';
    dawn.add(createGround(60, GOT.ground));
    dawn.add(createGrassField());
    dawn.add(createBambooForest());
    dawn.add(createFogPlane());
    dawn.add(createParticleField());

    const katana = createKatana();
    katana.position.set(0, 0, 2);
    katana.rotation.x = 0.3;
    katana.rotation.z = 0.1;
    dawn.add(katana);

    const samurai = createSamuraiSilhouette();
    samurai.position.set(0, 0, 8);
    dawn.add(samurai);

    const birds = createBirds();
    birds.name = 'birds';
    dawn.add(birds);

    this.sceneGroups.scene1 = dawn;
    this.scene.add(dawn);

    const journey = new THREE.Group();
    journey.name = 'scene3';
    journey.visible = false;
    journey.add(createRiver());
    journey.add(createCherryTrees());
    journey.add(createMountains());
    journey.add(createToriiGate());
    this.sceneGroups.scene3 = journey;
    this.scene.add(journey);

    const battlefield = new THREE.Group();
    battlefield.name = 'scene4';
    battlefield.visible = false;
    battlefield.add(createGround(100, 0x3a2820));
    battlefield.add(createBattleFlags());
    battlefield.add(createEnemySilhouettes());

    for (let i = 0; i < 3; i++) {
      const smokeMat = createSmokeMaterial();
      const smoke = createFullscreenQuad(smokeMat, `smoke${i}`);
      smoke.position.set((i - 1) * 8, 2, -10 - i * 3);
      smoke.scale.set(12, 8, 1);
      battlefield.add(smoke);
      this.smokePlanes.push(smoke);
    }

    const embers = createEmberParticles();
    embers.name = 'embers';
    battlefield.add(embers);
    this.sceneGroups.scene4 = battlefield;
    this.scene.add(battlefield);

    const duel = new THREE.Group();
    duel.name = 'scene5';
    duel.visible = false;
    duel.add(createGround(30, 0x2a2018));

    const opponent = createSamuraiSilhouette();
    opponent.position.set(0, 0, -4);
    opponent.scale.setScalar(1.1);
    opponent.name = 'opponent';
    duel.add(opponent);

    for (let i = 0; i < 2; i++) {
      const fireMat = createFireMaterial();
      const fire = createFullscreenQuad(fireMat, `fire${i}`);
      fire.position.set((i - 0.5) * 6, 0.5, -2);
      fire.scale.set(4, 3, 1);
      duel.add(fire);
      this.firePlanes.push(fire);
    }

    this.sceneGroups.scene5 = duel;
    this.scene.add(duel);

    const rainMat = createRainMaterial();
    this.rainOverlay = createFullscreenQuad(rainMat, 'rainOverlay');
    this.attachOverlayToCamera(this.rainOverlay);

    const sakuraMat = createSakuraMaterial();
    this.sakuraOverlay = createFullscreenQuad(sakuraMat, 'sakuraOverlay');
    this.attachOverlayToCamera(this.sakuraOverlay);

    const inkMat = createInkMaterial();
    this.inkOverlay = createFullscreenQuad(inkMat, 'inkOverlay');
    this.attachOverlayToCamera(this.inkOverlay);

    const sparks = createSparkBurst();
    sparks.name = 'sparks';
    this.scene.add(sparks);
  }

  async loadAssets(): Promise<void> {
    const assets = await this.assetLoader.loadAll();
    const katanaModel = assets.get('katana');
    if (katanaModel instanceof THREE.Object3D) {
      const existing = this.scene.getObjectByName('katana');
      if (existing) {
        const clone = katanaModel.clone();
        clone.position.copy(existing.position);
        clone.rotation.copy(existing.rotation);
        existing.parent?.add(clone);
        existing.parent?.remove(existing);
      }
    }
  }

  update(state: SceneState, time: number, delta: number): void {
    const { progress, katanaHover, katanaGlow, slashActive, slashTime } = state;
    const phase = progress * 7;

    this.camera.update(progress, delta);
    updateLights(this.lights, progress);
    updateShaders(this.shaders, time, progress);
    this.postProcessing.update(progress, katanaGlow);

    this.updateEnvironment(phase);
    this.updateSceneVisibility(phase);
    this.updateCharacters(phase, katanaHover, katanaGlow);
    this.updateParticles(time, delta, phase);
    this.updateOverlays(phase);
    this.updateSlash(slashActive, slashTime, time);

    this.lights.katanaGlow.intensity = katanaGlow * 3 + katanaHover * 2;
    this.lights.katanaGlow.position.copy(this.katana.position);
    this.lights.katanaGlow.position.y += 0.5;
  }

  private updateEnvironment(phase: number): void {
    const palette = lerpScenePalette(phase);

    this.backgroundColor.setHex(palette.bg);
    this.fogColor.setHex(palette.fog);
    this.scene.background = this.backgroundColor;
    (this.scene.fog as THREE.FogExp2).color = this.fogColor;
    (this.scene.fog as THREE.FogExp2).density = palette.density;
  }

  private updateSceneVisibility(phase: number): void {
    this.sceneGroups.scene1.visible = phase < 3.5;
    this.sceneGroups.scene3.visible = phase >= 1.8 && phase < 4.5;
    this.sceneGroups.scene4.visible = phase >= 3.2 && phase < 6.5;
    this.sceneGroups.scene5.visible = phase >= 4.5;

    if (phase >= 1.8 && phase < 3.5) {
      const journeyT = (phase - 1.8) / 1.7;
      this.sceneGroups.scene3.position.x = journeyT * 10 - 5;
    }
  }

  private updateCharacters(phase: number, hover: number, glow: number): void {
    if (!this.samurai || !this.katana) return;

    const prepT = THREE.MathUtils.clamp((phase - 0.8) / 1.2, 0, 1);
    this.samurai.position.z = THREE.MathUtils.lerp(8, 3.5, prepT);
    this.samurai.position.x = THREE.MathUtils.lerp(0, -0.5, prepT);

    const rightArm = this.samurai.userData.rightArm as THREE.Mesh;
    if (rightArm) {
      rightArm.rotation.z = THREE.MathUtils.lerp(-0.3, -1.2, prepT);
      rightArm.position.y = THREE.MathUtils.lerp(1.4, 1.6, prepT);
    }

    const drawT = THREE.MathUtils.clamp((phase - 1.5) / 0.8, 0, 1);
    if (drawT > 0) {
      this.katana.position.y = THREE.MathUtils.lerp(0, 1.2, drawT);
      this.katana.rotation.x = THREE.MathUtils.lerp(0.3, -0.5, drawT);
      this.katana.parent?.attach(this.katana);
      this.katana.position.set(
        THREE.MathUtils.lerp(0, 0.6, drawT),
        THREE.MathUtils.lerp(0.5, 1.5, drawT),
        THREE.MathUtils.lerp(2, 3.5, drawT)
      );
    }

    const bladeMat = this.katana.userData.bladeMaterial as THREE.ShaderMaterial;
    if (bladeMat) {
      bladeMat.uniforms.uGlow.value = glow;
      bladeMat.uniforms.uHover.value = hover;
      bladeMat.uniforms.uTime.value = performance.now() * 0.001;
    }

    const duelT = THREE.MathUtils.clamp((phase - 4.5) / 2, 0, 1);
    const opponent = this.scene.getObjectByName('opponent');
    if (opponent) {
      opponent.position.z = THREE.MathUtils.lerp(-4, -2.5, Math.sin(duelT * Math.PI * 3) * 0.5 + 0.5);
    }

    const cape = this.samurai.userData.cape as THREE.Mesh;
    if (cape) {
      cape.rotation.x = Math.sin(performance.now() * 0.002 + duelT * 5) * 0.1 * duelT;
    }

    const freezeT = THREE.MathUtils.clamp((phase - 5.5) / 0.8, 0, 1);
    if (freezeT > 0) {
      this.samurai.rotation.y = freezeT * 0.3;
    }
  }

  private updateParticles(time: number, delta: number, phase: number): void {
    if (this.birds) {
      this.birds.children.forEach((bird) => {
        const speed = bird.userData.speed as number;
        const offset = bird.userData.offset as number;
        bird.position.x += Math.sin(time * speed + offset) * delta * 2;
        bird.position.z += delta * speed;
      });
    }

    if (this.embers && phase > 3) {
      const positions = this.embers.geometry.attributes.position.array as Float32Array;
      const velocities = this.embers.userData.velocities as number[];
      for (let i = 0; i < velocities.length; i++) {
        positions[i * 3 + 1] += velocities[i];
        if (positions[i * 3 + 1] > 5) positions[i * 3 + 1] = 0;
      }
      this.embers.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateOverlays(phase: number): void {
    if (this.rainOverlay) {
      this.rainOverlay.visible = phase > 5.5 || (phase > 2 && phase < 2.5);
    }
    if (this.sakuraOverlay) {
      this.sakuraOverlay.visible = phase > 1.8 && phase < 3.5;
    }
    if (this.inkOverlay) {
      this.inkOverlay.visible = phase > 5.2;
    }
  }

  private updateSlash(active: boolean, slashTime: number, time: number): void {
    if (!this.sparks || !active) return;

    const mat = this.sparks.material as THREE.PointsMaterial;
    const life = 1 - slashTime;
    mat.opacity = life * 0.9;

    const positions = this.sparks.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length / 3; i++) {
      const angle = (i / (positions.length / 3)) * Math.PI * 2;
      const radius = slashTime * 3;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 1.5 + Math.sin(time * 10 + i) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius + 3;
    }
    this.sparks.geometry.attributes.position.needsUpdate = true;
  }

  getKatanaScreenPosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.katana.getWorldPosition(pos);
    pos.project(this.camera.camera);
    return pos;
  }

  render(): void {
    this.postProcessing.render();
  }

  resize(): void {
    this.postProcessing.resize(window.innerWidth, window.innerHeight);
  }
}
