'use client';

// Animated spotlight onboarding tour — a faithful React port of the original
// static/js/tutorial.js. A fixed overlay dims the page, a spotlight cutout
// highlights the step's target element, a hand-drawn SVG arrow + pulse ring
// point at it, and a parchment tooltip card explains it. Two tours share the
// engine: the map walkthrough (MAIN_STEPS, auto-shown once) and the concept-map
// walkthrough (CM_STEPS, shown when the concept map first opens).
//
// React owns the tooltip's text/dots/progress; an effect owns all geometry
// (spotlight + tooltip + arrow + ring positioning), mirroring the original's
// imperative measure-and-place logic. Geometry classes are applied via refs so
// re-renders don't clobber them.

import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { playSfx } from '@/lib/laHistory/sfx';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';

type Placement = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type TutorialStep = {
  id: string;
  icon: string;
  title: string;
  body: string; // may contain inline HTML (<b>, <em>, <br>)
  targetSelector: string | null;
  placement: Placement;
  spotlightPadding: number;
  noArrow?: boolean;
  /** Open the (collapsed) map sidebar before measuring this step. */
  ensureSidebar?: boolean;
  /** Selector to pulse-highlight while this step is active (CM AI-tools step). */
  highlight?: string;
};

/* ---- Map walkthrough ---- */
export const MAIN_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    icon: '🗺️',
    title: 'Welcome to LA History!',
    body: 'Explore 15 historical locations across 4 eras of Los Angeles — from the Tongva people to the modern city. This quick tour shows you how everything works.',
    targetSelector: null,
    placement: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'map',
    icon: '🏙️',
    title: 'Navigate the Map',
    body: '<b>Drag</b> to pan around LA · <b>Scroll</b> to zoom in and out · <b>Click any marker</b> to explore that historical location.',
    targetSelector: '#map',
    placement: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'eras',
    icon: '⏳',
    title: 'Four Eras of LA History',
    body: 'Filter locations by era using these buttons. Unlock new eras by completing quizzes in the current one — starting with <b>Tongva</b> and progressing forward in time.',
    targetSelector: '#era-filter-bar',
    placement: 'bottom',
    spotlightPadding: 8,
    noArrow: true,
  },
  {
    id: 'sidebar',
    icon: '📊',
    title: 'Your Progress',
    body: "Track your <b>points</b>, visited locations, and overall completion here. The ring fills as you explore more of LA's history.",
    targetSelector: '#sidebar',
    placement: 'right',
    spotlightPadding: 6,
    noArrow: true,
    ensureSidebar: true,
  },
  {
    id: 'badges',
    icon: '🏆',
    title: 'Earn Badges',
    body: 'Complete quizzes and reach milestones to earn badges. Pass a quiz on your <b>first attempt</b> for full points — retries earn half. Score 90%+ for a bonus!',
    targetSelector: '#badge-grid',
    placement: 'right',
    spotlightPadding: 8,
    noArrow: true,
    ensureSidebar: true,
  },
  {
    id: 'tutor',
    icon: '💬',
    title: 'AI History Tutor',
    body: 'Inside the <b>Concept Map</b>, a Socratic tutor guides your thinking as you build connections. It asks questions about why things are related — not just what they are.',
    targetSelector: null,
    placement: 'center',
    spotlightPadding: 6,
  },
  {
    id: 'done',
    icon: '🎉',
    title: "You're Ready to Explore!",
    body: 'Click any marker on the map to get started. Good luck, historian!',
    targetSelector: null,
    placement: 'center',
    spotlightPadding: 0,
  },
];

/* ---- Concept-map walkthrough ---- */
export const CM_STEPS: TutorialStep[] = [
  {
    id: 'cm-welcome',
    icon: '🕸️',
    title: 'Build Your Concept Map',
    body: 'A concept map shows <b>how historical locations connect</b>. Place nodes, draw labeled links between them, and let the AI score your historical thinking.',
    targetSelector: null,
    placement: 'center',
    spotlightPadding: 0,
  },
  {
    id: 'cm-palette',
    icon: '📍',
    title: 'Add Locations',
    body: "Click <b>+</b> next to any location you've visited to place it on the canvas. Use <b>Cross-Era</b> to add locations from other eras.",
    targetSelector: '#cm-palette',
    placement: 'right',
    spotlightPadding: 8,
  },
  {
    id: 'cm-canvas',
    icon: '🔗',
    title: 'Connect the Dots',
    body: '<b>Click a node</b> to open its menu → choose <em>Start connection</em> → click a second node. Label the relationship (e.g. <em>“both displaced by Mission system”</em>). Richer labels earn higher scores.',
    targetSelector: '#cm-canvas',
    placement: 'center',
    spotlightPadding: 6,
  },
  {
    id: 'cm-footer',
    icon: '💾',
    title: 'Save, Arrange & Submit',
    body: '<b>Save</b> your work any time (auto-saves every 30 s). <b>Fit</b> re-centers the canvas. <b>Auto-arrange</b> tidies nodes. Once you have ≥ 3 connections and have passed all era quizzes, <b>Submit for Feedback</b> unlocks.',
    targetSelector: '.cm-panel-footer',
    placement: 'top',
    spotlightPadding: 6,
    noArrow: true,
  },
  {
    id: 'cm-ai-tools',
    icon: '🤖',
    title: 'Two AI Tools, Two Different Roles',
    body: '<b>🎓 AI Tutor</b> (right panel) guides your thinking with Socratic questions — it will never just hand you an answer.<br><br><b>💡 AI Hint</b> (footer, 15 pts) gives a direct, concrete suggestion about a connection you might be missing.<br><br>Use the Tutor to think things through; use Hints when you\'re genuinely stuck.',
    targetSelector: '#cm-chat-panel',
    placement: 'left',
    spotlightPadding: 6,
    noArrow: true,
    highlight: '#cm-insight-btn',
  },
  {
    id: 'cm-done',
    icon: '🎉',
    title: "You're Ready to Map History!",
    body: 'Start with a few locations, connect them with meaningful labels, and listen to the tutor. The richer your reasoning, the higher your synthesis score. Good luck! <br><br>Missed something? Click the <b>?</b> button in the header to replay this tour any time.',
    targetSelector: '#cm-tour-btn',
    placement: 'left',
    spotlightPadding: 6,
    noArrow: true,
  },
];

/* ---- Geometry helpers (ported from tutorial.js) ---- */

type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

// The overlay lives inside `.lah-root`, which carries `zoom: 0.75` (the demo
// renders at 75%). `getBoundingClientRect()` reports post-zoom *screen* pixels,
// but styles written on a fixed child of the zoomed root are interpreted in the
// container's *local* space (then multiplied by zoom). So we measure in screen
// space and divide by the zoom factor to get back to the local space the
// spotlight / tooltip / arrow styles are written in. z = 1 when unzoomed.
function readLocalRect(el: Element, z: number): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top / z,
    left: r.left / z,
    right: r.right / z,
    bottom: r.bottom / z,
    width: r.width / z,
    height: r.height / z,
  };
}

function positionSpotlight(
  spotlight: HTMLElement,
  selector: string | null,
  padding: number,
  z: number,
): Rect | null {
  if (!selector) {
    spotlight.classList.add('tutorial-hidden');
    return null;
  }
  const el = document.querySelector(selector);
  if (!el) {
    spotlight.classList.add('tutorial-hidden');
    return null;
  }
  const rect = readLocalRect(el, z);
  if (rect.width === 0 && rect.height === 0) {
    spotlight.classList.add('tutorial-hidden');
    return null;
  }
  spotlight.classList.remove('tutorial-hidden');
  spotlight.style.top = `${rect.top - padding}px`;
  spotlight.style.left = `${rect.left - padding}px`;
  spotlight.style.width = `${rect.width + padding * 2}px`;
  spotlight.style.height = `${rect.height + padding * 2}px`;
  return rect;
}

function positionTooltip(
  tooltip: HTMLElement,
  targetRect: Rect,
  placement: Placement,
  padding: number,
  z: number,
) {
  const gap = 14;
  const tooltipW = 340; // keep in sync with #tutorial-tooltip width in tutorial.css
  const tooltipH = tooltip.offsetHeight || 180;
  // Local-space viewport (offsetHeight / written styles are already local).
  const vw = window.innerWidth / z;
  const vh = window.innerHeight / z;
  const edgePad = 16;

  let top: number;
  let left: number;

  if (placement === 'right') {
    left = targetRect.right + padding + gap;
    top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
    if (left + tooltipW > vw - edgePad) {
      left = targetRect.left - padding - gap - tooltipW;
    }
  } else if (placement === 'left') {
    left = targetRect.left - padding - gap - tooltipW;
    top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
    if (left < edgePad) left = targetRect.right + padding + gap;
  } else if (placement === 'bottom') {
    top = targetRect.bottom + padding + gap;
    left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
    if (top + tooltipH > vh - edgePad) {
      top = targetRect.top - padding - gap - tooltipH;
    }
  } else if (placement === 'top') {
    top = targetRect.top - padding - gap - tooltipH;
    left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
    if (top < edgePad) top = targetRect.bottom + padding + gap;
  } else {
    tooltip.classList.add('tutorial-centered');
    return;
  }

  left = Math.max(edgePad, Math.min(left, vw - tooltipW - edgePad));
  top = Math.max(edgePad, Math.min(top, vh - tooltipH - edgePad));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.transform = '';
}

type ArrowEls = {
  svg: SVGSVGElement;
  path: SVGPathElement;
  head: SVGPathElement;
  dot: SVGCircleElement;
};

function updateArrow(
  els: ArrowEls,
  tooltip: HTMLElement,
  spotlight: HTMLElement,
  step: TutorialStep,
  reduced: boolean,
  z: number,
) {
  const { svg, path, head, dot } = els;
  const isCentered =
    !step.targetSelector ||
    step.placement === 'center' ||
    window.innerWidth < 600;
  if (isCentered || reduced || step.noArrow) {
    svg.style.opacity = '0';
    return;
  }

  const tr = readLocalRect(tooltip, z);
  const sr = readLocalRect(spotlight, z);
  if (!sr.width) {
    svg.style.opacity = '0';
    return;
  }

  let sx: number;
  let sy: number;
  let ex: number;
  let ey: number;
  const edgeGap = 6;

  switch (step.placement) {
    case 'right':
      sx = tr.left - edgeGap;
      sy = tr.top + tr.height / 2;
      ex = sr.right + edgeGap;
      ey = sr.top + sr.height / 2;
      break;
    case 'left':
      sx = tr.right + edgeGap;
      sy = tr.top + tr.height / 2;
      ex = sr.left - edgeGap;
      ey = sr.top + sr.height / 2;
      break;
    case 'bottom':
      sx = tr.left + tr.width / 2;
      sy = tr.top - edgeGap;
      ex = sr.left + sr.width / 2;
      ey = sr.bottom + edgeGap;
      break;
    case 'top':
      sx = tr.left + tr.width / 2;
      sy = tr.bottom + edgeGap;
      ex = sr.left + sr.width / 2;
      ey = sr.top - edgeGap;
      break;
    default:
      svg.style.opacity = '0';
      return;
  }

  const dx = ex - sx;
  const dy = ey - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const bendAmt = Math.min(len * 0.18, 40);
  const perpX = -(dy / len) * bendAmt;
  const perpY = (dx / len) * bendAmt;
  const midX = (sx + ex) / 2;
  const midY = (sy + ey) / 2;
  const cpx = midX + perpX;
  const cpy = midY + perpY;

  const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(
    1,
  )} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  path.setAttribute('d', d);

  const angle = Math.atan2(ey - cpy, ex - cpx);
  const ahSize = 11;
  const ahSpread = 0.45;
  const ahX1 = ex - ahSize * Math.cos(angle - ahSpread);
  const ahY1 = ey - ahSize * Math.sin(angle - ahSpread);
  const ahX2 = ex - ahSize * Math.cos(angle + ahSpread);
  const ahY2 = ey - ahSize * Math.sin(angle + ahSpread);
  head.setAttribute(
    'd',
    `M ${ahX1.toFixed(1)} ${ahY1.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(
      1,
    )} L ${ahX2.toFixed(1)} ${ahY2.toFixed(1)}`,
  );

  const totalLen = path.getTotalLength ? path.getTotalLength() : 250;
  path.style.transition = 'none';
  path.style.strokeDasharray = `${totalLen} ${totalLen}`;
  path.style.strokeDashoffset = `${totalLen}`;
  void path.getBoundingClientRect();
  path.style.transition =
    'stroke-dashoffset 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.08s';
  path.style.strokeDashoffset = '0';

  head.style.transition = 'none';
  head.style.opacity = '0';
  void head.getBoundingClientRect();
  head.style.transition = 'opacity 0.18s ease 0.52s';
  head.style.opacity = '1';

  dot.setAttribute('cx', ex.toFixed(1));
  dot.setAttribute('cy', ey.toFixed(1));
  dot.style.animationName = 'none';
  void dot.getBoundingClientRect();
  dot.style.animationName = '';

  svg.style.opacity = '1';
}

function updatePulseRing(
  ring: HTMLElement,
  spotlight: HTMLElement,
  step: TutorialStep,
  reduced: boolean,
) {
  const isCentered =
    !step.targetSelector ||
    step.placement === 'center' ||
    window.innerWidth < 600;
  if (isCentered || reduced || spotlight.classList.contains('tutorial-hidden')) {
    ring.style.display = 'none';
    return;
  }
  ring.style.top = spotlight.style.top;
  ring.style.left = spotlight.style.left;
  ring.style.width = spotlight.style.width;
  ring.style.height = spotlight.style.height;
  ring.style.display = 'block';
  ring.style.animation = 'none';
  void ring.offsetWidth;
  ring.style.animation = '';
}

/* ---- The tour engine ---- */

export function TutorialTour({
  steps,
  open,
  onClose,
}: {
  steps: TutorialStep[];
  open: boolean;
  onClose: () => void;
}) {
  const animations = useLaHistorySettings((s) => s.animations);
  const [index, setIndex] = useState(0);

  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const headRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const reduced = animations !== 'normal' || prefersReducedMotion();

  // Reset to the first step each time the tour opens (pure state adjustment).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setIndex(0);
  }

  const total = steps.length;
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const next = useCallback(() => {
    if (index >= total - 1) {
      playSfx('tutorial-complete');
      onClose();
      return;
    }
    playSfx('tutorial-step');
    setIndex(index + 1);
  }, [index, total, onClose]);

  const prev = useCallback(() => {
    if (index <= 0) return;
    playSfx('tutorial-step');
    setIndex(index - 1);
  }, [index]);

  const skip = useCallback(() => {
    playSfx('panel-close');
    onClose();
  }, [onClose]);

  // ---- Geometry: position spotlight / tooltip / arrow / ring per step ----
  useEffect(() => {
    if (!open || !step) return;
    const cur: TutorialStep = step;

    const spotlight = spotlightRef.current;
    const tooltip = tooltipRef.current;
    const ring = ringRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    const dot = dotRef.current;
    if (!spotlight || !tooltip) return;

    // Zoom factor of the scoped root (the demo renders at `zoom: 0.75`).
    const lahRoot = spotlight.closest('.lah-root');
    const parsedZoom = lahRoot
      ? parseFloat(getComputedStyle(lahRoot).zoom)
      : 1;
    const z = Number.isFinite(parsedZoom) && parsedZoom > 0 ? parsedZoom : 1;

    function place() {
      if (!spotlight || !tooltip) return;
      positionSpotlight(spotlight, cur.targetSelector, cur.spotlightPadding, z);

      const isCentered =
        !cur.targetSelector ||
        cur.placement === 'center' ||
        window.innerWidth < 600;

      if (isCentered) {
        tooltip.classList.add('tutorial-centered');
        tooltip.style.top = '';
        tooltip.style.left = '';
        tooltip.style.transform = '';
      } else {
        tooltip.classList.remove('tutorial-centered');
        const targetEl = document.querySelector(cur.targetSelector!);
        if (targetEl) {
          positionTooltip(
            tooltip,
            readLocalRect(targetEl, z),
            cur.placement,
            cur.spotlightPadding,
            z,
          );
        } else {
          tooltip.classList.add('tutorial-centered');
        }
      }

      // Direction-aware entrance animation (retrigger via reflow).
      if (!reduced) {
        tooltip.classList.remove(
          'dir-center',
          'dir-right',
          'dir-left',
          'dir-bottom',
          'dir-top',
        );
        void tooltip.offsetWidth;
        tooltip.classList.add(`dir-${cur.placement}`);
      }

      // Pulse the Next button.
      const nextBtn = nextBtnRef.current;
      if (nextBtn && !reduced) {
        nextBtn.classList.remove('tutorial-btn-pulse');
        void nextBtn.offsetWidth;
        nextBtn.classList.add('tutorial-btn-pulse');
      }

      requestAnimationFrame(() => {
        if (svg && path && head && dot) {
          updateArrow({ svg, path, head, dot }, tooltip, spotlight, cur, reduced, z);
        }
        if (ring) updatePulseRing(ring, spotlight, cur, reduced);
      });

      nextBtn?.focus();
    }

    // Optionally open the sidebar first, then wait for its transition.
    let timer: number | null = null;
    if (cur.ensureSidebar) {
      window.dispatchEvent(new CustomEvent('lah:tutorial-open-sidebar'));
      timer = window.setTimeout(place, 360);
    } else {
      timer = window.setTimeout(place, 0);
    }

    // Highlight a secondary element (CM AI-tools step) while active.
    const highlightEl = cur.highlight
      ? document.querySelector(cur.highlight)
      : null;
    highlightEl?.classList.add('tutorial-hint-highlight');

    function onResize() {
      place();
    }
    window.addEventListener('resize', onResize);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      highlightEl?.classList.remove('tutorial-hint-highlight');
    };
  }, [open, index, step, reduced]);

  // ---- Keyboard: arrows / Enter / Escape / focus trap ----
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        const tag = document.activeElement?.tagName ?? '';
        if (e.key === 'Enter' && (tag === 'BUTTON' || tag === 'A')) return;
        e.stopPropagation();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        prev();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        skip();
      } else if (e.key === 'Tab') {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        const focusable = Array.from(
          tooltip.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !(el as HTMLButtonElement).disabled && el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, next, prev, skip]);

  // Capture focus on open, restore it on close.
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    const el = prevFocusRef.current;
    if (el && typeof el.focus === 'function') {
      try {
        el.focus();
      } catch {
        // element gone
      }
    }
  }, [open]);

  if (!open || !step) return null;

  const progressPct = ((index + 1) / total) * 100;
  const nextLabel = isFirst ? 'Start →' : isLast ? 'Start Exploring!' : 'Next →';

  return (
    <div id="tutorial-overlay" className="tutorial-visible" aria-hidden="false">
      <div id="tutorial-backdrop" aria-hidden onClick={skip} />
      <div ref={spotlightRef} id="tutorial-spotlight" className="tutorial-hidden" aria-hidden />
      <div ref={ringRef} id="tutorial-pulse-ring" style={{ display: 'none' }} aria-hidden />

      <svg ref={svgRef} id="tutorial-arrow-svg" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <path ref={pathRef} id="tutorial-arrow-path" />
        <path ref={headRef} id="tutorial-arrow-head" />
        <circle ref={dotRef} id="tutorial-arrow-dot" r="4" />
      </svg>

      <div
        ref={tooltipRef}
        id="tutorial-tooltip"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <div id="tutorial-progress-bar-wrap" aria-hidden>
          <div id="tutorial-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        {step.icon ? (
          <div id="tutorial-step-icon" aria-hidden>
            {step.icon}
          </div>
        ) : null}

        <div className="tutorial-tooltip-header">
          <span className="tutorial-step-counter" id="tutorial-step-counter">
            Step {index + 1} of {total}
          </span>
          <h2 id="tutorial-title">{step.title}</h2>
        </div>

        <div
          className="tutorial-tooltip-body"
          id="tutorial-body"
          dangerouslySetInnerHTML={{ __html: step.body }}
        />

        <div className="tutorial-tooltip-footer">
          <button
            id="tutorial-prev-btn"
            type="button"
            className={isFirst ? 'tutorial-hidden' : undefined}
            aria-label="Previous step"
            onClick={prev}
          >
            ← Back
          </button>
          <div className="tutorial-dots" aria-hidden>
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={i === index ? 'tutorial-dot active' : 'tutorial-dot'}
              />
            ))}
          </div>
          <button
            ref={nextBtnRef}
            id="tutorial-next-btn"
            type="button"
            aria-label={isLast ? 'Complete tutorial and start exploring' : 'Next step'}
            onClick={next}
          >
            {nextLabel}
          </button>
          <button
            id="tutorial-skip-link"
            type="button"
            className={isLast ? 'tutorial-hidden' : undefined}
            aria-label="Skip the tutorial"
            onClick={skip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Main-tour wrapper: auto-shows once, replayable from Settings ---- */

export function Tutorial({
  forceOpen,
  onForceClose,
}: {
  forceOpen: boolean;
  onForceClose: () => void;
}) {
  const tutorialSeen = useLaHistoryStore((s) => s.tutorialSeen);
  const markTutorialSeen = useLaHistoryStore((s) => s.markTutorialSeen);
  const hydrated = useLaHistoryStore((s) => s.hydrated);

  // Auto-open on first visit (once hydrated so we know `tutorialSeen`),
  // or whenever Settings asks for a replay.
  const [autoOpen, setAutoOpen] = useState(false);
  useEffect(() => {
    if (hydrated && !tutorialSeen) {
      const t = window.setTimeout(() => setAutoOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [hydrated, tutorialSeen]);

  const open = autoOpen || forceOpen;

  function close() {
    if (!tutorialSeen) markTutorialSeen();
    setAutoOpen(false);
    if (forceOpen) onForceClose();
  }

  return <TutorialTour steps={MAIN_STEPS} open={open} onClose={close} />;
}
