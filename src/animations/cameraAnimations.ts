import gsap from 'gsap';
import type { CinematicCamera } from '../three/Camera';

export function animateCameraOrbit(
  camera: CinematicCamera,
  duration: number,
  radius: number
): gsap.core.Tween {
  const proxy = { angle: 0 };
  return gsap.to(proxy, {
    angle: Math.PI * 2,
    duration,
    ease: 'none',
    onUpdate: () => {
      camera.camera.position.x = Math.sin(proxy.angle) * radius;
      camera.camera.position.z = Math.cos(proxy.angle) * radius;
    },
  });
}

export function animateSlowMotion(duration = 0.5): gsap.core.Tween {
  const proxy = { timeScale: 1 };
  const tween = gsap.to(proxy, {
    timeScale: 0.15,
    duration: duration * 0.3,
    ease: 'power2.out',
    onUpdate: () => {
      gsap.globalTimeline.timeScale(proxy.timeScale);
    },
  });

  gsap.delayedCall(duration, () => {
    gsap.to(proxy, {
      timeScale: 1,
      duration: duration * 0.5,
      onUpdate: () => {
        gsap.globalTimeline.timeScale(proxy.timeScale);
      },
    });
  });

  return tween;
}

export function triggerSlashEffect(onComplete?: () => void): gsap.core.Timeline {
  const tl = gsap.timeline({ onComplete });
  tl.to({}, { duration: 0.05 });
  tl.add(() => animateSlowMotion(0.8));
  return tl;
}
