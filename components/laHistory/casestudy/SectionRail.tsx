'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
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
  const navRef = useRef<HTMLElement>(null);
  // Tracks the last section we flashed a label for (so re-fired intersection
  // entries with the same id don't restart the timer) and the hide timer handle.
  const flashedRef = useRef<string>('');
  const flashTimerRef = useRef<number>(0);
  // Current active section + whether the rail was visible last frame, so we can
  // flash the active label at the moment the rail itself fades in.
  const activeIdRef = useRef<string>(SECTIONS[0].id);
  const wasVisibleRef = useRef(false);
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  // The section whose label is briefly shown — set when a section becomes active,
  // cleared 1s later, so the label flashes in on entry then fades back out.
  const [flash, setFlash] = useState<string | null>(null);
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
        const id = onscreen[0]?.target.id;
        if (!id) return;
        setActive(id);
        activeIdRef.current = id;
        // Flash the label once per newly-entered section, then hide it after 1s.
        if (id !== flashedRef.current) {
          flashedRef.current = id;
          setFlash(id);
          window.clearTimeout(flashTimerRef.current);
          flashTimerRef.current = window.setTimeout(() => setFlash(null), 1000);
        }
      },
      { rootMargin: '-32% 0px -58% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  // Continuous, scroll-linked progress fill (mirrors the Journey timeline beam,
  // which is driven by motion's useScroll rather than discrete steps). Writes the
  // 0–1 fraction straight to the `--rail-fill` CSS var via a ref so the beam
  // tracks scroll exactly with zero per-frame React re-renders, rAF-throttled.
  useEffect(() => {
    const first = document.getElementById(SECTIONS[0].id);
    const last = document.getElementById(SECTIONS[SECTIONS.length - 1]?.id ?? '');
    const nav = navRef.current;
    if (!first || !last || !nav) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const nowVisible = window.scrollY > window.innerHeight * 1.2;
      // When the rail first fades in, flash the current section's label — its own
      // intersection flash usually fires (and expires) before the rail appears.
      if (nowVisible && !wasVisibleRef.current) {
        flashedRef.current = activeIdRef.current;
        setFlash(activeIdRef.current);
        window.clearTimeout(flashTimerRef.current);
        flashTimerRef.current = window.setTimeout(() => setFlash(null), 1000);
      }
      wasVisibleRef.current = nowVisible;
      setVisible(nowVisible);
      const mark = window.scrollY + window.innerHeight / 2;
      const startY = first.getBoundingClientRect().top + window.scrollY;
      const endY = last.getBoundingClientRect().bottom + window.scrollY;
      const p = (mark - startY) / Math.max(1, endY - startY);
      nav.style.setProperty('--rail-fill', String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update(); // sync initial state post-hydration (covers reloads mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  // Index of the active section — drives the "already read" dot styling. The fill
  // amount itself is scroll-linked via the effect above, not this index.
  const activeIndex = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === active),
  );

  return (
    <nav ref={navRef} className={`bs-rail${visible ? ' is-visible' : ''}`} aria-label="Sections">
      <ol className="bs-rail-list">
        {SECTIONS.map((s, i) => {
          const on = s.id === active;
          const passed = i < activeIndex;
          const flashing = s.id === flash;
          return (
            <li
              key={s.id}
              className={`bs-rail-item${on ? ' on' : ''}${passed ? ' passed' : ''}${
                flashing ? ' flash' : ''
              }`}
            >
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
