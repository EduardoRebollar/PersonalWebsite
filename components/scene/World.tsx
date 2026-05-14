'use client';

import { Canvas } from '@react-three/fiber';
import { useSceneStore, selectShouldRenderScene } from '@/stores/useSceneStore';
import { Atmosphere } from './Atmosphere';
import { CameraRig } from './CameraRig';
import { Terrain } from './Terrain';

/**
 * The persistent canvas. Fixed-positioned behind all DOM; never unmounts
 * between sections. Gated on selectShouldRenderScene — when lite mode is on
 * (auto or user-toggled) or WebGL2 is missing, we render nothing and the DOM
 * sits directly on the page background.
 *
 * Mounted once in app/layout.tsx via a dynamic import (ssr: false) so the
 * Three.js stack never ships with the initial server render.
 */
export function World() {
  const shouldRender = useSceneStore(selectShouldRenderScene);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        camera={{ fov: 28, near: 0.1, far: 220, position: [0, 6, 14] }}
        dpr={[1, 2]}
      >
        <Atmosphere />
        <CameraRig />
        <Terrain />
      </Canvas>
    </div>
  );
}
