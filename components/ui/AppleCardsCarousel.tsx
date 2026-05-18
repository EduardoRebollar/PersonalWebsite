'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useOutsideClick } from '@/lib/useOutsideClick';
import { useSceneStore } from '@/stores/useSceneStore';

/**
 * Aceternity Apple Cards Carousel — horizontal poster cards with snap-scroll
 * arrows; clicking a card opens a layoutId-morphed modal with project details.
 *
 * Source: https://ui.aceternity.com/components/apple-cards-carousel
 * Adaptations from upstream:
 *   - @tabler/icons-react → lucide-react
 *   - @/lib/utils → @/lib/cn
 *   - Custom hook moved to lib/useOutsideClick.ts and typed strictly
 *   - BlurImage (raw <img>) → next/image
 *   - JSX.Element[] → ReactElement[], Function → typed callbacks
 *   - Recolored for project dark palette
 *   - Reduced-motion: skip layoutId morph + stagger
 */

export type CarouselCard = {
  src: string;
  title: string;
  category: string;
  tech?: readonly string[];
  content: ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
  forceNoLayout: boolean;
  setPaused: (paused: boolean) => void;
}>({
  onCardClose: () => {},
  currentIndex: 0,
  forceNoLayout: false,
  setPaused: () => {},
});

const MARQUEE_MASK =
  'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)';

const AUTO_SCROLL_PX_PER_FRAME = 0.6;
const USER_INTERACTION_TIMEOUT_MS = 1500;

export function Carousel({ items }: { items: ReactElement[] }) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userInteractingRef = useRef(false);
  const userInteractTimerRef = useRef<number | null>(null);
  const hasCenteredRef = useRef(false);

  // Triple the items so the user can wrap-around in either direction with
  // room to spare. The middle copy is canonical; the outer copies are clones.
  const tripled = [...items, ...items, ...items];

  // Wrap-around: keep scrollLeft within the middle copy of the tripled set.
  // Called on every scroll event (user + programmatic) and after every
  // auto-scroll increment.
  const wrapIfNeeded = () => {
    const el = scrollRef.current;
    if (!el) return;
    const setWidth = el.scrollWidth / 3;
    if (el.scrollLeft > setWidth * 1.5) {
      el.scrollLeft -= setWidth;
    } else if (el.scrollLeft < setWidth * 0.5) {
      el.scrollLeft += setWidth;
    }
  };

  // Center the user in the middle copy on first mount. This needs to fire
  // after layout so scrollWidth is measured.
  useEffect(() => {
    if (hasCenteredRef.current) return;
    const el = scrollRef.current;
    if (!el || el.scrollWidth === 0) return;
    el.scrollLeft = el.scrollWidth / 3;
    hasCenteredRef.current = true;
  });

  // Auto-scroll loop. Suspended while hovered, while a modal is open, while
  // the user is actively interacting, or under reduced-motion.
  useEffect(() => {
    if (reducedMotion) return;
    if (isHovered || isModalOpen) return;

    let frame = 0;
    const tick = () => {
      const el = scrollRef.current;
      if (el && !userInteractingRef.current) {
        el.scrollLeft += AUTO_SCROLL_PX_PER_FRAME;
        wrapIfNeeded();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, isHovered, isModalOpen]);

  // Native wheel + touch listeners (need passive: false to preventDefault on
  // vertical wheel translation). Also debounces userInteractingRef.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const markInteracting = () => {
      userInteractingRef.current = true;
      if (userInteractTimerRef.current !== null) {
        window.clearTimeout(userInteractTimerRef.current);
      }
      userInteractTimerRef.current = window.setTimeout(() => {
        userInteractingRef.current = false;
        userInteractTimerRef.current = null;
      }, USER_INTERACTION_TIMEOUT_MS);
    };

    const onWheel = (e: WheelEvent) => {
      // Observation-only: mark interaction only when the wheel has a
      // horizontal component (trackpad swipe). Vertical wheels pass through
      // untouched so the page can scroll normally.
      if (e.deltaX !== 0) {
        markInteracting();
      }
    };

    const onTouchStart = () => markInteracting();
    const onTouchMove = () => markInteracting();

    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      if (userInteractTimerRef.current !== null) {
        window.clearTimeout(userInteractTimerRef.current);
      }
    };
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        onCardClose: () => {},
        currentIndex: 0,
        forceNoLayout: true,
        setPaused: setIsModalOpen,
      }}
    >
      <div
        className="relative w-full overflow-hidden py-8 md:py-12"
        style={{ maskImage: MARQUEE_MASK, WebkitMaskImage: MARQUEE_MASK }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          onScroll={wrapIfNeeded}
          className="flex w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-4 md:gap-6">
            {tripled.map((item, index) => {
              const isClone = index < items.length || index >= 2 * items.length;
              return (
                <div
                  key={`marquee-${index}`}
                  aria-hidden={isClone ? 'true' : undefined}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export function Card({
  card,
  index,
  layout = true,
}: {
  card: CarouselCard;
  index: number;
  layout?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, forceNoLayout, setPaused } = useContext(CarouselContext);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const useLayout = layout && !reducedMotion && !forceNoLayout;

  const handleOpen = () => {
    setOpen(true);
    setPaused(true);
  };
  const handleClose = () => {
    setOpen(false);
    setPaused(false);
    onCardClose(index);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-base/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={useLayout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-3xl rounded-3xl border border-hairline bg-surface p-6 font-sans md:p-10"
            >
              <button
                type="button"
                aria-label="Close"
                className="sticky top-2 right-0 ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-base text-fg-mute transition-colors hover:border-accent/40 hover:text-fg"
                onClick={handleClose}
              >
                <X className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <motion.p
                layoutId={useLayout ? `category-${card.title}` : undefined}
                className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase"
              >
                {card.category}
              </motion.p>
              <motion.h3
                layoutId={useLayout ? `title-${card.title}` : undefined}
                className="mt-3 font-display text-h2 leading-tight text-fg"
              >
                {card.title}
              </motion.h3>
              <div className="py-8">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        layoutId={useLayout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className={cn(
          'group relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl border border-hairline bg-surface text-left',
          'md:h-[34rem] md:w-80',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-2/3 bg-gradient-to-b from-base/85 via-base/20 to-transparent" />
        <div className="relative z-40 p-6 md:p-8">
          <motion.p
            layoutId={useLayout ? `category-${card.title}` : undefined}
            className="font-mono text-[10px] tracking-[0.18em] text-fg uppercase md:text-[11px]"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={useLayout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-[60%] font-display text-xl leading-tight text-balance text-fg md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        {card.tech && card.tech.length > 0 && (
          <ul className="pointer-events-none absolute top-6 right-6 z-40 flex flex-col items-end gap-1.5 md:top-8 md:right-8">
            {card.tech.slice(0, 5).map((t) => (
              <li
                key={t}
                className="font-mono text-[7px] tracking-[0.14em] text-fg/85 uppercase md:text-[9px] md:tracking-[0.16em]"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
        <Image
          src={card.src}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 320px, 224px"
          className="absolute inset-0 z-10 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </motion.button>
    </>
  );
}
