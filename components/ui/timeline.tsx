'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Aceternity Timeline — single-rail timeline: a sticky period label per entry
 * and a gradient beam down the left spine that fills as the user scrolls.
 *
 * Source: https://ui.aceternity.com/components/timeline
 *         (registry: https://ui.aceternity.com/registry/timeline.json)
 * Adaptations from upstream:
 *   - Dropped the demo header/intro block — callers supply their own <Heading>.
 *   - Dropped the light-mode classes + outer max-width/background; recolored to
 *     the project dark palette (spine via-hairline, beam accent→secondary, dot
 *     bg-accent with glow).
 *   - Tightened the per-entry vertical rhythm (upstream md:pt-40 → md:pt-20).
 */

export interface TimelineEntry {
  title: string;
  content: ReactNode;
}

/**
 * One timeline row. Owns a per-row in-view gate that toggles `.is-on`, which
 * drives the Journey "waypoint ignition" choreography in globals.css (dot flare
 * → card light-sweep → content cascade → photo develop). The class sits on the
 * row — the common ancestor of the dot and the card — so a single signal keeps
 * the whole vignette in sync. `once` so it plays one time, like About/Skills.
 * The entire choreography lives under prefers-reduced-motion: no-preference, so
 * reduced-motion / no-JS users get fully-visible rows.
 */
function TimelineRow({ item }: { item: TimelineEntry }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -40% 0px' });

  return (
    <div
      ref={ref}
      className={cn('jr-row flex justify-start pt-10 md:gap-6 md:pt-20', inView && 'is-on')}
    >
      <div className="relative flex flex-col items-center self-start md:w-auto md:shrink-0 md:flex-row">
        <span
          aria-hidden="true"
          className="jr-node absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-base"
        >
          <span className="jr-dot h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        </span>
        <h3 className="jr-year hidden font-mono text-3xl tracking-[0.1em] text-fg-mute uppercase md:block md:pl-14">
          {item.title}
        </h3>
      </div>

      <div className="relative w-full pr-2 pl-16 md:pl-0">
        <h3 className="jr-year mb-2 block font-mono text-lg tracking-[0.12em] text-fg-mute uppercase md:hidden">
          {item.title}
        </h3>
        {item.content}
      </div>
    </div>
  );
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className="w-full">
      <div ref={ref} className="relative w-full pb-4">
        <div
          style={{ height: `${height}px` }}
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,transparent_0%,var(--color-hairline)_10%,var(--color-hairline)_90%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-accent from-[0%] via-secondary via-[10%] to-transparent"
          />
        </div>

        {data.map((item, index) => (
          <TimelineRow key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
