# The Last Samurai

An immersive, scroll-driven cinematic web experience built with Astro, Three.js, GSAP, and custom GLSL shaders.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) and scroll to experience the journey.

## Controls

- **Scroll** — Primary narrative driver (camera, animations, scene transitions)
- **Mouse** — Subtle camera parallax
- **Click** — Katana slash effect with sparks and sound
- **A / D** — Subtle lateral camera drift (optional)

## Tech Stack

- Astro 6
- Three.js with post-processing (Bloom, SSAO, vignette)
- GSAP + ScrollTrigger
- Custom GLSL shaders (fog, fire, smoke, rain, sakura, wind, water, ink)
- Web Audio API procedural soundtrack

## Project Structure

```
src/
├── components/     Scene1–7.astro scroll sections
├── three/          Renderer, Camera, Lights, SceneManager, shaders
├── shaders/        GLSL effect files
├── animations/     Timeline, scroll controller, camera animations
├── audio/          Procedural audio manager
└── experience.ts   Main entry point
```

## Adding Assets

Place compressed GLB models in `public/assets/`:

- `katana.glb`, `samurai.glb`, `battlefield.glb`, `temple.glb`

The loader falls back to procedural geometry when assets are missing.

Place audio files in `public/audio/`:

- `ambience.mp3`, `drums.mp3`, `battle.mp3`, `flute.mp3`

## Build

```bash
npm run build
npm run preview
```

## Performance

- InstancedMesh for bamboo, grass, and battle flags
- Frustum culling enabled by default
- Pixel ratio capped at 2×
- Lazy asset loading with procedural fallbacks
