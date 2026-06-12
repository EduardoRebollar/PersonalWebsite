'use client';

import { ShootingStars } from './shooting-stars';
import { StarsBackground } from './stars-background';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * PageStarfield — the homepage's single shared starfield sky.
 *
 * Previously each of the six homepage sections mounted its own StarsBackground
 * + three ShootingStars (24 canvases / rAF loops, all hydrating on load). This
 * consolidates them into one fixed-viewport field: one twinkle canvas + three
 * shooting-star streaks. ShootingStars already animate in *viewport* coordinates
 * (`window.innerWidth/Height`), so a fixed mount is faithful for them. The field
 * is viewport-fixed: stars twinkle in place but do not move with scroll. (A
 * scroll-coupled and an autonomous-drift variant were both tried and dropped —
 * see CLAUDE.md.)
 *
 * Stacking: rendered inside <main> (via app/page.tsx) as a viewport-fixed field
 * at z-index -2. That sits *below* all section content (normal flow / z ≥ 0) but
 * *above* any section background pseudo (kept at -2 rather than a deeper -z-10 as
 * defensive headroom — sections layer decorative `::before`s behind their
 * content). An earlier version portaled this behind <main>, which let an opaque
 * in-section background cover it (the About section once carried a full-bleed
 * grid/vignette `::before`, since removed) — hence the move back inside <main>.
 * Because it lives in <main> (relative z-10), the later <footer> sibling (also
 * z-10) still paints above it, so no stars bleed over the footer (its own
 * translucent, backdrop-blurred bar handles the page bottom). The single top
 * mask fades the field in under the fixed nav on every section. Mounted only by
 * app/page.tsx, so the /work case-study pages — which use their own
 * BackgroundBeams / Spline backdrops — are untouched.
 *
 * Reduced-motion users get nothing (matches the per-section behaviour, where
 * StarsBackground / ShootingStars each returned null). The field is always in
 * the viewport, so unlike the old per-section mounts it needs no offscreen
 * pause — there is only one loop and it is always on screen.
 */
export function PageStarfield() {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-2] mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_7%,black_100%)]"
    >
      <StarsBackground />
      {/* Each instance animates one streak at a time; three run in parallel
          (staggered delays) to keep multiple shooting stars on screen. */}
      <ShootingStars minDelay={400} maxDelay={1800} />
      <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
      <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
    </div>
  );
}
