/**
 * Pure, React-free device capability checks. Consumers run these inside a
 * useEffect (since they all touch `window` / `document`) and write the
 * results to useSceneStore.
 */

export function detectWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function mobileViewportMatcher(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  return window.matchMedia('(max-width: 767px)');
}

export function reducedMotionMatcher(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}
