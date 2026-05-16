'use client';

import { useCallback, useState, type CSSProperties, type MouseEvent } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';

type Ripple = {
  key: number;
  x: number;
  y: number;
  size: number;
};

type UseRippleOptions = {
  duration?: number;
  color?: string;
};

type RippleCSSVars = CSSProperties & Record<'--ripple-duration' | '--ripple-color', string>;

const DEFAULT_DURATION = 600;
const REDUCED_DURATION = 150;

export function useRipple({ duration = DEFAULT_DURATION, color }: UseRippleOptions = {}) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const effectiveDuration = reducedMotion ? REDUCED_DURATION : duration;
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const trigger = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const key = Date.now() + Math.random();

      setRipples((prev) => [...prev, { key, x, y, size }]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== key));
      }, effectiveDuration);
    },
    [effectiveDuration],
  );

  const rippleColor = color ?? 'var(--button-ripple-color, rgba(255, 255, 255, 0.35))';

  // Layer paints above the host's background but below text/icons. We use
  // -z-10 inside the host's `isolate` stacking context — CSS stacks negative-z
  // positioned descendants below non-positioned inline content, so children
  // remain on top with no need to wrap them in an extra span (which would
  // break `inline-flex items-center gap-N` layouts on the host).
  const layer = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          className="ripple-effect absolute rounded-full"
          style={
            {
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor,
              '--ripple-duration': `${effectiveDuration}ms`,
              '--ripple-color': rippleColor,
            } as RippleCSSVars
          }
        />
      ))}
    </span>
  );

  return { trigger, layer };
}
