'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only wrapper around the persistent canvas. next/dynamic with
 * ssr: false isn't permitted directly in a server component (app/layout.tsx),
 * so this thin client boundary handles the deferred import. The Three.js
 * stack ships in a separate chunk that loads only after the first paint.
 */
const World = dynamic(
  () => import('./World').then((m) => ({ default: m.World })),
  { ssr: false },
);

export function SceneMount() {
  return <World />;
}
