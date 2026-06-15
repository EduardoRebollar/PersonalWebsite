'use client';

import { useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { locations } from '@/content/data/laHistory/locations';
import { eras } from '@/content/data/laHistory/eras';
import { eraLabels, gazetteerYears } from '@/content/data/laHistory/caseStudy';
import { easing } from '@/lib/motion';
import type { EraKey } from '@/types/laHistory';

type Filter = 'all' | EraKey;

const eraColor: Record<EraKey, string> = Object.fromEntries(
  eras.map((e) => [e.key, e.accentColor]),
) as Record<EraKey, string>;

/**
 * The 15-location atlas: era-filterable card grid. Filtering animates cards into
 * and out of place (FLIP via motion's `layout` + AnimatePresence) instead of a
 * hard remount. `MotionConfig reducedMotion="user"` (app-wide) collapses all of
 * this to instant for reduced-motion users; `initial={false}` keeps the first
 * paint static so the 15 cards don't all animate in offscreen on load.
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
          {items.map((l) => (
            <motion.div
              layout
              key={l.id}
              className="bs-atlas-card"
              style={{ '--ge': eraColor[l.era] } as CSSProperties}
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.4, ease: easing.outExpo }}
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
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
