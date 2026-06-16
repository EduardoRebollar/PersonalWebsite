'use client';

import { useRef, useState, type CSSProperties } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from 'motion/react';
import { locations } from '@/content/data/laHistory/locations';
import { eras } from '@/content/data/laHistory/eras';
import { eraLabels, gazetteerYears } from '@/content/data/laHistory/caseStudy';
import { easing } from '@/lib/motion';
import type { EraKey } from '@/types/laHistory';

type Filter = 'all' | EraKey;
type LocationItem = (typeof locations)[number];

/** Which way a card slides/tilts as it scrolls: left edge, center (straight), right edge. */
type Side = 'L' | 'C' | 'R';

const eraColor: Record<EraKey, string> = Object.fromEntries(
  eras.map((e) => [e.key, e.accentColor]),
) as Record<EraKey, string>;

// Symmetric ease-in-out: holds the tilted/blurred entry (and exit) pose near the
// viewport edges and only transitions through focus as the card nears center — so a
// card doesn't snap sharp the instant it peeks in at the bottom (the old ease front-
// loaded the entry, settling the card when it was barely 15% up the viewport).
const easeFocus = cubicBezier(0.65, 0, 0.35, 1);
const focusEase: [typeof easeFocus, typeof easeFocus] = [easeFocus, easeFocus];

/**
 * A single atlas card with a scroll-scrubbed entrance: it rises from below tipped
 * forward (`rotateX` + translateY/Z), settles flat and sharp as it reaches the
 * viewport center, then tilts back over the top as it leaves. Left/right columns
 * also slide + rotate + skew toward their edge (`sign` ±1); the center column rises
 * straight (`sign` 0). The scroll values are read from the untransformed `.bs-atlas-tilt`
 * wrapper (the inner card carries the transform, so measuring it would feed back on itself).
 * Reduced-motion drops all of it and renders the card static.
 */
function GazetteerCard({ l, side }: { l: LocationItem; side: Side }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const sign = side === 'L' ? -1 : side === 'R' ? 1 : 0;

  const ty  = useTransform(p, [0, 0.5, 1], ['42%', '0%', '-42%'],            { ease: focusEase });
  const tz  = useTransform(p, [0, 0.5, 1], [160, 0, 160],                    { ease: focusEase });
  const rx  = useTransform(p, [0, 0.5, 1], [40, 0, -40],                     { ease: focusEase });
  const tx  = useTransform(p, [0, 0.5, 1], [`${sign * 18}%`, '0%', `${sign * 18}%`], { ease: focusEase });
  const rot = useTransform(p, [0, 0.5, 1], [-sign * 4, 0, sign * 4],         { ease: focusEase });
  const sk  = useTransform(p, [0, 0.5, 1], [sign * 10, 0, -sign * 10],       { ease: focusEase });
  const blur = useTransform(p, [0, 0.5, 1], [6, 0, 6],                       { ease: focusEase });
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      ref={ref}
      layout
      className="bs-atlas-tilt"
      style={{ '--ge': eraColor[l.era] } as CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, ease: easing.outExpo }}
    >
      <motion.div
        className="bs-atlas-card"
        style={
          reduce
            ? undefined
            : {
                x: tx,
                y: ty,
                z: tz,
                rotate: rot,
                rotateX: rx,
                skewX: sk,
                filter,
                willChange: 'transform, filter',
              }
        }
        whileHover={reduce ? undefined : { scale: 1.02 }}
      >
        <div className="ac-frame">
          <span className="ac-no">{String(l.id).padStart(2, '0')}</span>
          <span className="ac-era">{eraLabels[l.era]}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.imageUrl} alt={l.name} loading="lazy" decoding="async" />
        </div>
        <div className="ac-body">
          <div className="ac-top">
            <h3 className="ac-name">{l.name}</h3>
            <span className="ac-yr">{gazetteerYears[l.slug]}</span>
          </div>
          <p className="ac-sh">{l.shortDescription}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * The 15-location atlas: era-filterable card grid. Filtering animates cards into
 * and out of place (FLIP via motion's `layout` + AnimatePresence) instead of a
 * hard remount, while each card carries its own scroll-scrubbed tilt (see
 * {@link GazetteerCard}). `MotionConfig reducedMotion="user"` (app-wide) collapses the
 * layout/filter motion to instant; the per-card tilt is gated separately on
 * `useReducedMotion`. `initial={false}` keeps the first paint static so the cards
 * don't all animate in offscreen on load.
 */
export function Gazetteer() {
  const [filter, setFilter] = useState<Filter>('all');
  const items = filter === 'all' ? locations : locations.filter((l) => l.era === filter);

  return (
    <>
      <div className="bs-atlas-filter" role="tablist" aria-label="Filter locations by era">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`bs-fbtn${filter === 'all' ? ' on' : ''}`}
          style={{ '--fe': 'var(--accent)' } as CSSProperties}
          onClick={() => setFilter('all')}
        >
          <span className="fdot" /> All <span className="fc">{locations.length}</span>
        </button>
        {eras.map((era) => {
          const count = locations.filter((l) => l.era === era.key).length;
          return (
            <button
              key={era.key}
              type="button"
              role="tab"
              aria-selected={filter === era.key}
              className={`bs-fbtn${filter === era.key ? ' on' : ''}`}
              style={{ '--fe': era.accentColor } as CSSProperties}
              onClick={() => setFilter(era.key)}
            >
              <span className="fdot" /> {eraLabels[era.key]} <span className="fc">{count}</span>
            </button>
          );
        })}
      </div>

      <motion.div className="bs-atlas-grid" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((l, i) => (
            <GazetteerCard key={l.id} l={l} side={i % 3 === 0 ? 'L' : i % 3 === 1 ? 'C' : 'R'} />
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
