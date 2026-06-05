'use client';

import { GradientDots } from '@/components/ui/backgrounds/gradient-dots';
import { SplineScene } from '@/components/ui/three/SplineScene';
import { useSceneStore } from '@/stores/useSceneStore';

// Self-hosted from /public so the scene is served from Vercel's edge (with
// long-lived caching) instead of a third-party CDN round-trip — same pattern
// as the hero scene.
const SKILLS_SCENE_URL = '/spline/skills.splinecode';

/**
 * SkillsBackdrop — the animated particle field used as the Skills-section
 * backdrop, factored out so other surfaces (e.g. the LA History app) can reuse
 * the exact same scene + fallback + gating without drift.
 *
 * Fills its positioned parent (`absolute inset-0`). The parent is responsible
 * for sizing, masking, and stacking context. On capable, non-reduced-motion
 * devices it mounts the self-hosted Spline scene; everyone else gets the
 * lightweight GradientDots field.
 */
export function SkillsBackdrop() {
  // Gate the heavy Spline runtime exactly like the hero: only mount it on
  // initialized, WebGL2-capable, non-mobile devices with motion allowed.
  // Everyone else falls back to the lightweight GradientDots field.
  const initialized = useSceneStore((s) => s.initialized);
  const hasWebGL2 = useSceneStore((s) => s.hasWebGL2);
  const isMobile = useSceneStore((s) => s.isMobile);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const showSpline = initialized && hasWebGL2 && !isMobile && !reducedMotion;

  if (showSpline) {
    // The Spline scene bakes in a ~#121212 canvas background (its alpha can't
    // be overridden from react-spline), which reads as charcoal, not black. A
    // contrast filter crushes that dark grey to true black while leaving the
    // white particles white. Bump contrast if any grey remains; ease it down
    // if the particles start clipping.
    return (
      <>
        <SplineScene scene={SKILLS_SCENE_URL} className="h-full w-full [filter:contrast(1.6)]" />
        {/* The Spline runtime paints a "Built with Spline" badge in the
            bottom-right of the canvas that can't be disabled from react-spline
            (free plan). Cover it with an opaque swatch matching the
            crushed-black backdrop. */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-14 w-44 bg-background"
        />
      </>
    );
  }

  return (
    <>
      <GradientDots className="opacity-50" />
      {/* Flat scrim — only for the dense dot fallback, to darken it to black
          rather than grey. The Spline path needs none. */}
      <div className="absolute inset-0 bg-background/55" />
    </>
  );
}
