'use client';

import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { easing } from '@/lib/motion';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Orbital field — four "field" nodes (Economics, Machine Learning, Data, The
 * Web) orbit the centered hero name on elliptical paths, each trailing a
 * tapered gradient spoke back to the origin and an upright label outside its
 * orbit radius. Ported from the `design_handoff_hero_orbital` reference.
 *
 * Everything lives in a single `viewBox="0 0 1440 860"` SVG with
 * `preserveAspectRatio="xMidYMid slice"`, so the design's pixel math is kept
 * 1:1 and the whole field scales to cover the hero regardless of viewport
 * aspect (planets sweep off the cropped edges by design). The origin (720,430)
 * maps to the SVG's visual center, which lines up with the flex-centered name.
 *
 * The rAF loop writes `transform`/`x`/`y`/`x2`/`y2` straight onto the cached
 * SVG nodes (no React state → no re-renders), per the handoff's notes. Initial
 * positions are computed deterministically at render so the first paint already
 * shows the constellation (and stays there, static, under reduced motion — the
 * loop never starts). An IntersectionObserver pauses the loop once the hero
 * scrolls out of view.
 *
 * Decorative only: the whole field is `aria-hidden`.
 */

const TAU = Math.PI * 2;
const CX = 720;
const CY = 430;

type Shape = 'crosshair' | 'double' | 'diamond' | 'dot';

type Orbit = {
  lbl: string;
  rx: number;
  ry: number;
  /** body radius, px */
  sz: number;
  /** period, seconds */
  dur: number;
  dir: 1 | -1;
  /** start phase, degrees */
  phase: number;
  /** teal (secondary) vs indigo (primary) */
  sec: boolean;
  /** breathe-halo stagger */
  bd: string;
  shape: Shape;
};

const ORBITS: Orbit[] = [
  { lbl: 'Economics', rx: 430, ry: 265, sz: 4, dur: 16, dir: 1, phase: 305, sec: true, bd: '0s', shape: 'crosshair' },
  { lbl: 'Machine Learning', rx: 490, ry: 298, sz: 7, dur: 30, dir: -1, phase: 25, sec: false, bd: '1.4s', shape: 'double' },
  { lbl: 'Data', rx: 545, ry: 328, sz: 5, dur: 21, dir: 1, phase: 150, sec: false, bd: '2.8s', shape: 'diamond' },
  { lbl: 'The Web', rx: 600, ry: 356, sz: 3, dur: 38, dir: -1, phase: 235, sec: false, bd: '0.7s', shape: 'dot' },
];

const colorOf = (o: Orbit) => (o.sec ? 'var(--secondary)' : 'var(--primary)');

function orbitPos(o: Orbit, elapsed: number) {
  const t = (o.phase / 360) * TAU + (elapsed / o.dur) * TAU * o.dir;
  return { px: o.rx * Math.cos(t), py: o.ry * Math.sin(t) };
}

/** Label sits radially outward from the body by (sz*2)+26 px. */
function labelPos(o: Orbit, px: number, py: number) {
  const dist = Math.hypot(px, py) || 1;
  const nx = px / dist;
  const ny = py / dist;
  const pad = o.sz * 2 + 26;
  return { lx: CX + px + nx * pad, ly: CY + py + ny * pad };
}

function PlanetShape({ o, color }: { o: Orbit; color: string }) {
  const body = <circle r={o.sz} style={{ fill: color }} />;
  switch (o.shape) {
    case 'double':
      return (
        <>
          {body}
          <circle r={15} fill="none" style={{ stroke: color }} strokeOpacity={0.38} strokeWidth={1} />
        </>
      );
    case 'diamond':
      return (
        <rect
          x={-o.sz}
          y={-o.sz}
          width={o.sz * 2}
          height={o.sz * 2}
          rx={2}
          transform="rotate(45)"
          style={{ fill: color }}
        />
      );
    case 'crosshair':
      return (
        <>
          {body}
          <line x1={-10} y1={0} x2={10} y2={0} style={{ stroke: color }} strokeWidth={1} strokeOpacity={0.65} />
          <line x1={0} y1={-10} x2={0} y2={10} style={{ stroke: color }} strokeWidth={1} strokeOpacity={0.65} />
        </>
      );
    default:
      return body;
  }
}

export function OrbitalField({ className }: { className?: string }) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  // Lead-in: the field fades up from the center outward, *before* the
  // name/eyebrow/CTA choreography (the name's DiaTextReveal starts at delay
  // 0.5 — see Hero.tsx — so the planets still lead the copy in). Rather than
  // fading the whole field as one block, each orbit fades on its own staggered
  // clock: ORBITS is ordered innermost→outermost (rx 430 → 600), so the array
  // index *is* the center-out order — inner planets light up first, outer ones
  // trail. The center bloom (i = -1) leads at the base delay.
  //
  // The fade starts at a small base delay (~0.2s) as the splash overlay
  // (bg-black) finishes its ~700ms fade (SpiralSplash, `duration-700`). The
  // outExpo ease is front-loaded but the long duration keeps the first frames
  // faint, so the early opacity barely reads against the still-clearing overlay.
  //
  // Driven by `motion` (not a CSS transition) on purpose: the global
  // reduced-motion clamp in @layer base forces `transition-duration: 0.01ms` on
  // all CSS transitions, which would snap the fade. motion's
  // `reducedMotion="user"` (MotionConfig, app/providers.tsx) only strips
  // transforms/layout — opacity fades are preserved — so it still plays for
  // reduced-motion users.
  const splashDismissed = useSceneStore((s) => s.splashDismissed);

  // Per-orbit fade: opacity 0 → `to`, delayed by orbit index so the field
  // resolves center-out. `i = -1` is the center bloom (leads the innermost
  // orbit). `to` defaults to 1, but the labels fade to their resting 0.72 (kept
  // here, not in CSS, so the inline opacity motion drives doesn't fight a
  // competing `.orb-label { opacity }` declaration).
  const fade = (i: number, to = 1) => ({
    initial: { opacity: 0 },
    animate: { opacity: splashDismissed ? to : 0 },
    transition: { duration: 5.5, delay: 0.2 + (i + 1) * 0.1, ease: easing.outExpo },
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const gradRefs = useRef<(SVGLinearGradientElement | null)[]>([]);

  useEffect(() => {
    // Reduced-motion users keep the static constellation rendered at phase 0 —
    // the breathe/orbit motion stays frozen (CSS halo is clamped globally).
    if (reducedMotion) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      for (let i = 0; i < ORBITS.length; i++) {
        const o = ORBITS[i];
        if (!o) continue;
        const { px, py } = orbitPos(o, elapsed);
        const x = CX + px;
        const y = CY + py;

        groupRefs.current[i]?.setAttribute('transform', `translate(${x} ${y})`);

        const { lx, ly } = labelPos(o, px, py);
        const label = labelRefs.current[i];
        if (label) {
          label.setAttribute('x', String(lx));
          label.setAttribute('y', String(ly));
        }

        const line = lineRefs.current[i];
        if (line) {
          line.setAttribute('x2', String(x));
          line.setAttribute('y2', String(y));
        }

        const grad = gradRefs.current[i];
        if (grad) {
          grad.setAttribute('x2', String(x));
          grad.setAttribute('y2', String(y));
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Pause the loop while the hero is scrolled out of view.
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) play();
        else stop();
      },
      { threshold: 0 },
    );
    if (rootRef.current) io.observe(rootRef.current);
    play();

    return () => {
      stop();
      io.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} aria-hidden="true" className={cn('orbital-field pointer-events-none', className)}>
      {/* Faint indigo bloom behind the name — adds depth without occluding the
          page-wide starfield underneath. Leads the center-out fade (i = -1). */}
      <motion.div
        {...fade(-1)}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 50%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 70%)',
        }}
      />

      {/* Cap the SVG box at its design size (1920×1146 = the ~1.33× scale a
          1080p screen already shows) and center it. `slice` ties content scale
          to the element's CSS-px size, so a full-bleed `w-full h-full` box makes
          the planet scale grow with the CSS viewport — and since browser zoom
          enlarges the CSS viewport, zooming out kept the planets a constant
          *physical* size while the rem-based copy shrank around them. Capping at
          the design size makes the planet scale a fixed number of CSS px once the
          viewport meets it, so it now scales with zoom exactly like the text;
          below the cap it stays responsive (`min(100%, …)`). */}
      <svg
        className="absolute top-1/2 left-1/2 h-[min(100%,1146px)] w-[min(100%,1920px)] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1440 860"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {ORBITS.map((o, i) => {
            const { px, py } = orbitPos(o, 0);
            const color = colorOf(o);
            return (
              <linearGradient
                key={`grad-${i}`}
                id={`orb-spoke-${i}`}
                ref={(el) => {
                  gradRefs.current[i] = el;
                }}
                gradientUnits="userSpaceOnUse"
                x1={CX}
                y1={CY}
                x2={CX + px}
                y2={CY + py}
              >
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0 }} />
                <stop offset="70%" style={{ stopColor: color, stopOpacity: 0.28 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.55 }} />
              </linearGradient>
            );
          })}

          <radialGradient id="orb-glow-indigo">
            <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="orb-glow-teal">
            <stop offset="0%" style={{ stopColor: 'var(--secondary)', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: 'var(--secondary)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* spokes — stroke references the per-orbit gradient */}
        {ORBITS.map((o, i) => {
          const { px, py } = orbitPos(o, 0);
          return (
            <motion.line
              key={`spoke-${i}`}
              {...fade(i)}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x1={CX}
              y1={CY}
              x2={CX + px}
              y2={CY + py}
              stroke={`url(#orb-spoke-${i})`}
              strokeWidth={1}
            />
          );
        })}

        {/* planet bodies */}
        {ORBITS.map((o, i) => {
          const { px, py } = orbitPos(o, 0);
          const color = colorOf(o);
          return (
            <motion.g
              key={`planet-${i}`}
              {...fade(i)}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
              transform={`translate(${CX + px} ${CY + py})`}
            >
              <circle r={o.sz * 3.2} fill={`url(#orb-glow-${o.sec ? 'teal' : 'indigo'})`} />
              <circle
                className="orb-halo"
                r={o.sz * 2.8}
                style={{ fill: color, opacity: 0.13, '--orb-bd': o.bd } as React.CSSProperties}
              />
              <PlanetShape o={o} color={color} />
            </motion.g>
          );
        })}

        {/* labels — upright, positioned radially outward by rAF */}
        {ORBITS.map((o, i) => {
          const { px, py } = orbitPos(o, 0);
          const { lx, ly } = labelPos(o, px, py);
          return (
            <motion.text
              key={`label-${i}`}
              {...fade(i, 0.72)}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn('orb-label', o.sec && 'sec')}
            >
              {o.lbl.toUpperCase()}
            </motion.text>
          );
        })}
      </svg>

      {/* center vignette — fades planets/spokes converging behind the name */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(36% 38% at 50% 50%, #000 30%, color-mix(in oklab, #000 48%, transparent) 62%, transparent 82%)',
        }}
      />
    </div>
  );
}
