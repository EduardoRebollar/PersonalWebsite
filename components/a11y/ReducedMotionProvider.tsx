'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ReducedMotionContextValue = {
  reducedMotion: boolean;
};

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  reducedMotion: false,
});

/**
 * Subscribes to the OS-level prefers-reduced-motion media query.
 * Step 5 will fold this into useSceneStore so the in-app lite-mode toggle
 * can override the OS preference. For now it's read-only.
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const value = useMemo(() => ({ reducedMotion }), [reducedMotion]);

  return <ReducedMotionContext.Provider value={value}>{children}</ReducedMotionContext.Provider>;
}

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext).reducedMotion;
}
