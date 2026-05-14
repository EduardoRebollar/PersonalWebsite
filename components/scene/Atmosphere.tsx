'use client';

import * as THREE from 'three';

/**
 * Scene-level lighting + background. The terrain shader does its own
 * sun-direction lighting and fog, so these scene-level lights are for any
 * future non-shader objects (Step 8+); fog here matches the shader's fog
 * color so meshes without the terrain shader will still recede into the
 * same atmosphere.
 */
export function Atmosphere() {
  return (
    <>
      <color attach="background" args={['#0a1018']} />
      <fogExp2 attach="fog" args={['#0a1018', 0.028]} />
      <ambientLight intensity={0.35} color={new THREE.Color('#3a4860')} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={0.9}
        color={new THREE.Color('#ffe2c4')}
      />
    </>
  );
}
