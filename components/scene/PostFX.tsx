'use client';

import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Post-processing stack. Quality-tiered by GPU:
 *
 *   tier 3 (high):  bloom + grain + vignette
 *   tier 2 (mid):   grain + vignette (bloom is the expensive one)
 *   tier 1 (low):   nothing (and we shouldn't be here — auto-lite engages)
 *
 * Values are deliberately subtle: a portfolio at "atmospheric-cinematic"
 * shouldn't read as a video-game screenshot. The plan calls this out
 * explicitly — no chromatic aberration, no RGB-shift.
 */
export function PostFX() {
  const gpuTier = useSceneStore((s) => s.gpuTier);
  const initialized = useSceneStore((s) => s.initialized);

  if (!initialized) return null;
  if (gpuTier <= 1) return null;

  const enableBloom = gpuTier >= 3;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {enableBloom ? (
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      ) : (
        <></>
      )}
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.15} darkness={0.55} />
    </EffectComposer>
  );
}
