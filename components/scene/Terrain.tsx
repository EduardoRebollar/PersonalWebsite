'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainFragmentShader, terrainVertexShader } from './shaders/terrain';

const TERRAIN_SIZE = 200;
const TERRAIN_SEGMENTS = 256;

const PALETTE_LOW = new THREE.Color('#0a1018');
const PALETTE_MID = new THREE.Color('#1a2c44');
const PALETTE_HIGH = new THREE.Color('#8fa8ff');
const PALETTE_FOG = new THREE.Color('#0a1018');
const PALETTE_SUN = new THREE.Color('#ffe2c4');
const PALETTE_AMBIENT = new THREE.Color('#3a4860');

/**
 * Procedural terrain — single high-poly plane with vertex displacement.
 * Wireframe overlay sits on top of the solid mesh; both share the same
 * geometry and uniforms so they morph together.
 *
 * Animation: uTime drives a slow noise time-shift (~0.05 units/sec) for the
 * "breathing" idle state described in the plan.
 */
export function Terrain() {
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 8.0 },
      uFrequency: { value: 0.025 },
      uTimeScale: { value: 0.05 },
      uColorLow: { value: PALETTE_LOW },
      uColorMid: { value: PALETTE_MID },
      uColorHigh: { value: PALETTE_HIGH },
      uFogColor: { value: PALETTE_FOG },
      uFogDensity: { value: 0.028 },
      uSunDirection: { value: new THREE.Vector3(0.6, 0.7, 0.4).normalize() },
      uSunColor: { value: PALETTE_SUN },
      uSunIntensity: { value: 0.9 },
      uAmbientColor: { value: PALETTE_AMBIENT },
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

  useFrame((_state, delta) => {
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
