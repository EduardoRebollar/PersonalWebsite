'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import { prefersReducedMotion } from '@/lib/motion';
import type { Version } from '@/content/data/laHistory/caseStudy';

// useLayoutEffect warns on the server; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Mean rubric scores carry one decimal (e.g. 25.6). */
const fmt = (n: number) => n.toFixed(1);

const GROW_DURATION = 1.8;
// easeOutExpo: rises fast, then keeps slowing the higher it climbs.
const GROW_EASE = [0.25, 1, 0.3, 1] as const;

type BarsProps = {
  versions: readonly Version[];
  scoreMax: number;
  peakScore: number;
};

/**
 * One score bar whose fill height AND count-up label animate together once the
 * chart scrolls into view. All bars share the same trigger, so they grow in
 * unison. The number is written to a ref (no per-frame React re-render — the
 * imperative pattern used elsewhere).
 */
function Bar({
  v,
  scoreMax,
  peak,
  inView,
}: {
  v: Version;
  scoreMax: number;
  peak: boolean;
  inView: boolean;
}) {
  const fillPct = (v.score / scoreMax) * 100;
  const count = useMotionValue(0);
  const valRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(count, 'change', (val) => {
    const el = valRef.current;
    if (el) el.textContent = fmt(val);
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, v.score, {
      duration: GROW_DURATION,
      ease: GROW_EASE,
    });
    return () => controls.stop();
  }, [inView, count, v.score]);

  return (
    <div className={`bs-bar${peak ? ' peak' : ''}`}>
      <div className="bs-bar-track">
        <motion.div
          className="bs-bar-fill"
          initial={{ height: '0%' }}
          animate={{ height: inView ? `${fillPct}%` : '0%' }}
          transition={{ duration: GROW_DURATION, ease: GROW_EASE }}
        >
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

/** In-view chart — fills + counts grow once the chart enters the viewport. */
function AnimatedBars({ versions, scoreMax, peakScore }: BarsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Fire once the reader is well into the section: most of the chart must be on
  // screen, and the trailing 22% of the viewport is trimmed from the detection
  // zone so it only triggers after scrolling deeper rather than on first peek.
  // (Shallower than the prose Reveals so the taller chart still triggers in view.)
  const inView = useInView(rootRef, {
    once: true,
    amount: 0.6,
    margin: '0px 0px -15% 0px',
  });

  return (
    <div ref={rootRef}>
      <div className="bs-bars-axis">Mean rubric score per scenario · out of {scoreMax}</div>
      <div className="bs-bars">
        {versions.map((v) => (
          <Bar
            key={v.v}
            v={v}
            scoreMax={scoreMax}
            peak={v.score === peakScore}
            inView={inView}
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
 * up together, triggered once the chart scrolls into view (motion `useInView`,
 * fires once). Content is fully grown by default; the pre-state only engages once
 * mounted with motion allowed, so SSR / no-JS / reduced-motion render the final
 * chart and never get stuck at zero. Companion CSS lives in casestudy.css
 * (`.bs-bar-fill`).
 */
export function ResultsBars({ versions, scoreMax, peakScore }: BarsProps) {
  const [engaged, setEngaged] = useState(false);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setEngaged(true);
  }, []);

  if (!engaged) return <StaticBars versions={versions} scoreMax={scoreMax} peakScore={peakScore} />;
  return <AnimatedBars versions={versions} scoreMax={scoreMax} peakScore={peakScore} />;
}
