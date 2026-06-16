'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Cross-page fade transition.
 *
 * Intercepts same-origin link clicks that change the route (e.g. the Work
 * section's "Read case study" → /work/<slug>) and replaces the instant Next
 * navigation with: quick fade-to-black → jump to the top under cover →
 * fade back in once the new route has mounted.
 *
 * The click listener runs in the **capture phase** and only `preventDefault`s
 * (never `stopPropagation`): that suppresses Next `<Link>`'s own navigation
 * (it skips when the event is already default-prevented) while still letting
 * the anchor's React `onClick` fire — so RippleLink's ripple still plays.
 *
 * Reduced motion opts out entirely (native instant navigation).
 */

const FADE_OUT_MS = 200; // content → fully covered
const FADE_IN_MS = 600; // covered → content revealed

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const [covering, setCovering] = useState(false);
  // A navigation *we* initiated — the signal to fade back in. `toTop` is false
  // for hash targets (e.g. /#work) so their anchor scroll is preserved.
  const pendingRef = useRef<{ pathname: string; toTop: boolean } | null>(null);

  // Once the route we pushed has mounted, jump to the top under the cover (for
  // bare-path targets only) and reveal it on the next frame (so the scroll +
  // first paint land before the fade-in).
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || pending.pathname !== pathname) return;
    pendingRef.current = null;
    // `behavior: 'instant'` overrides the global `scroll-behavior: smooth` so
    // the jump lands in one frame under the cover — otherwise it glides into
    // place *after* the fade-in has already started.
    if (pending.toTop) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Reveal a frame later, so the instant scroll + first paint settle first.
    const id = requestAnimationFrame(() => setCovering(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (reducedMotion) return;

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // Skip cross-origin links and same-page navigation (pure hashes, the
      // in-page nav/scroll handlers) — those keep their native behavior.
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      pendingRef.current = { pathname: url.pathname, toTop: !url.hash };
      setCovering(true);
      window.setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
      }, FADE_OUT_MS);
    }

    // Capture phase → run before Next <Link>'s own click handler.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [reducedMotion, router]);

  return (
    <div
      aria-hidden="true"
      className="route-transition"
      data-covering={covering ? 'true' : undefined}
      style={{ transitionDuration: `${covering ? FADE_OUT_MS : FADE_IN_MS}ms` }}
    />
  );
}
