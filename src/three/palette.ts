/**
 * Ghost of Tsushima–inspired color palette.
 * Golden hour warmth, lush fields, vermillion accents, atmospheric haze.
 */
export const GOT = {
  skyDawn: 0xe8a85c,
  skyWarm: 0xf0c878,
  skyAmber: 0xd4924a,
  fogGold: 0xf0dcc0,
  fogMist: 0xe8e0d0,
  fogPurple: 0x8a7a9a,

  grass: 0x6b8f3a,
  grassTip: 0xa8c45a,
  ground: 0x3d5c32,
  bamboo: 0x2a4a38,
  mountain: 0x5a6a7a,
  mountainFar: 0x7a8a9a,
  water: 0x3a7a8c,
  waterDeep: 0x1a4a5a,

  sakura: 0xf2a8b0,
  maple: 0xc44a3a,

  torii: 0xc41e3a,
  flag: 0x9b1b30,

  robe: 0xe8e4dc,
  hakama: 0x1c1c28,
  cape: 0x2a3040,

  sun: 0xffb84d,
  sunLow: 0xff9030,
  rim: 0xffa060,
  ambient: 0x4a6a58,
  guideWind: 0xf5c542,

  bloodSky: 0x4a1818,
  smoke: 0x2a2028,
  ember: 0xff6020,
  ink: 0x0c0c0c,

  rain: 0x4a5a6a,
  silver: 0xb8c0c8,
} as const;

export interface ScenePalette {
  bg: number;
  fog: number;
  density: number;
  sun: number;
  ambient: number;
  sunInt: number;
  ambInt: number;
  rimInt: number;
  bloom: number;
}

export const SCENE_PALETTES: ScenePalette[] = [
  {
    bg: 0xc8a060,
    fog: 0xf0dcc8,
    density: 0.018,
    sun: 0xffb84d,
    ambient: 0x5a7a48,
    sunInt: 1.6,
    ambInt: 0.45,
    rimInt: 0.7,
    bloom: 0.55,
  },
  {
    bg: 0xd4a868,
    fog: 0xf0e0c0,
    density: 0.015,
    sun: 0xffa840,
    ambient: 0x5a6a48,
    sunInt: 1.4,
    ambInt: 0.4,
    rimInt: 0.6,
    bloom: 0.5,
  },
  {
    bg: 0xe0b060,
    fog: 0xf5e8c8,
    density: 0.012,
    sun: 0xff9830,
    ambient: 0x6a5a40,
    sunInt: 1.7,
    ambInt: 0.42,
    rimInt: 0.75,
    bloom: 0.6,
  },
  {
    bg: 0x5a2828,
    fog: 0x3a2028,
    density: 0.028,
    sun: 0xcc4020,
    ambient: 0x2a1818,
    sunInt: 0.7,
    ambInt: 0.18,
    rimInt: 0.25,
    bloom: 0.35,
  },
  {
    bg: 0x4a2020,
    fog: 0x2a1818,
    density: 0.032,
    sun: 0xff5020,
    ambient: 0x1a1010,
    sunInt: 0.9,
    ambInt: 0.12,
    rimInt: 0.35,
    bloom: 0.45,
  },
  {
    bg: 0x1a1010,
    fog: 0x0a0808,
    density: 0.04,
    sun: 0xffe8c0,
    ambient: 0x080808,
    sunInt: 2.2,
    ambInt: 0.04,
    rimInt: 0.1,
    bloom: 1.2,
  },
  {
    bg: 0x3a4a58,
    fog: 0x6a7a88,
    density: 0.022,
    sun: 0xa0b0c0,
    ambient: 0x2a3848,
    sunInt: 0.35,
    ambInt: 0.35,
    rimInt: 0.2,
    bloom: 0.25,
  },
];

function lerpHex(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bVal = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bVal;
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpScenePalette(phase: number): ScenePalette {
  const idx = Math.min(Math.floor(phase), SCENE_PALETTES.length - 1);
  const next = SCENE_PALETTES[Math.min(idx + 1, SCENE_PALETTES.length - 1)];
  const t = phase - idx;
  const cur = SCENE_PALETTES[idx];

  return {
    bg: lerpHex(cur.bg, next.bg, t),
    fog: lerpHex(cur.fog, next.fog, t),
    density: lerpNum(cur.density, next.density, t),
    sun: lerpHex(cur.sun, next.sun, t),
    ambient: lerpHex(cur.ambient, next.ambient, t),
    sunInt: lerpNum(cur.sunInt, next.sunInt, t),
    ambInt: lerpNum(cur.ambInt, next.ambInt, t),
    rimInt: lerpNum(cur.rimInt, next.rimInt, t),
    bloom: lerpNum(cur.bloom, next.bloom, t),
  };
}
