import gsap from 'gsap';

export interface TimelineState {
  progress: number;
  sceneIndex: number;
  sceneProgress: number;
  word: string | null;
}

const SCENE_WORDS = [
  null,
  'Honor',
  'Loyalty',
  'Duty',
  'Courage',
  'Sacrifice',
  null,
  'Legacy',
];

export class StoryTimeline {
  private state: TimelineState = {
    progress: 0,
    sceneIndex: 0,
    sceneProgress: 0,
    word: null,
  };

  private listeners: ((state: TimelineState) => void)[] = [];

  getState(): TimelineState {
    return { ...this.state };
  }

  setProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    const sceneIndex = Math.min(Math.floor(clamped * 7), 6);
    const sceneProgress = clamped * 7 - sceneIndex;

    let word: string | null = null;
    if (sceneProgress > 0.3 && sceneProgress < 0.7) {
      word = SCENE_WORDS[sceneIndex] ?? null;
    }
    if (clamped > 0.95) word = 'Legacy';

    this.state = {
      progress: clamped,
      sceneIndex,
      sceneProgress,
      word,
    };

    this.listeners.forEach((fn) => fn(this.state));
  }

  onUpdate(fn: (state: TimelineState) => void): void {
    this.listeners.push(fn);
  }

  animateTo(target: number, duration = 1): gsap.core.Tween {
    const proxy = { value: this.state.progress };
    return gsap.to(proxy, {
      value: target,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => this.setProgress(proxy.value),
    });
  }
}

export const storyTimeline = new StoryTimeline();
