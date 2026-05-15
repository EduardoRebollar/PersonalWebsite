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

const PARALLAX_X = 0.55; // world-unit horizontal sweep at pointer edge
const PARALLAX_Y = 0.25; // world-unit vertical sweep at pointer edge

/**
 * Scroll-linked camera with subtle cursor parallax.
 *
 * Per-frame:
 *   1. Lerp between active section's camera state and the next via
 *      sectionProgress (set by ScrollDriver).
 *   2. Critical-damp position / fov toward the target.
 *   3. Damp a pointer-tracker toward state.pointer (slower than the camera).
 *   4. Offset the damped lookAt vector by the pointer-tracker so the view
 *      reacts gently to mouse motion — ~0.3° in world terms.
 *
 * Parallax is skipped under reduced motion.
 */
export function CameraRig() {
  const { camera } = useThree();
  const activeSection = useSceneStore((s) => s.activeSection);
  const sectionProgress = useSceneStore((s) => s.sectionProgress);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const targetFovRef = useRef(28);
  const lookAtVec = useMemo(() => new THREE.Vector3(), []);
  const dampedPointer = useRef(new THREE.Vector2());
  const offsetLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const idx = sectionOrder.indexOf(activeSection as (typeof sectionOrder)[number]);
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx = Math.min(safeIdx + 1, sectionOrder.length - 1);

    const current = sectionStates[sectionOrder[safeIdx]!]!.camera;
    const next = sectionStates[sectionOrder[nextIdx]!]!.camera;
    const blended: CameraState = lerpCamera(current, next, sectionProgress);

    targetPos.current.set(...blended.position);
    targetLookAt.current.set(...blended.lookAt);
    targetFovRef.current = blended.fov;

    const damp = 1 - Math.pow(0.001, delta);

    camera.position.lerp(targetPos.current, damp);
    lookAtVec.lerp(targetLookAt.current, damp);

    // Cursor parallax — damp the pointer separately at a slower rate so it
    // feels like the camera is on a soft spring rather than glued to the
    // cursor. Skipped under reduced motion.
    if (!reducedMotion) {
      const pointerDamp = 1 - Math.pow(0.01, delta);
      dampedPointer.current.x +=
        (state.pointer.x - dampedPointer.current.x) * pointerDamp;
      dampedPointer.current.y +=
        (state.pointer.y - dampedPointer.current.y) * pointerDamp;
    }

    offsetLookAt.copy(lookAtVec);
    offsetLookAt.x += dampedPointer.current.x * PARALLAX_X;
    offsetLookAt.y += dampedPointer.current.y * PARALLAX_Y;
    camera.lookAt(offsetLookAt);

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
