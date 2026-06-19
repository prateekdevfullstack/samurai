import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { storyTimeline } from './timeline';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollControllerOptions {
  container: HTMLElement;
  onProgress: (progress: number) => void;
}

export class ScrollController {
  private trigger: ScrollTrigger | null = null;

  constructor(private options: ScrollControllerOptions) {}

  init(): void {
    const { container, onProgress } = this.options;

    this.trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        storyTimeline.setProgress(progress);
        onProgress(progress);
      },
    });

    ScrollTrigger.refresh();
  }

  scrollToScene(index: number): void {
    if (!this.trigger) return;
    const progress = index / 7;
    const scrollPos = this.trigger.start + (this.trigger.end - this.trigger.start) * progress;
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
  }

  destroy(): void {
    this.trigger?.kill();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }
}
