import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';

export class PostProcessing {
  readonly composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private vignettePass: ShaderPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    const ssao = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    ssao.kernelRadius = 8;
    ssao.minDistance = 0.005;
    ssao.maxDistance = 0.1;
    this.composer.addPass(ssao);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4,
      0.5,
      0.85
    );
    this.composer.addPass(this.bloomPass);

    this.vignettePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uIntensity: { value: 0.4 },
        uProgress: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uProgress;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec2 center = vUv - 0.5;
          float vignette = 1.0 - dot(center, center) * uIntensity * 2.0;
          float fade = smoothstep(0.85, 1.0, uProgress) * 0.8;
          color.rgb *= vignette;
          color.rgb = mix(color.rgb, vec3(1.0), fade);
          gl_FragColor = color;
        }
      `,
    });
    this.composer.addPass(this.vignettePass);
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  update(progress: number, katanaGlow: number): void {
    const phase = progress * 7;
    this.bloomPass.strength = phase > 5 ? 1.5 + katanaGlow : 0.3 + katanaGlow * 0.5;
    this.vignettePass.uniforms.uProgress.value = progress;
    this.vignettePass.uniforms.uIntensity.value = phase > 3 ? 0.6 : 0.35;
  }

  render(): void {
    this.composer.render();
  }
}
