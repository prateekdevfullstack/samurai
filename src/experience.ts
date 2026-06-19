import * as THREE from 'three';
import { createRenderer, resizeRenderer } from './three/Renderer';
import { CinematicCamera } from './three/Camera';
import { SceneManager } from './three/SceneManager';
import { ScrollController } from './animations/scrollController';
import { storyTimeline } from './animations/timeline';
import { triggerSlashEffect } from './animations/cameraAnimations';
import { AudioManager } from './audio/AudioManager';

export class SamuraiExperience {
  private renderer: THREE.WebGLRenderer;
  private camera: CinematicCamera;
  private sceneManager: SceneManager;
  private scrollController: ScrollController | null = null;
  private audio = new AudioManager();
  private clock = new THREE.Clock();
  private rafId = 0;
  private disposed = false;

  private state = {
    progress: 0,
    katanaHover: 0,
    katanaGlow: 0,
    slashActive: false,
    slashTime: 0,
  };

  private mouse = { x: 0, y: 0 };
  private keys = new Set<string>();

  constructor(
    private canvas: HTMLCanvasElement,
    private scrollContainer: HTMLElement
  ) {
    this.renderer = createRenderer(canvas);
    this.camera = new CinematicCamera();
    this.sceneManager = new SceneManager(this.renderer, this.camera);
  }

  async init(): Promise<void> {
    await this.sceneManager.loadAssets();
    this.bindEvents();
    this.scrollController = new ScrollController({
      container: this.scrollContainer,
      onProgress: (progress) => {
        this.state.progress = progress;
        this.audio.updateProgress(progress);
        this.updateTypography(progress);
      },
    });
    this.scrollController.init();

    await this.audio.init();
    this.animate();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.canvas.addEventListener('mouseenter', () => {
      this.state.katanaHover = 1;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.state.katanaHover = 0;
    });
  }

  private onResize = (): void => {
    resizeRenderer(this.renderer);
    this.camera.resize();
    this.sceneManager.resize();
    this.scrollController?.refresh();
  };

  private onMouseMove = (e: MouseEvent): void => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.camera.setMouse(this.mouse.x, this.mouse.y);

    const katanaPos = this.sceneManager.getKatanaScreenPosition();
    const dist = Math.hypot(katanaPos.x - this.mouse.x, katanaPos.y - this.mouse.y);
    this.state.katanaHover = dist < 0.15 ? 1 : this.state.katanaHover * 0.95;
  };

  private onClick = async (): Promise<void> => {
    await this.audio.resume();
    this.state.slashActive = true;
    this.state.slashTime = 0;
    this.state.katanaGlow = 1;
    this.audio.playSlash();
    triggerSlashEffect(() => {
      this.state.slashActive = false;
    });
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase());
    if (['a', 'd', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };

  private updateTypography(progress: number): void {
    const timelineState = storyTimeline.getState();
    const wordEl = document.getElementById('story-word');
    if (wordEl) {
      if (timelineState.word) {
        wordEl.textContent = timelineState.word;
        wordEl.classList.add('visible');
      } else {
        wordEl.classList.remove('visible');
      }
    }

    const legacyEl = document.getElementById('legacy-word');
    if (legacyEl) {
      legacyEl.classList.toggle('visible', progress > 0.92);
    }

    const hint = document.getElementById('scroll-hint');
    if (hint) {
      hint.classList.toggle('hidden', progress > 0.02);
    }
  }

  private animate = (): void => {
    if (this.disposed) return;

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.state.slashActive) {
      this.state.slashTime += delta * 2;
      if (this.state.slashTime > 1) {
        this.state.slashActive = false;
      }
    }

    this.state.katanaGlow *= 0.98;

    if (this.keys.has('a')) this.camera.setMouse(this.mouse.x - 0.02, this.mouse.y);
    if (this.keys.has('d')) this.camera.setMouse(this.mouse.x + 0.02, this.mouse.y);

    this.sceneManager.update(
      {
        progress: this.state.progress,
        katanaHover: this.state.katanaHover,
        katanaGlow: this.state.katanaGlow,
        slashActive: this.state.slashActive,
        slashTime: this.state.slashTime,
      },
      time,
      delta
    );

    this.sceneManager.render();
    this.rafId = requestAnimationFrame(this.animate);
  };

  destroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.scrollController?.destroy();
    this.audio.destroy();
    this.renderer.dispose();
  }
}

export function initExperience(
  canvas: HTMLCanvasElement,
  scrollContainer: HTMLElement
): SamuraiExperience {
  const experience = new SamuraiExperience(canvas, scrollContainer);
  experience.init();
  return experience;
}
