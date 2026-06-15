'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import type { Version } from '@/content/data/laHistory/caseStudy';

/** Mean rubric scores carry one decimal (e.g. 25.6). */
const fmt = (n: number) => n.toFixed(1);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const COUNT_MS = 1100;

/**
 * The prompt-optimization score chart. Bar fills grow from the axis via CSS
 * (`.reveal.in .bs-bar-fill`, see casestudy.css); this component layers on a
 * count-up of the score labels, started the first time the chart scrolls into
 * view. Reduced-motion / no-JS render the final numbers immediately, and the
 * fills sit at full height (the CSS pre-state only engages under `.anim-ok`).
 */
export function ResultsBars({
  versions,
  scoreMax,
  peakScore,
}: {
  versions: readonly Version[];
  scoreMax: number;
  peakScore: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const valRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const write = (k: number) => {
      versions.forEach((v, i) => {
        const el = valRefs.current[i];
        if (el) el.textContent = fmt(v.score * k);
      });
    };

    if (prefersReducedMotion()) {
      write(1);
      return;
    }

    // Hold at zero until the chart is scrolled into view, then count up once.
    write(0);
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      write(easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [versions]);

  return (
    <div ref={rootRef}>
      <div className="bs-bars-axis">
        Mean rubric score per scenario · out of {scoreMax}
      </div>
      <div className="bs-bars">
        {versions.map((v, i) => (
          <div className={`bs-bar${v.score === peakScore ? ' peak' : ''}`} key={v.v}>
            <div className="bs-bar-track">
              <div
                className="bs-bar-fill"
                style={{ '--fill': `${(v.score / scoreMax) * 100}%` } as CSSProperties}
              >
                <span
                  className="val"
                  ref={(el) => {
                    valRefs.current[i] = el;
                  }}
                >
                  {fmt(v.score)}
                </span>
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
