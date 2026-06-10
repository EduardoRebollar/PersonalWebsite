'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useSceneStore } from '@/stores/useSceneStore';
import { useInViewport } from '@/lib/useInViewport';

/**
 * ShootingStars — a single SVG streak that periodically launches from a random
 * screen edge and travels across the viewport, leaving a gradient trail.
 *
 * Source: Aceternity "Shooting Stars and Stars Background" (by Vijay Verma),
 * https://ui.aceternity.com/components/shooting-stars-and-stars-background.
 * The registry/docs source is gated, so this is reconstructed faithfully to the
 * documented prop API — diff against the official copy-paste if you re-pull it.
 * Adapted for this repo:
 * - `cn` imported from `@/lib/cn` (this project has no `@/lib/utils`).
 * - Gated on `useSceneStore.reducedMotion` (mirrors StarsBackground) and paused
 *   offscreen via `useInViewport`.
 * - Star colors default to the site's indigo/teal accents instead of the
 *   original purple/blue.
 * - Positions use viewport coords; the parent wrapper clips with overflow-hidden,
 *   so streaks read as crossing whatever part of the section is on screen.
 */

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 12,
  maxSpeed = 32,
  minDelay = 5,
  maxDelay = 20,
  starColor = '#818cf8',
  trailColor = '#2dd4bf',
  starWidth = 8,
  starHeight = 1,
  className,
}) => {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const [star, setStar] = useState<ShootingStar | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Pause spawning + travel while this section is offscreen — Skills layers
  // three of these, and they're also stacked into Hero/About/Contact.
  const inView = useInViewport(svgRef);
  // Unique per instance so multiple <ShootingStars> don't share one gradient id.
  const gradientId = React.useId();

  useEffect(() => {
    if (reducedMotion || !inView) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      setStar({
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      });

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(createStar, randomDelay);
    };

    createStar();

    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay, reducedMotion, inView]);

  useEffect(() => {
    if (reducedMotion || !inView || !star) return;

    const moveStar = () => {
      setStar((prev) => {
        if (!prev) return null;
        const newX = prev.x + prev.speed * Math.cos((prev.angle * Math.PI) / 180);
        const newY = prev.y + prev.speed * Math.sin((prev.angle * Math.PI) / 180);
        const newDistance = prev.distance + prev.speed;
        if (
          newX < -20 ||
          newX > window.innerWidth + 20 ||
          newY < -20 ||
          newY > window.innerHeight + 20
        ) {
          return null;
        }
        return {
          ...prev,
          x: newX,
          y: newY,
          distance: newDistance,
          scale: 1 + newDistance / 100,
        };
      });
    };

    const animationFrame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrame);
  }, [star, reducedMotion, inView]);

  if (reducedMotion) return null;

  return (
    <svg ref={svgRef} className={cn('absolute inset-0 h-full w-full', className)}>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill={`url(#${gradientId})`}
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${
            star.y + starHeight / 2
          })`}
        />
      )}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={trailColor} stopOpacity={0} />
          <stop offset="100%" stopColor={starColor} stopOpacity={1} />
        </linearGradient>
      </defs>
    </svg>
  );
};
