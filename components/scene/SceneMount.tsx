'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useIsLaHistoryDemoRoute } from '@/lib/laHistory/route';

/**
 * Client-only canvas mount. We deliberately do NOT use next/dynamic({ ssr:
 * false }) here because Next 16 aborts the surrounding SSR subtree, leaving
 * a BAILOUT_TO_CLIENT_SIDE_RENDERING marker in the HTML that can leave the
 * client with a partial hydration tree.
 *
 * Instead we import World lazily inside a post-mount effect. The Three.js
 * stack stays in its own chunk (the import() call is the code-split point),
 * but the module never loads — and never evaluates R3F — during SSR.
 */
export function SceneMount() {
  const [World, setWorld] = useState<ComponentType | null>(null);
  const isDemoRoute = useIsLaHistoryDemoRoute();

  useEffect(() => {
    if (isDemoRoute) return;
    let cancelled = false;
    import('./World').then((mod) => {
      if (cancelled) return;
      setWorld(() => mod.World);
    });
    return () => {
      cancelled = true;
    };
  }, [isDemoRoute]);

  if (isDemoRoute || !World) return null;
  return <World />;
}
