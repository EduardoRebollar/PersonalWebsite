'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { easing, duration } from '@/lib/motion';
import { useOutsideClick } from '@/lib/useOutsideClick';

/** Nominal card height (px) used for vertical edge-clamping. */
const CARD_HEIGHT = 120;
/** Gap (px) between the node center and the card edge. */
const NODE_GAP = 28;

type SkillPopoverProps = {
  label: string;
  category: string;
  blurb?: string;
  /** Pre-resolved icon (brand SVG/IMG or a fallback span). */
  icon: ReactNode;
  /** Node offset from the constellation center, in px (frozen at click). */
  x: number;
  y: number;
  /** Container edge length (px) — used to clamp the card inside the orbit. */
  containerSize: number;
  onClose: () => void;
};

/**
 * SkillPopover — a small click-to-reveal card for a single orbital skill.
 *
 * Rendered inside OrbitingSkills' `relative` container, sharing the nodes'
 * center-origin coordinate space: anchored at the clicked node's frozen
 * (x, y), it sits directly beside the icon — to the right of the node, flipping
 * to the left for right-half nodes — and is vertically clamped so it stays
 * inside the container. It does NOT track the node afterward (the orbit is
 * paused on hover anyway).
 *
 * Owns its own dismissal: Escape, the × button, and outside-click (via the
 * shared useOutsideClick hook). The global `MotionConfig reducedMotion="user"`
 * collapses the enter/exit transition to instant for reduced-motion visitors.
 */
export function SkillPopover({
  label,
  category,
  blurb,
  icon,
  x,
  y,
  containerSize,
  onClose,
}: SkillPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);
  useOutsideClick(cardRef, handleClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Place the card to the side of the icon: to the right by default, flipping
  // left for right-half nodes so it never pushes off the right edge.
  const placeLeft = x > 0;
  const translateX = placeLeft ? `calc(-100% - ${NODE_GAP}px)` : `${NODE_GAP}px`;

  // Vertically center the card on the node, then clamp so it stays inside the
  // container, expressed as a shift off the node-anchored center (`-50%`).
  const half = containerSize / 2;
  const desiredCenter = half + y;
  const minCenter = CARD_HEIGHT / 2 + 8;
  const maxCenter = containerSize - CARD_HEIGHT / 2 - 8;
  const clampedCenter = Math.min(Math.max(desiredCenter, minCenter), maxCenter);
  const shiftY = clampedCenter - desiredCenter;

  return (
    // Static positioning wrapper: anchors at the node center (top/left 1/2) and
    // does ALL placement — the node offset (x, y) plus the side/clamp offset.
    // Kept separate from the animated card so motion's scale transform doesn't
    // clobber these translates.
    <div
      className="pointer-events-none absolute top-1/2 left-1/2 z-40 w-[min(224px,80vw)]"
      style={{
        transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) translate(${translateX}, calc(-50% + ${shiftY.toFixed(2)}px))`,
      }}
    >
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-label={label}
        className={cn(
          'pointer-events-auto relative w-full rounded-lg border border-border bg-popover/95 p-3 pr-8',
          'text-popover-foreground shadow-lg backdrop-blur-sm',
        )}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: duration.small, ease: easing.outExpo }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded text-fg-mute transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-card p-1.5">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.16em] text-fg-mute uppercase">
              {category}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          </div>
        </div>

        {blurb && <p className="mt-2.5 text-xs leading-snug text-fg-mute">{blurb}</p>}
      </motion.div>
    </div>
  );
}

export default SkillPopover;
