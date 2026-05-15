'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { selectShouldRenderScene, useSceneStore } from '@/stores/useSceneStore';

/**
 * Dev-only HUD that surfaces the inputs feeding the auto-lite decision.
 * Renders nothing in production unless `?debug=scene` is in the URL.
 *
 * Also emits a one-shot console.log when `initialize` first fires, so a
 * deployed preview can be diagnosed without rebuilding.
 */
export function SceneDiagnostics() {
  const initialized = useSceneStore((s) => s.initialized);
  const hasWebGL2 = useSceneStore((s) => s.hasWebGL2);
  const isMobile = useSceneStore((s) => s.isMobile);
  const gpuTier = useSceneStore((s) => s.gpuTier);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const liteMode = useSceneStore((s) => s.liteMode);
  const liteModeOverridden = useSceneStore((s) => s.liteModeOverridden);
  const shouldRender = useSceneStore(selectShouldRenderScene);

  const isClient = useIsClient();
  const enabled =
    isClient &&
    (process.env.NODE_ENV !== 'production' ||
      new URLSearchParams(window.location.search).has('debug'));

  const loggedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !initialized || loggedRef.current) return;
    console.log('[scene-diagnostics]', {
      initialized,
      hasWebGL2,
      isMobile,
      gpuTier,
      reducedMotion,
      liteMode,
      liteModeOverridden,
      shouldRender,
    });
    loggedRef.current = true;
  }, [
    enabled,
    initialized,
    hasWebGL2,
    isMobile,
    gpuTier,
    reducedMotion,
    liteMode,
    liteModeOverridden,
    shouldRender,
  ]);

  if (!enabled) return null;

  const trigger = !initialized
    ? 'not initialized'
    : !hasWebGL2
      ? '!hasWebGL2'
      : isMobile
        ? 'isMobile'
        : gpuTier <= 1
          ? `gpuTier ≤ 1 (got ${gpuTier})`
          : reducedMotion
            ? 'reducedMotion'
            : liteModeOverridden && liteMode
              ? 'user override'
              : 'none — should render';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 bottom-3 z-[999] rounded-md border border-hairline bg-black/70 px-3 py-2 font-mono text-[10px] leading-tight text-white/80 backdrop-blur-md"
    >
      <div className="mb-1 text-[9px] tracking-wider text-white/50 uppercase">
        scene diagnostics
      </div>
      <Row k="initialized" v={String(initialized)} />
      <Row k="hasWebGL2" v={String(hasWebGL2)} ok={hasWebGL2} />
      <Row k="isMobile" v={String(isMobile)} ok={!isMobile} />
      <Row k="gpuTier" v={String(gpuTier)} ok={gpuTier > 1} />
      <Row k="reducedMotion" v={String(reducedMotion)} ok={!reducedMotion} />
      <Row k="liteMode" v={String(liteMode)} ok={!liteMode} />
      <Row k="overridden" v={String(liteModeOverridden)} />
      <Row k="shouldRender" v={String(shouldRender)} ok={shouldRender} />
      <div className="mt-1 border-t border-white/10 pt-1 text-white/60">
        trigger: <span className="text-white">{trigger}</span>
      </div>
    </div>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  const color = ok === undefined ? 'text-white/80' : ok ? 'text-emerald-300' : 'text-rose-300';
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/50">{k}</span>
      <span className={color}>{v}</span>
    </div>
  );
}

const noopSubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot);
}
