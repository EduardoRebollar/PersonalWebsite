'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { prefersReducedMotion } from '@/lib/motion';
import { Lightbox } from '@/components/ui/Lightbox';
import type { MediaImage } from '@/types/content';

// useLayoutEffect warns on the server; fall back to useEffect there (mirrors
// ScrollRevealWords / ScrollExpandCover).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ParallaxImage {
  src: string;
  alt: string;
}

/**
 * Per-index frame geometry as bare numbers (top/height in vh, left/width in vw),
 * offset from the centered base. Index 0 is the centered hero plate; 1–6 fan out
 * around it. Translated 1:1 from the reference component's arbitrary Tailwind.
 */
interface Frame {
  top: number;
  left: number;
  width: number;
  height: number;
}
const FRAMES: ReadonlyArray<Frame> = [
  { top: 0, left: 0, width: 25, height: 25 }, // 0 — centered base
  { top: -30, left: 5, width: 35, height: 30 },
  { top: -10, left: -25, width: 20, height: 45 },
  { top: 0, left: 27.5, width: 25, height: 25 },
  { top: 27.5, left: 5, width: 20, height: 25 },
  { top: 27.5, left: -22.5, width: 30, height: 25 },
  { top: 22.5, left: 25, width: 15, height: 15 },
  { top: -28, left: 27, width: 22, height: 18 }, // 7 — top-right
];

/** Terminal (peak) zoom per slot — matches the reference's scale4..scale9 ordering. */
const SCALES = [4, 5, 6, 5, 6, 8, 9, 7] as const;

/**
 * Cap on how large a plate is *painted* (a multiple of its base size). The image
 * is rendered into a `paint`×-sized box and the transform only ever scales it
 * DOWN to that — so the full source resolution is used and upscaling a tiny
 * texture (the cause of the blur) never happens. Capped so the offscreen,
 * high-zoom side plates don't allocate enormous compositor layers.
 */
const PAINT_MAX = 4;

/**
 * One parallax plate. Extracted so `useTransform` is called once at a component
 * top level rather than inside a `.map` callback (the hooks-in-loop rule the
 * React Compiler lint enforces as an error — same pattern as ScrollRevealWords).
 *
 * Paint-large, scale-down: the frame's box is `paint`× the base size, and the
 * scale runs `1/paint → peak/paint` so the on-screen size (box × scale) is the
 * identical `base → base·peak` montage — but the bitmap is downscaled, not
 * upscaled, keeping it crisp.
 */
function ParallaxItem({
  image,
  index,
  progress,
  onOpen,
}: {
  image: ParallaxImage;
  index: number;
  progress: MotionValue<number>;
  onOpen: (image: MediaImage) => void;
}) {
  const peak = SCALES[index % SCALES.length]!;
  const frame = FRAMES[index % FRAMES.length]!;
  const paint = Math.min(peak, PAINT_MAX);
  const scale = useTransform(progress, [0, 1], [1 / paint, peak / paint]);
  const style: CSSProperties = {
    top: `${frame.top * paint}vh`,
    left: `${frame.left * paint}vw`,
    width: `${frame.width * paint}vw`,
    height: `${frame.height * paint}vh`,
  };
  return (
    <motion.div className="bs-zoom-item" style={{ scale }}>
      <button
        type="button"
        className="bs-zoom-frame"
        style={style}
        onClick={() => onOpen(image)}
        aria-label={`Expand: ${image.alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
      </button>
    </motion.div>
  );
}

/** Active branch — one scroll progress for the 300vh track, scrubbed onto each plate. */
function AnimatedParallax({
  images,
  onOpen,
}: {
  images: ParallaxImage[];
  onOpen: (image: MediaImage) => void;
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={container as Ref<HTMLDivElement>} className="bs-zoom">
      <div className="bs-zoom-sticky">
        {images.map((image, i) => (
          <ParallaxItem
            key={image.src}
            image={image}
            index={i}
            progress={scrollYProgress}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

/** Static, non-trapping fallback — SSR, no-JS, and reduced-motion all land here. */
function StaticParallax({
  images,
  onOpen,
}: {
  images: ParallaxImage[];
  onOpen: (image: MediaImage) => void;
}) {
  return (
    <div className="bs-zoom-static">
      {images.map((image) => (
        <figure key={image.src} className="bs-zoom-plate">
          <button
            type="button"
            onClick={() => onOpen(image)}
            aria-label={`Expand: ${image.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          </button>
        </figure>
      ))}
    </div>
  );
}

/**
 * Scroll-driven zoom montage for the LA History broadsheet's Interface section.
 * Plates start stacked at center and scale/spread apart as the 300vh track
 * scrolls past a sticky viewport.
 *
 * Adapted from a Lenis + framer-motion source: smooth-scroll is dropped (native
 * scroll only, per CLAUDE.md), `motion/react` replaces framer-motion, and a
 * static grid stands in for SSR / no-JS / reduced-motion so there's no 300vh
 * scroll trap and no hydration flash (the `.anim-ok` convention, per-component).
 * Supports up to 7 images; extras beyond that reuse the FRAMES/SCALES cycle.
 */
export function ZoomParallax({ images }: { images: ParallaxImage[] }) {
  const [engaged, setEngaged] = useState(false);
  // Click-to-expand: any plate (animated or static) opens the shared Lightbox,
  // which shows the image enlarged with its alt text as the caption.
  const [active, setActive] = useState<MediaImage | null>(null);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setEngaged(true);
  }, []);

  return (
    <>
      {engaged ? (
        <AnimatedParallax images={images} onOpen={setActive} />
      ) : (
        <StaticParallax images={images} onOpen={setActive} />
      )}
      <Lightbox image={active} onClose={() => setActive(null)} aspect="16 / 10" unoptimized />
    </>
  );
}
