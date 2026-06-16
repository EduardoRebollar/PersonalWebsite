'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { prefersReducedMotion } from '@/lib/motion';
import type { Version } from '@/content/data/laHistory/caseStudy';

// useLayoutEffect warns on the server; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Mean rubric scores carry one decimal (e.g. 25.6). */
const fmt = (n: number) => n.toFixed(1);

type BarsProps = {
  versions: readonly Version[];
  scoreMax: number;
  peakScore: number;
};

/**
 * One score bar whose fill height AND count-up label are scrubbed to the chart's
 * scroll progress. Each bar reveals over a slightly staggered slice of `[0,1]`,
 * so they grow in sequence as the reader scrolls past. Numbers are written to a
 * ref (no per-frame React re-render — the imperative pattern used elsewhere).
 */
function Bar({
  v,
  scoreMax,
  peak,
  index,
  progress,
}: {
  v: Version;
  scoreMax: number;
  peak: boolean;
  index: number;
  progress: MotionValue<number>;
}) {
  const fillPct = (v.score / scoreMax) * 100;
  const start = Math.min(index * 0.08, 0.3);
  const end = Math.min(start + 0.6, 1);
  const height = useTransform(progress, [start, end], ['0%', `${fillPct}%`]);
  const count = useTransform(progress, [start, end], [0, v.score]);
  const valRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(count, 'change', (val) => {
    const el = valRef.current;
    if (el) el.textContent = fmt(val);
  });

  return (
    <div className={`bs-bar${peak ? ' peak' : ''}`}>
      <div className="bs-bar-track">
        <motion.div className="bs-bar-fill" style={{ height }}>
          <span className="val" ref={valRef}>
            {fmt(0)}
          </span>
        </motion.div>
      </div>
      <div className="bs-bar-k">{v.v}</div>
      <div className="bs-bar-note">{v.note}</div>
    </div>
  );
}

/** Scrubbed chart — fills + counts driven by scroll position through the chart. */
function ScrubbedBars({ versions, scoreMax, peakScore }: BarsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.85', 'start 0.35'],
  });

  return (
    <div ref={rootRef}>
      <div className="bs-bars-axis">Mean rubric score per scenario · out of {scoreMax}</div>
      <div className="bs-bars">
        {versions.map((v, i) => (
          <Bar
            key={v.v}
            v={v}
            scoreMax={scoreMax}
            peak={v.score === peakScore}
            index={i}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}

/** Fully-grown, final-number chart — SSR, no-JS, and reduced-motion. */
function StaticBars({ versions, scoreMax, peakScore }: BarsProps) {
  return (
    <div>
      <div className="bs-bars-axis">Mean rubric score per scenario · out of {scoreMax}</div>
      <div className="bs-bars">
        {versions.map((v) => (
          <div className={`bs-bar${v.score === peakScore ? ' peak' : ''}`} key={v.v}>
            <div className="bs-bar-track">
              <div
                className="bs-bar-fill"
                style={{ '--fill': `${(v.score / scoreMax) * 100}%` } as CSSProperties}
              >
                <span className="val">{fmt(v.score)}</span>
              </div>
            </div>
            <div className="bs-bar-k">{v.v}</div>
            <div className="bs-bar-note">{v.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The prompt-optimization score chart. Bar fills grow and the score labels count
 * up, both scrubbed to the chart's scroll progress (motion `useScroll`). Content
 * is fully grown by default; the scrubbed pre-state only engages once mounted
 * with motion allowed, so SSR / no-JS / reduced-motion render the final chart and
 * never get stuck at zero. Companion CSS lives in casestudy.css (`.bs-bar-fill`).
 */
export function ResultsBars({ versions, scoreMax, peakScore }: BarsProps) {
  const [engaged, setEngaged] = useState(false);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setEngaged(true);
  }, []);

  if (!engaged) return <StaticBars versions={versions} scoreMax={scoreMax} peakScore={peakScore} />;
  return <ScrubbedBars versions={versions} scoreMax={scoreMax} peakScore={peakScore} />;
}
