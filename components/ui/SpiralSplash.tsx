'use client';

// Full-viewport landing overlay shown on `/`. Hosts the spiral animation
// + Enter button. Click Enter (or press Enter/Esc) → 700 ms opacity fade →
// component unmounts, which kills the GSAP timeline. The portfolio sections
// underneath remain mounted the whole time, so anchor links work immediately.
//
// Rendered via portal into <body> so it escapes the `main` element's
// `relative z-10` stacking context — otherwise the Nav (fixed z-50) would
// paint on top of the splash.

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RippleButton } from './RippleButton';
import { Spotlight } from './Spotlight';

const SpiralAnimation = lazy(() =>
  import('./spiral-animation').then((m) => ({ default: m.SpiralAnimation })),
);

export function SpiralSplash() {
  const [hydrated, setHydrated] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [enterVisible, setEnterVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
  // tab backgrounded, etc.), force-unmount slightly after the fade window.
  useEffect(() => {
    if (visible) return;
    const t = window.setTimeout(() => setMounted(false), 900);
    return () => window.clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setEnterVisible(true);
      buttonRef.current?.focus();
    }, 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        setVisible(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

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
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <SpiralAnimation />
        </Suspense>
      </div>

      {/* Three nested wrappers, each with a single job:
          1. Outer: absolute centering only (-translate-1/2 on both axes).
          2. Middle: entrance animation (translate-y / opacity). Kept separate
             so its translate doesn't clobber the outer's centering transform.
          3. Inner: Spotlight host (Spotlight mutates parent.style.position
             to relative + overflow:hidden, which would break #1 if applied there). */}
      <div className="absolute top-[calc(50%+1rem)] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`transition-all duration-[1500ms] ease-out ${
            enterVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="relative rounded-full px-16 py-10">
            <Spotlight size={260} className="from-white/70 via-white/30 to-white/0" />
            <RippleButton
              ref={buttonRef}
              onClick={() => setVisible(false)}
              aria-label="Enter site"
              rippleColor="rgba(255, 255, 255, 0.5)"
              className="z-10 animate-pulse text-2xl font-extralight tracking-[0.2em] text-white uppercase transition-all duration-700 hover:tracking-[0.4em] focus-visible:tracking-[0.3em] focus-visible:outline-none"
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
