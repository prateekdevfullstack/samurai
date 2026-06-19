import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { lerpScenePalette } from './palette';

export class PostProcessing {
  readonly composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private colorGradePass: ShaderPass;
  private vignettePass: ShaderPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    const ssao = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
    ssao.kernelRadius = 6;
    ssao.minDistance = 0.004;
    ssao.maxDistance = 0.08;
    this.composer.addPass(ssao);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,
      0.6,
      0.72
    );
    this.composer.addPass(this.bloomPass);

    this.colorGradePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uWarmth: { value: 0.6 },
        uSaturation: { value: 1.15 },
        uContrast: { value: 1.08 },
        uPhase: { value: 0 },
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
        uniform float uWarmth;
        uniform float uSaturation;
        uniform float uContrast;
        uniform float uPhase;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec3 c = color.rgb;

          float luma = dot(c, vec3(0.299, 0.587, 0.114));
          c = mix(vec3(luma), c, uSaturation);

          c.r += uWarmth * 0.06;
          c.g += uWarmth * 0.02;
          c.b -= uWarmth * 0.04;

          c = (c - 0.5) * uContrast + 0.5;

          if (uPhase > 3.0) {
            float battle = smoothstep(3.0, 4.5, uPhase);
            c.r = mix(c.r, c.r * 1.2 + 0.05, battle);
            c.g = mix(c.g, c.g * 0.7, battle);
            c.b = mix(c.b, c.b * 0.6, battle);
          }

          if (uPhase > 5.5) {
            float rain = smoothstep(5.5, 6.5, uPhase);
            c = mix(c, vec3(dot(c, vec3(0.299, 0.587, 0.114))) * vec3(0.85, 0.9, 1.05), rain * 0.6);
          }

          color.rgb = clamp(c, 0.0, 1.0);
          gl_FragColor = color;
        }
      `,
    });
    this.composer.addPass(this.colorGradePass);

    this.vignettePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uIntensity: { value: 0.45 },
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
          float vignette = 1.0 - dot(center, center) * uIntensity * 2.2;
          float fade = smoothstep(0.88, 1.0, uProgress) * 0.85;
          color.rgb *= vignette;
          color.rgb = mix(color.rgb, vec3(0.95, 0.92, 0.88), fade);
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
    const palette = lerpScenePalette(phase);

    this.bloomPass.strength = palette.bloom + katanaGlow * 0.6;
    this.bloomPass.threshold = phase > 3 ? 0.55 : 0.35;

    this.colorGradePass.uniforms.uWarmth.value = phase < 3.5 ? 0.7 : phase > 5 ? 0.1 : 0.2;
    this.colorGradePass.uniforms.uSaturation.value = phase < 3.5 ? 1.2 : 0.85;
    this.colorGradePass.uniforms.uContrast.value = phase > 5 ? 1.15 : 1.08;
    this.colorGradePass.uniforms.uPhase.value = phase;

    this.vignettePass.uniforms.uProgress.value = progress;
    this.vignettePass.uniforms.uIntensity.value = phase > 3 ? 0.65 : 0.45;
  }

  render(): void {
    this.composer.render();
  }
}
