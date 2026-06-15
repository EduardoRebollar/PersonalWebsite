'use client';

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
} from 'react';
import { cn } from '@/lib/cn';
import { useSceneStore } from '@/stores/useSceneStore';
import { useInViewport } from '@/lib/useInViewport';

/**
 * DustMotes — a canvas of slow drifting particles, like sunlit dust in an
 * archive. Built for the LA History case study's dark broadsheet; mirrors the
 * gating of `components/ui/backgrounds/stars-background.tsx` so it inherits the
 * repo's motion conventions:
 *  - skipped entirely (returns null) under `useSceneStore.reducedMotion`, leaving
 *    the `.lah-cs-backdrop` gradient as the static ambiance,
 *  - its `requestAnimationFrame` loop pauses while scrolled offscreen
 *    (`useInViewport`), matching the offscreen-pause convention,
 *  - regenerates on resize via a `ResizeObserver`.
 *
 * Unlike StarsBackground (which twinkles in place and re-renders via state), the
 * motes move every frame, so the field lives in a ref and a single rAF loop
 * mutates it and paints straight to the canvas — no per-frame React re-render
 * (the imperative pattern used by OrbitingSkills).
 *
 * Each mote drifts slowly upward with a gentle horizontal sine sway and a soft
 * opacity pulse; motes that leave the top wrap to just below the bottom. Depth
 * comes from size: larger motes are softer and dimmer. A pre-rendered radial
 * sprite is drawn (scaled) per mote so we never build a gradient per frame.
 */

interface Mote {
  x: number;
  y: number;
  radius: number;
  /** upward drift, px/sec (stored as positive, subtracted from y) */
  vy: number;
  /** horizontal sway amplitude, px */
  swayAmp: number;
  /** sway angular speed, rad/sec */
  swaySpeed: number;
  /** sway phase offset, rad */
  swayPhase: number;
  /** base opacity before the pulse */
  baseOpacity: number;
  /** opacity pulse speed, rad/sec */
  pulseSpeed: number;
  /** opacity pulse phase offset, rad */
  pulsePhase: number;
  /** true for the teal-tinted minority */
  teal: boolean;
}

interface DustMotesProps extends ComponentPropsWithoutRef<'canvas'> {
  /** motes per px² — kept low; motes are bigger and slower than stars */
  moteDensity?: number;
  /** fraction (0–1) tinted the page's teal accent */
  tealRatio?: number;
  className?: string;
}

/** Pre-render one soft radial-gradient disc (in `rgb`) to an offscreen canvas. */
function makeSprite(rgb: string): HTMLCanvasElement {
  const size = 64;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (ctx) {
    const r = size / 2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.4, `rgba(${rgb},0.55)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return sprite;
}

export const DustMotes: FC<DustMotesProps> = ({
  moteDensity = 0.00024,
  tealRatio = 0.2,
  className,
  ...props
}) => {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  // [warm off-white, teal accent] sprites, pre-rendered once.
  const spritesRef = useRef<[HTMLCanvasElement, HTMLCanvasElement] | null>(null);
  const inView = useInViewport(canvasRef);

  // (re)generate the field on mount + resize; size the canvas to its box.
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!spritesRef.current) {
      spritesRef.current = [makeSprite('255,250,240'), makeSprite('52,211,153')];
    }

    const regenerate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const count = Math.floor(width * height * moteDensity);
      motesRef.current = Array.from({ length: count }, () => {
        const radius = Math.random() * 4 + 0.3; // ~0.3–4.3 px (some near-zero specks)
        // larger motes read as "far": softer + slower + dimmer
        const depth = (radius - 0.3) / 4; // 0 (near) → 1 (far)
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          vy: (1 - depth) * 12 + 7, // ~7–19 px/sec, nearer = faster
          swayAmp: Math.random() * 20 + 10, // 10–30 px
          swaySpeed: Math.random() * 0.8 + 0.4, // 0.4–1.2 rad/s
          swayPhase: Math.random() * Math.PI * 2,
          baseOpacity: (1 - depth) * 0.58 + 0.12, // ~0.12–0.70
          pulseSpeed: Math.random() * 1.2 + 0.8, // 0.8–2.0 rad/s
          pulsePhase: Math.random() * Math.PI * 2,
          teal: Math.random() < tealRatio,
        };
      });
    };

    regenerate();
    const resizeObserver = new ResizeObserver(regenerate);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [reducedMotion, moteDensity, tealRatio]);

  // single rAF loop: drift + paint. Paused offscreen / under reduced motion.
  useEffect(() => {
    if (reducedMotion || !inView) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sprites = spritesRef.current;
    if (!ctx || !sprites) return;

    let frameId: number;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab-away
      last = now;
      const { width, height } = canvas;
      const t = now / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const m of motesRef.current) {
        m.y -= m.vy * dt;
        if (m.y < -m.radius * 4) {
          // wrapped off the top — re-enter from below at a new x
          m.y = height + m.radius * 4;
          m.x = Math.random() * width;
        }

        const drawX = m.x + Math.sin(t * m.swaySpeed + m.swayPhase) * m.swayAmp;
        const opacity =
          m.baseOpacity * (0.6 + 0.4 * Math.sin(t * m.pulseSpeed + m.pulsePhase));
        const d = m.radius * 4; // sprite draw diameter (soft edge needs headroom)

        ctx.globalAlpha = Math.max(opacity, 0);
        ctx.drawImage(sprites[m.teal ? 1 : 0], drawX - d / 2, m.y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, inView]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full', className)}
      {...props}
    />
  );
};
