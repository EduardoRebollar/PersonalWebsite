'use client';

import { SkillHighlightCard } from '@/components/ui/SkillHighlightCard';
import { useSceneStore } from '@/stores/useSceneStore';
import type { SkillCard } from '@/types/content';

/**
 * SkillMarquee — a single continuously-scrolling row of SkillHighlightCards.
 *
 * Reuses the `scroll-marquee` keyframe in app/globals.css (translateX 0 → -50%
 * over a doubled item list, so the loop seam is invisible) and the edge-fade
 * mask pattern from AppleCardsCarousel. Pauses on hover.
 *
 * Reduced-motion: the global prefers-reduced-motion clamp would freeze the
 * animation mid-track and clip cards behind the mask, so under `reducedMotion`
 * we render a static, horizontally-scrollable single copy instead — every card
 * stays reachable. Mirrors the store-gating used across the motion components.
 */

const MARQUEE_MASK =
  'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)';

const CARD_WIDTH = 'w-[210px] shrink-0';

export function SkillMarquee({ items, durationSec = 50 }: { items: SkillCard[]; durationSec?: number }) {
  const initialized = useSceneStore((s) => s.initialized);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const animate = initialized && !reducedMotion;

  if (!animate) {
    return (
      <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-3">
          {items.map((item) => (
            <li key={item.name} className={CARD_WIDTH}>
              <SkillHighlightCard {...item} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div
      className="group relative overflow-hidden py-1"
      style={{ maskImage: MARQUEE_MASK, WebkitMaskImage: MARQUEE_MASK }}
    >
      <ul
        className="flex w-max gap-3 will-change-transform group-hover:[animation-play-state:paused]"
        style={{ animation: `scroll-marquee ${durationSec}s linear infinite` }}
      >
        {doubled.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            aria-hidden={index >= items.length ? 'true' : undefined}
            className={CARD_WIDTH}
          >
            <SkillHighlightCard {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SkillMarquee;
