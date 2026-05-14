'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/stores/useSceneStore';
import {
  lerpCamera,
  sectionOrder,
  sectionStates,
  type CameraState,
} from './sectionStates';

/**
 * Scroll-linked camera. Reads the active section + section progress from
 * the scene store (set by ScrollDriver) and lerps between the active
 * section's camera state and the next section's. Damping smooths the
 * tail end so the camera doesn't snap on rapid scroll.
 */
export function CameraRig() {
  const { camera } = useThree();
  const activeSection = useSceneStore((s) => s.activeSection);
  const sectionProgress = useSceneStore((s) => s.sectionProgress);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const targetFovRef = useRef(28);

  const lookAtVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    const idx = sectionOrder.indexOf(activeSection as (typeof sectionOrder)[number]);
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx = Math.min(safeIdx + 1, sectionOrder.length - 1);

    const current = sectionStates[sectionOrder[safeIdx]!]!.camera;
    const next = sectionStates[sectionOrder[nextIdx]!]!.camera;

    const blended: CameraState = lerpCamera(current, next, sectionProgress);

    targetPos.current.set(...blended.position);
    targetLookAt.current.set(...blended.lookAt);
    targetFovRef.current = blended.fov;

    // Critical-damping style smoothing — Math.pow(0.001, delta) gives ~6.9
    // half-lives per second, fast enough to feel responsive without snap.
    const damp = 1 - Math.pow(0.001, delta);

    camera.position.lerp(targetPos.current, damp);

    lookAtVec.lerp(targetLookAt.current, damp);
    camera.lookAt(lookAtVec);

    if (camera instanceof THREE.PerspectiveCamera) {
      const newFov = camera.fov + (targetFovRef.current - camera.fov) * damp;
      if (Math.abs(newFov - camera.fov) > 0.001) {
        camera.fov = newFov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
