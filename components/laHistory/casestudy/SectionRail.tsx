'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Six article sections, mirroring the masthead's `.bs-contents` index in
 * LaHistoryCaseStudy.tsx (id → number + short label).
 */
const SECTIONS = [
  { id: 'bet', n: '01', label: 'The Bet' },
  { id: 'interface', n: '02', label: 'Interface' },
  { id: 'tutor', n: '03', label: 'The Tutor' },
  { id: 'results', n: '04', label: 'Results' },
  { id: 'gazetteer', n: '05', label: 'The Map' },
  { id: 'production', n: '06', label: 'To Production' },
] as const;

/**
 * Sticky scroll-spy rail for the LA History broadsheet. A fixed vertical index
 * (desktop only — hidden under 1100px in CSS) that fades in once the reader
 * clears the cover + masthead and highlights the section currently in view.
 *
 * - Active section comes from an IntersectionObserver biased to the upper third
 *   of the viewport, so it tracks reading position rather than first-touch.
 * - Visibility tracks scroll depth (past ~1.2 viewports) and is lazy-initialised
 *   so the first paint already reflects the scroll position (no setState in the
 *   effect body, matching the repo's React-compiler lint rules).
 * - Links are real anchors; clicks scroll explicitly (honouring reduced motion)
 *   so a hash that already matches still scrolls — the Nav.scrollToSection fix.
 */
export function SectionRail() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  // Starts false so SSR and the first client render agree (reading window.scrollY
  // at init caused a hydration mismatch when hydrating already-scrolled). The
  // real value is synced on mount in the scroll effect below.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onscreen[0]) setActive(onscreen[0].target.id);
      },
      { rootMargin: '-32% 0px -58% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    onScroll(); // sync initial visibility post-hydration (covers reloads mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className={`bs-rail${visible ? ' is-visible' : ''}`} aria-label="Sections">
      <ol className="bs-rail-list">
        {SECTIONS.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id} className={`bs-rail-item${on ? ' on' : ''}`}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                aria-current={on ? 'true' : undefined}
              >
                <span className="bs-rail-tick" aria-hidden="true" />
                <span className="bs-rail-n">{s.n}</span>
                <span className="bs-rail-l">{s.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
