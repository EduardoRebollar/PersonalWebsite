'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Static hero-state camera. Phase 2 will swap this for a scroll-linked rig
 * that interpolates camera state across all 7 section anchors.
 *
 * Plan spec: low FOV (~28°), camera a few units above the terrain, looking
 * forward into the fog. The terrain mesh is rotated so the displacement axis
 * is world +Y; the camera sits slightly above the plane and looks toward
 * negative Z into the fog.
 */
type CameraRigProps = {
  position?: [number, number, number];
  lookAt?: [number, number, number];
};

export function CameraRig({
  position = [0, 6, 14],
  lookAt = [0, 2, -40],
}: CameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...position);
    camera.lookAt(new THREE.Vector3(...lookAt));
    camera.updateProjectionMatrix();
  }, [camera, position, lookAt]);

  return null;
}
