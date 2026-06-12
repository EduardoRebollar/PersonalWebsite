'use client';

// Full-viewport landing overlay shown on `/`. Hosts the spiral animation
// + Enter button. Click Enter (or press Enter/Esc) → 700 ms opacity fade →
// component unmounts, which kills the GSAP timeline. The portfolio sections
// underneath remain mounted the whole time, so anchor links work immediately.
//
// Rendered via portal into <body> so it escapes the `main` element's
// `relative z-10` stacking context — otherwise the Nav (fixed z-50) would
// paint on top of the splash.

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RippleButton } from '../cta/RippleButton';
import { Spotlight } from '../three/Spotlight';
import { WarpTransition } from './WarpTransition';
import { useSceneStore } from '@/stores/useSceneStore';

const SpiralAnimation = lazy(() =>
  import('./spiral-animation').then((m) => ({ default: m.SpiralAnimation })),
);

// After the warp halts, the overlay fade reveals the hero's (always-on)
// starfield background — a heavy background↔transition crossfade. The hero's
// planet/text/button cascade (gated on `splashDismissed`) is held back this
// long so it begins only once the warp has largely dissolved, instead of
// fading in behind it. Tuned to sit just under the overlay fade window below.
const HERO_CASCADE_DELAY = 900;

export function SpiralSplash() {
  const [hydrated, setHydrated] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [enterVisible, setEnterVisible] = useState(false);
  // Two-step intro exit for capable/motion-OK users: `exploding` (the spiral
  // loses its shape and bursts outward off-screen) → `warping` (the hyperspace
  // starfield streams behind before the overlay fades). Reduced-motion users
  // skip both.
  const [exploding, setExploding] = useState(false);
  const [warping, setWarping] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dismissSplash = useSceneStore((s) => s.dismissSplash);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const initialized = useSceneStore((s) => s.initialized);

  // Instant reveal (reduced-motion / pre-init path): fade the overlay AND start
  // the hero cascade together — there's no warp to crossfade against, and the
  // overlay fade is clamped to ~instant under reduced motion anyway.
  const reveal = useCallback(() => {
    setVisible(false);
    dismissSplash();
  }, [dismissSplash]);

  // Warp reveal (fired mid-deceleration — see WarpTransition's T_REVEAL): start
  // the overlay fade now so the still-easing warp crossfades into the background
  // sooner, but hold the hero's planet/text/button cascade back by
  // HERO_CASCADE_DELAY so it doesn't fade in *behind* the still-dissolving warp.
  // dismissSplash is a store action (not local state), so it's safe to fire even
  // if the overlay has unmounted by then — and the Hero still needs the flag.
  const revealAfterWarp = useCallback(() => {
    setVisible(false);
    window.setTimeout(dismissSplash, HERO_CASCADE_DELAY);
  }, [dismissSplash]);

  // Mounts the warp behind the spiral. Fired partway through the burst by the
  // overlap timer below (not at the burst's end) so the two motions blend;
  // onExploded + the longer fallback are idempotent safety nets.
  const startWarp = useCallback(() => setWarping(true), []);

  // Enter / Esc / click. Reduced-motion (or pre-init) users skip the sequence
  // and reveal immediately — the burst/warp is a vestibular trigger. Capable,
  // motion-OK users start the burst instead (spiral bursts outward → onExploded
  // → warp → reveal). Repeat triggers once bursting has started are no-ops.
  const dismiss = useCallback(() => {
    if (exploding) return;
    if (!initialized || reducedMotion) {
      reveal();
      return;
    }
    setExploding(true);
  }, [exploding, initialized, reducedMotion, reveal]);

  // Overlap the warp into the tail of the ~0.8s spiral burst: bring it up
  // partway through (~0.45s) so the hyperspace streaks are already streaming
  // outward as the last dots fly off-screen — no black gap, one continuous
  // outward rush rather than burst-then-restart. A second timer past the burst
  // is a fallback if this one is ever missed; both calls are no-ops once set.
  useEffect(() => {
    if (!exploding) return;
    const overlap = window.setTimeout(startWarp, 450);
    const fallback = window.setTimeout(startWarp, 1200);
    return () => {
      window.clearTimeout(overlap);
      window.clearTimeout(fallback);
    };
  }, [exploding, startWarp]);

  useEffect(() => {
    // Flip the SSR/client boundary so createPortal only runs after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Lock body scroll only while the overlay is visible. Tied to `visible` (not
  // unmount) so reduced-motion users — whose global CSS clamps transitions to
  // 0.01ms — get scroll back the instant they click Enter, even if the
  // `transitionend` event that drives unmount is flaky.
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  // Fallback unmount: if `transitionend` never fires (reduced-motion clamp,
  // tab backgrounded, etc.), force-unmount just past the 1600ms fade window so
  // it never cuts the (now-longer) crossfade short.
  useEffect(() => {
    if (visible) return;
    const t = window.setTimeout(() => setMounted(false), 1800);
    return () => window.clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setEnterVisible(true);
      buttonRef.current?.focus();
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!hydrated || !mounted) return null;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      onTransitionEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (!visible) setMounted(false);
      }}
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-[1600ms] ease-out ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Warp beat — z-rushing starfield, opaque, *behind* the spiral (z-0).
          Mounts only after the spiral (z-10) has burst outward off-screen,
          streaming through the emptied canvas. Calls reveal() at its halt. */}
      {warping ? <WarpTransition onReveal={revealAfterWarp} className="absolute inset-0 z-0" /> : null}

      {/* Spiral. On Enter the canvas itself bursts the dots radially outward
          off-screen (SpiralAnimation's `explode`), so the spiral loses its
          shape and floods the viewport. The warp starts partway through that
          burst (overlap timer) and this wrapper scale-ups / spins / blurs /
          fades the emptying canvas out over it — a continuous handoff, not a
          crossfade. Each property leaves on its own clock: transform leads (the
          last outward yank), blur smears just behind it, and opacity fades only
          slightly behind (short delay) so the warp — already at speed by now —
          shows through promptly instead of sitting behind black. CSS transition
          is safe here: warp users are non-reduced-motion (reduced-motion users
          skip straight to reveal()). */}
      <div
        className="absolute inset-0 z-10 origin-center"
        style={
          warping
            ? {
                transform: 'scale(30) rotate(50deg)',
                opacity: 0,
                filter: 'blur(5px)',
                transition:
                  'transform 900ms cubic-bezier(0.5, 0, 0.75, 0), filter 700ms ease-in 100ms, opacity 700ms ease-out 150ms',
                willChange: 'transform, filter, opacity',
              }
            : undefined
        }
      >
        {/* Reduced-motion users get a static black intro — GSAP drives the
            spiral via a canvas rAF loop, which the global CSS reduced-motion
            clamp can't freeze, so we skip mounting (and lazy-loading) it. */}
        {reducedMotion ? null : (
          <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
            <SpiralAnimation explode={exploding} onExploded={startWarp} />
          </Suspense>
        )}
      </div>

      {/* Three nested wrappers, each with a single job:
          1. Outer: absolute centering only (-translate-1/2 on both axes).
          2. Middle: entrance animation (translate-y / opacity). Kept separate
             so its translate doesn't clobber the outer's centering transform.
          3. Inner: Spotlight host (Spotlight mutates parent.style.position
             to relative + overflow:hidden, which would break #1 if applied there). */}
      <div className="absolute top-[calc(50%+1rem)] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`transition-all ease-out ${
            exploding
              ? 'pointer-events-none translate-y-0 scale-95 opacity-0 blur-[2px] duration-500'
              : enterVisible
                ? 'translate-y-0 opacity-100 duration-[800ms]'
                : 'translate-y-4 opacity-0 duration-[800ms]'
          }`}
        >
          <div className="relative rounded-full px-16 py-10">
            <Spotlight size={260} className="from-white/70 via-white/30 to-white/0" />
            <RippleButton
              ref={buttonRef}
              onClick={dismiss}
              aria-label="Enter site"
              rippleColor="rgba(255, 255, 255, 0.5)"
              className={`z-10 text-2xl font-extralight tracking-[0.2em] text-white uppercase transition-all duration-700 hover:tracking-[0.4em] focus-visible:tracking-[0.3em] focus-visible:outline-none ${
                exploding ? '' : 'animate-pulse'
              }`}
            >
              Enter
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
