'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from 'react';
import { cn } from '@/lib/cn';
import { useSceneStore } from '@/stores/useSceneStore';
import { useInViewport } from '@/lib/useInViewport';

/**
 * StarsBackground — a canvas of static, softly twinkling stars. Density scales
 * with the canvas area; a ResizeObserver regenerates on resize.
 *
 * Source: Aceternity "Shooting Stars and Stars Background" (by Vijay Verma),
 * https://ui.aceternity.com/components/shooting-stars-and-stars-background.
 * Reconstructed to the documented prop API (registry source is gated). Adapted:
 * - `cn` imported from `@/lib/cn`.
 * - Props typed as `ComponentPropsWithoutRef<'canvas'>` (original used `'div'`
 *   then spread onto a <canvas>, which fails TS strict here).
 * - Gated on `useSceneStore.reducedMotion`; the render loop is skipped and the
 *   component returns null, matching the other animated backgrounds.
 */

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
}

interface StarsBackgroundProps extends ComponentPropsWithoutRef<'canvas'> {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

export const StarsBackground: React.FC<StarsBackgroundProps> = ({
  starDensity = 0.00035,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.3,
  maxTwinkleSpeed = 0.9,
  className,
  ...props
}) => {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Pause the twinkle render loop while this section is scrolled offscreen —
  // StarsBackground is mounted in every homepage section, so without this every
  // section's canvas would animate at once regardless of what's visible.
  const inView = useInViewport(canvasRef);

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const numStars = Math.floor(width * height * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.6 + 0.6,
          opacity: Math.random() * 0.15 + 0.85,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        };
      });
    },
    [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed],
  );

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateStars = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      setStars(generateStars(width, height));
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [generateStars, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !inView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.15 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.85);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [stars, reducedMotion, inView]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full', className)}
      {...props}
    />
  );
};
