import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { storyTimeline } from './timeline';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollControllerOptions {
  container: HTMLElement;
  onProgress: (progress: number) => void;
}

export class ScrollController {
  private trigger: ScrollTrigger | null = null;
  private lenis: Lenis | null = null;
  private readonly tickerCallback = (time: number) => {
    this.lenis?.raf(time * 1000);
  };

  constructor(private options: ScrollControllerOptions) {}

  init(): void {
    const { container, onProgress } = this.options;

    this.lenis = new Lenis({
      lerp: 0.08,
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      infinite: false,
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(this.tickerCallback);
    gsap.ticker.lagSmoothing(0);

    this.trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        storyTimeline.setProgress(progress);
        onProgress(progress);
      },
    });

    ScrollTrigger.refresh();
  }

  scrollToScene(index: number): void {
    if (!this.lenis || !this.trigger) return;

    const progress = Math.max(0, Math.min(1, index / 7));
    const target =
      this.trigger.start + (this.trigger.end - this.trigger.start) * progress;

    this.lenis.scrollTo(target, {
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  }

  getLenis(): Lenis | null {
    return this.lenis;
  }

  destroy(): void {
    gsap.ticker.remove(this.tickerCallback);
    this.lenis?.destroy();
    this.lenis = null;
    this.trigger?.kill();
    this.trigger = null;
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  refresh(): void {
    this.lenis?.resize();
    ScrollTrigger.refresh();
  }
}
