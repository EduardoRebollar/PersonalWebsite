/**
 * Per-section camera + terrain + atmosphere target states. Keys match the
 * DOM section ids on app/page.tsx.
 *
 * Phase 2 wires camera position / lookAt / fov to scroll. Terrain and
 * atmosphere uniforms are wired in P2-3 — they live here too so all the
 * "moods" are tweakable from one file.
 */

export type Vec3 = readonly [number, number, number];

export type CameraState = {
  position: Vec3;
  lookAt: Vec3;
  fov: number;
};

export type TerrainState = {
  amplitude: number;
  frequency: number;
  fogDensity: number;
  fogColor: Vec3;
  sunDirection: Vec3;
  sunColor: Vec3;
  sunIntensity: number;
};

export type SectionState = {
  camera: CameraState;
  terrain: TerrainState;
};

export const sectionOrder = [
  'hero',
  'about',
  'education',
  'experience',
  'skills',
  'work',
  'contact',
] as const;

export type SectionId = (typeof sectionOrder)[number];

const heroSun: Vec3 = [0.6, 0.7, 0.4];
const dayWarm: Vec3 = [1.0, 0.89, 0.77];
const dayCool: Vec3 = [0.78, 0.86, 1.0];
const coral: Vec3 = [1.0, 0.55, 0.4];

const baseFog: Vec3 = [0.0392, 0.0627, 0.094]; // #0a1018 normalised

export const sectionStates: Record<SectionId, SectionState> = {
  hero: {
    camera: { position: [0, 6, 14], lookAt: [0, 2, -40], fov: 28 },
    terrain: {
      amplitude: 8,
      frequency: 0.025,
      fogDensity: 0.028,
      fogColor: baseFog,
      sunDirection: heroSun,
      sunColor: dayWarm,
      sunIntensity: 0.9,
    },
  },
  about: {
    camera: { position: [0, 10, 16], lookAt: [0, 4, -40], fov: 32 },
    terrain: {
      amplitude: 6,
      frequency: 0.022,
      fogDensity: 0.022,
      fogColor: baseFog,
      sunDirection: [0.3, 0.8, 0.3],
      sunColor: dayCool,
      sunIntensity: 1.0,
    },
  },
  education: {
    camera: { position: [0, 14, 12], lookAt: [0, 0, -20], fov: 30 },
    terrain: {
      amplitude: 5,
      frequency: 0.03,
      fogDensity: 0.024,
      fogColor: baseFog,
      sunDirection: [0.0, 1.0, 0.2],
      sunColor: dayCool,
      sunIntensity: 0.85,
    },
  },
  experience: {
    camera: { position: [-3, 5, 12], lookAt: [4, 2, -40], fov: 28 },
    terrain: {
      amplitude: 10,
      frequency: 0.04,
      fogDensity: 0.02,
      fogColor: baseFog,
      sunDirection: [-0.7, 0.5, 0.3],
      sunColor: dayWarm,
      sunIntensity: 0.95,
    },
  },
  skills: {
    camera: { position: [0, 20, 18], lookAt: [0, 2, -25], fov: 34 },
    terrain: {
      amplitude: 3.5,
      frequency: 0.018,
      fogDensity: 0.018,
      fogColor: baseFog,
      sunDirection: [0.0, 1.0, 0.0],
      sunColor: dayCool,
      sunIntensity: 1.0,
    },
  },
  work: {
    camera: { position: [4, 11, 14], lookAt: [-2, 2, -32], fov: 30 },
    terrain: {
      amplitude: 9,
      frequency: 0.028,
      fogDensity: 0.022,
      fogColor: baseFog,
      sunDirection: [0.8, 0.4, 0.3],
      sunColor: coral,
      sunIntensity: 0.9,
    },
  },
  contact: {
    camera: { position: [0, 30, 14], lookAt: [0, 6, -30], fov: 38 },
    terrain: {
      amplitude: 5,
      frequency: 0.022,
      fogDensity: 0.032,
      fogColor: baseFog,
      sunDirection: [0.4, 0.25, 0.4],
      sunColor: coral,
      sunIntensity: 0.7,
    },
  },
};

/**
 * Linear interpolate between two section states given a 0..1 t.
 */
export function lerpCamera(a: CameraState, b: CameraState, t: number): CameraState {
  return {
    position: [
      a.position[0] + (b.position[0] - a.position[0]) * t,
      a.position[1] + (b.position[1] - a.position[1]) * t,
      a.position[2] + (b.position[2] - a.position[2]) * t,
    ],
    lookAt: [
      a.lookAt[0] + (b.lookAt[0] - a.lookAt[0]) * t,
      a.lookAt[1] + (b.lookAt[1] - a.lookAt[1]) * t,
      a.lookAt[2] + (b.lookAt[2] - a.lookAt[2]) * t,
    ],
    fov: a.fov + (b.fov - a.fov) * t,
  };
}

export function lerpTerrain(a: TerrainState, b: TerrainState, t: number): TerrainState {
  const lerp3 = (u: Vec3, v: Vec3): Vec3 => [
    u[0] + (v[0] - u[0]) * t,
    u[1] + (v[1] - u[1]) * t,
    u[2] + (v[2] - u[2]) * t,
  ];
  return {
    amplitude: a.amplitude + (b.amplitude - a.amplitude) * t,
    frequency: a.frequency + (b.frequency - a.frequency) * t,
    fogDensity: a.fogDensity + (b.fogDensity - a.fogDensity) * t,
    fogColor: lerp3(a.fogColor, b.fogColor),
    sunDirection: lerp3(a.sunDirection, b.sunDirection),
    sunColor: lerp3(a.sunColor, b.sunColor),
    sunIntensity: a.sunIntensity + (b.sunIntensity - a.sunIntensity) * t,
  };
}
