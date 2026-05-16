'use client';

import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline/next'));

type SplineSceneProps = {
  scene: string;
  className?: string;
};

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span
            aria-hidden="true"
            className="inline-block size-6 animate-pulse rounded-full bg-fg-mute/40"
          />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
