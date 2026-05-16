'use client';

// Full-viewport landing overlay shown on `/`. Hosts the spiral animation
// + Enter button. Click Enter (or press Enter/Esc) → 700 ms opacity fade →
// component unmounts, which kills the GSAP timeline. The portfolio sections
// underneath remain mounted the whole time, so anchor links work immediately.

import { Suspense, lazy, useEffect, useRef, useState } from 'react';

const SpiralAnimation = lazy(() =>
  import('./spiral-animation').then((m) => ({ default: m.SpiralAnimation })),
);

export function SpiralSplash() {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);
  const [enterVisible, setEnterVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

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

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      onTransitionEnd={() => {
        if (!visible) setMounted(false);
      }}
      className={`fixed inset-0 z-[60] overflow-hidden bg-black transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <SpiralAnimation />
        </Suspense>
      </div>

      <div
        className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1500ms] ease-out ${
          enterVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Enter site"
          className="animate-pulse text-2xl font-extralight tracking-[0.2em] text-white uppercase transition-all duration-700 hover:tracking-[0.3em] focus-visible:tracking-[0.3em] focus-visible:outline-none"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
