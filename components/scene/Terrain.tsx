'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainFragmentShader, terrainVertexShader } from './shaders/terrain';
import { useSceneStore } from '@/stores/useSceneStore';
import {
  lerpTerrain,
  sectionOrder,
  sectionStates,
  type TerrainState,
} from './sectionStates';

const TERRAIN_SIZE = 200;
const TERRAIN_SEGMENTS = 256;

const initial: TerrainState = sectionStates.hero.terrain;

/**
 * Procedural terrain. Vertex shader runs FBM displacement; fragment shader
 * does height/slope shading + sun + fog. Phase 2 wires the uniforms to
 * section state so the look (amplitude, frequency, fog, sun) morphs as
 * the user scrolls. Damped per-frame so transitions feel cinematic, not
 * snappy.
 */
export function Terrain() {
  const { camera } = useThree();
  const activeSection = useSceneStore((s) => s.activeSection);
  const sectionProgress = useSceneStore((s) => s.sectionProgress);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: initial.amplitude },
      uFrequency: { value: initial.frequency },
      uTimeScale: { value: 0.05 },
      uColorLow: { value: new THREE.Color('#0a1018') },
      uColorMid: { value: new THREE.Color('#1a2c44') },
      uColorHigh: { value: new THREE.Color('#8fa8ff') },
      uFogColor: { value: new THREE.Color().setRGB(...initial.fogColor) },
      uFogDensity: { value: initial.fogDensity },
      uSunDirection: {
        value: new THREE.Vector3(...initial.sunDirection).normalize(),
      },
      uSunColor: { value: new THREE.Color().setRGB(...initial.sunColor) },
      uSunIntensity: { value: initial.sunIntensity },
      uAmbientColor: { value: new THREE.Color('#3a4860') },
      uAmbientIntensity: { value: 0.35 },
      uHeightRange: { value: 16.0 },
      uCameraPos: { value: new THREE.Vector3() },
    }),
    [],
  );

  const solidMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        side: THREE.FrontSide,
      }),
    [uniforms],
  );

  const wireMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    [uniforms],
  );

  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  // Scratch vectors to avoid allocations in useFrame.
  const scratchFogColor = useMemo(() => new THREE.Color(), []);
  const scratchSunColor = useMemo(() => new THREE.Color(), []);
  const scratchSunDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    const idx = sectionOrder.indexOf(activeSection as (typeof sectionOrder)[number]);
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx = Math.min(safeIdx + 1, sectionOrder.length - 1);

    const current = sectionStates[sectionOrder[safeIdx]!]!.terrain;
    const next = sectionStates[sectionOrder[nextIdx]!]!.terrain;
    const blended = lerpTerrain(current, next, sectionProgress);

    // Damped frame-to-frame smoothing toward the section target.
    const damp = 1 - Math.pow(0.001, delta);

    uniforms.uAmplitude.value += (blended.amplitude - uniforms.uAmplitude.value) * damp;
    uniforms.uFrequency.value += (blended.frequency - uniforms.uFrequency.value) * damp;
    uniforms.uFogDensity.value += (blended.fogDensity - uniforms.uFogDensity.value) * damp;
    uniforms.uSunIntensity.value +=
      (blended.sunIntensity - uniforms.uSunIntensity.value) * damp;

    scratchFogColor.setRGB(...blended.fogColor);
    uniforms.uFogColor.value.lerp(scratchFogColor, damp);

    scratchSunColor.setRGB(...blended.sunColor);
    uniforms.uSunColor.value.lerp(scratchSunColor, damp);

    scratchSunDir.set(...blended.sunDirection).normalize();
    uniforms.uSunDirection.value.lerp(scratchSunDir, damp);

    // Continuous: time advances unconditionally, camera position syncs to
    // the (now scroll-driven) camera each frame for shader-space fog.
    uniforms.uTime.value += delta;
    uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={solidRef} material={solidMaterial}>
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS]} />
      </mesh>
      <mesh ref={wireRef} material={wireMaterial} position={[0, 0, 0.01]}>
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS]} />
      </mesh>
    </group>
  );
}
