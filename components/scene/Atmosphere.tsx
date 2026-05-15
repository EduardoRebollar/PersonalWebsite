'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/stores/useSceneStore';
import { lerpTerrain, sectionOrder, sectionStates } from './sectionStates';

/**
 * Scene-level fog + background + lights.
 *
 * The terrain shader does its own fog & sun lighting, so these aren't
 * applied to it — but the scene background fills any sky / horizon pixels
 * the terrain doesn't cover, and the scene fog will apply to non-terrain
 * meshes we add later. Both morph with the active section so the horizon
 * tracks the section mood.
 */
export function Atmosphere() {
  const { scene } = useThree();
  const activeSection = useSceneStore((s) => s.activeSection);
  const sectionProgress = useSceneStore((s) => s.sectionProgress);

  // Scene background + fog instances are stored once; we just mutate their
  // .color / .density each frame so we never thrash THREE allocations.
  const bgColor = useMemo(() => new THREE.Color('#0a1018'), []);
  const fog = useMemo(() => new THREE.FogExp2('#0a1018', 0.028), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    scene.background = bgColor;
    scene.fog = fog;
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, bgColor, fog]);

  useFrame((_state, delta) => {
    const idx = sectionOrder.indexOf(activeSection as (typeof sectionOrder)[number]);
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx = Math.min(safeIdx + 1, sectionOrder.length - 1);

    const current = sectionStates[sectionOrder[safeIdx]!]!.terrain;
    const next = sectionStates[sectionOrder[nextIdx]!]!.terrain;
    const blended = lerpTerrain(current, next, sectionProgress);

    const damp = 1 - Math.pow(0.001, delta);

    scratch.setRGB(...blended.fogColor);
    bgColor.lerp(scratch, damp);
    fog.color.lerp(scratch, damp);
    fog.density += (blended.fogDensity - fog.density) * damp;
  });

  return (
    <>
      <ambientLight intensity={0.35} color={new THREE.Color('#3a4860')} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={0.9}
        color={new THREE.Color('#ffe2c4')}
      />
    </>
  );
}
