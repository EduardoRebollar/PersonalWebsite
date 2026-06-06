'use client';

// Warp / hyperspace transition played between the SpiralSplash "Enter" press
// and the Hero reveal. A z-rushing starfield: ~700 stars stream outward from
// the viewport center (where the spiral's core + Enter button sit),
// accelerating into a peak "hyperspace" streak, then decelerating to a halt as
// points. Partway through that deceleration (`T_REVEAL`, before the full stop)
// `onReveal` fires so the splash can begin crossfading the warp out into the
// hero background while the warp is still easing down. Each star's streak is
// drawn as a line from its previous projected position to its current one, so
// streak length is proportional to speed and collapses to a dot at the halt.
//
// Renders opaque from the first frame and sits *behind* the spiral: SpiralSplash
// zooms the spiral into its core and dissolves it to reveal this warp, so no
// self-fade is needed here.
//
// Pure <canvas> + requestAnimationFrame — no GSAP, no new deps. Mostly white
// with a faint indigo/teal minority (the OrbitalField / hero accents).
//
// NOTE: this component is only ever mounted for non-reduced-motion users —
// SpiralSplash gates it. Do NOT drive its choreography with CSS
// transitions/animations: the global `prefers-reduced-motion` clamp in
// globals.css would freeze them. All timing lives in the rAF loop below.

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

// --- tunables (seconds / z-units) -------------------------------------------
// The warp is brought up partway through the spiral's outward burst, so it
// punches straight to peak (no slow ramp from a standstill, which read as a
// stall after the burst) and inherits that outward momentum before easing down.
const T_ACCEL_END = 0.18; // quick punch-in 0 → SPEED_MAX (inherits burst momentum)
const T_PEAK_END = 0.65; // hold SPEED_MAX (hyperspace)
const T_HALT = 2.2; // cubic ease-out reaches ~0 here (full stop)
const T_REVEAL = 1.45; // mid-decel: onReveal fires → background starts crossfading in
const SPEED_MAX = 8; // peak dz / second
const Z_NEAR = 0.25; // respawn plane (closest a star travels before recycling)
const Z_FAR = 4; // spawn plane
const ACCENT_RATIO = 0.15; // share of stars tinted indigo/teal vs white

type RGB = readonly [number, number, number];
type Star = { x: number; y: number; z: number; color: RGB; base: number };

const WHITE: RGB = [255, 255, 255];
const INDIGO: RGB = [129, 140, 248]; // #818cf8 — --primary
const TEAL: RGB = [45, 212, 191]; // #2dd4bf — --secondary

function makeStar(): Star {
  const accent = Math.random() < ACCENT_RATIO;
  const color = accent ? (Math.random() < 0.5 ? INDIGO : TEAL) : WHITE;
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Z_NEAR + Math.random() * (Z_FAR - Z_NEAR),
    color,
    base: accent ? 0.55 : 0.95, // faint accents, bright white core
  };
}

// Speed schedule: ease-in accel → flat peak → cubic ease-out to a gentle halt.
function speedAt(t: number): number {
  if (t <= 0) return 0;
  if (t < T_ACCEL_END) {
    const p = t / T_ACCEL_END;
    return SPEED_MAX * p * p; // ease-in
  }
  if (t < T_PEAK_END) return SPEED_MAX;
  if (t < T_HALT) {
    const e = 1 - (t - T_PEAK_END) / (T_HALT - T_PEAK_END);
    return SPEED_MAX * e * e * e; // cubic ease-out → 0
  }
  return 0;
}

export function WarpTransition({ onReveal, className }: { onReveal: () => void; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep `onReveal` current without restarting the rAF loop (main effect is []).
  const onRevealRef = useRef(onReveal);
  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let focal = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      // Far stars cluster near center; near stars sweep off the edges.
      focal = Math.max(w, h) * 0.55;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = w < 640 ? 400 : 700;
    const stars: Star[] = Array.from({ length: count }, makeStar);

    const start = performance.now();
    let prev = start;
    let revealFired = false;
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min((now - prev) / 1000, 1 / 30); // cap on tab refocus
      prev = now;

      const speed = speedAt(t);
      const dz = speed * dt;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Faint core glow that swells with speed — sells "diving into a point".
      const glow = speed / SPEED_MAX;
      if (glow > 0.01) {
        const r = Math.max(w, h) * 0.22;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(180,190,255,${0.1 * glow})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const s of stars) {
        const oldZ = s.z;
        s.z -= dz;
        if (s.z <= Z_NEAR) {
          // Recycle to the far plane with a fresh angle; no streak this frame.
          s.z = Z_FAR;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          continue;
        }

        const kNew = focal / s.z;
        const sx = cx + s.x * kNew;
        const sy = cy + s.y * kNew;

        const kOld = focal / oldZ;
        const ox = cx + s.x * kOld;
        const oy = cy + s.y * kOld;

        // Nearer = brighter/thicker; far stars stay subtle.
        const depth = (Z_FAR - s.z) / (Z_FAR - Z_NEAR); // 0 far → 1 near
        const alpha = s.base * (0.25 + 0.75 * depth);
        const lw = Math.min(0.5 + depth * 2, 2.6);
        const [r, gg, b] = s.color;

        ctx.strokeStyle = `rgba(${r},${gg},${b},${alpha})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      if (!revealFired && t >= T_REVEAL) {
        revealFired = true;
        onRevealRef.current();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('block', className)} />;
}
