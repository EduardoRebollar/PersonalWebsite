'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Starfield background — twinkling stars + occasional diagonal shooting stars.
 *
 * Source: extracted from a shared `space-box.tsx` snippet (originally a
 * hover-triggered card). Here it's always-on, full-bleed, and
 * pointer-events-none. All authored animation durations are multiplied by
 * ~1.667 (60% playback rate).
 *
 * Returns null when reducedMotion is set, mirroring BackgroundBeams.
 */

type StarData = {
  id: number;
  size: number;
  top: number;
  left: number;
  delay: number;
};

type ShootingStarData = {
  id: string;
  startTop: number | 'top';
  startLeft: number | 'left';
  endTop: number;
  endLeft: number;
  duration: number;
};

const Star = ({ data }: { data: StarData }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{
      width: `${data.size}px`,
      height: `${data.size}px`,
      top: `${data.top}%`,
      left: `${data.left}%`,
    }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 3.333,
      repeat: Number.POSITIVE_INFINITY,
      delay: data.delay,
    }}
  />
);

const ShootingStar = ({ data }: { data: ShootingStarData }) => {
  const startsFromTop = data.startTop === 'top';
  const startPosition = startsFromTop
    ? { top: '0%', left: `${data.startLeft as number}%` }
    : { top: `${data.startTop as number}%`, left: '0%' };

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: '2px',
        height: '2px',
        ...startPosition,
        boxShadow:
          '0 0 0 1px #ffffff10, 0 0 0 2px #ffffff10, 0 0 20px #ffffff50',
      }}
      animate={{
        top: `${data.endTop}%`,
        left: `${data.endLeft}%`,
      }}
      transition={{
        duration: data.duration,
        ease: 'linear',
      }}
    />
  );
};

// Helpers below run only inside useEffect / event-handler scope (never during
// render), so they're free to call Math.random.

const makeStars = (count: number): StarData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3.333,
  }));

const makeShootingStar = (): ShootingStarData => {
  const startsFromTop = Math.random() > 0.5;
  const startLeft: number | 'left' = startsFromTop
    ? Math.random() * 100
    : 'left';
  const startTop: number | 'top' = startsFromTop ? 'top' : Math.random() * 100;
  const endTop = startsFromTop ? 110 : (startTop as number) + 50;
  const endLeft = startsFromTop ? (startLeft as number) + 50 : 110;
  return {
    id: Math.random().toString(36).slice(2, 11),
    startTop,
    startLeft,
    endTop,
    endLeft,
    duration: Math.random() * 2.5 + 1.667,
  };
};

type Density = 'low' | 'medium' | 'high';

const STAR_COUNTS: Record<Density, { regular: number; shooting: number }> = {
  low: { regular: 25, shooting: 2 },
  medium: { regular: 50, shooting: 4 },
  high: { regular: 100, shooting: 6 },
};

export const StarfieldBackground = React.memo(
  ({ density = 'high' }: { density?: Density }) => {
    const reducedMotion = useSceneStore((s) => s.reducedMotion);
    const [stars, setStars] = useState<StarData[]>([]);
    const [shootingStars, setShootingStars] = useState<ShootingStarData[]>([]);

    useEffect(() => {
      if (reducedMotion) return;

      const { regular: starCount, shooting: shootingCount } =
        STAR_COUNTS[density];

      // Initial population happens after mount to avoid SSR hydration
      // mismatches from Math.random and to keep render pure. The
      // set-state-in-effect lint rule warns about cascading renders, but
      // here it's the intended one-time post-mount initialization.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStars(makeStars(starCount));
      setShootingStars(
        Array.from({ length: shootingCount }, makeShootingStar),
      );

      const interval = setInterval(() => {
        setShootingStars((prev) => {
          const trimmed =
            prev.length > shootingCount * 2
              ? prev.slice(prev.length - shootingCount)
              : [...prev];
          for (let i = 0; i < Math.ceil(shootingCount / 3); i++) {
            trimmed.push(makeShootingStar());
          }
          return trimmed;
        });
      }, 1333);

      return () => {
        clearInterval(interval);
      };
    }, [reducedMotion, density]);

    if (reducedMotion) return null;

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-90"
      >
        {stars.map((s) => (
          <Star key={s.id} data={s} />
        ))}
        {shootingStars.map((s) => (
          <ShootingStar key={s.id} data={s} />
        ))}
      </div>
    );
  },
);

StarfieldBackground.displayName = 'StarfieldBackground';
