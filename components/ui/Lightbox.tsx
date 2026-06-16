'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { easing } from '@/lib/motion';
import type { MediaImage } from '@/types/content';

/**
 * Lightbox — click an image to expand it full-screen over a dimmed, blurred
 * backdrop with a short description, dropping focus onto the photo. Controlled:
 * pass the active image (or null to close) and an `onClose` handler.
 *
 * - Rendered through a portal on <body> so the overlay escapes any section's
 *   stacking/overflow context.
 * - Closes on Escape, backdrop click, or the close button; locks body scroll
 *   while open and restores focus to the trigger afterward.
 * - The global `MotionConfig reducedMotion="user"` collapses the enter/exit
 *   transitions to instant for visitors who prefer reduced motion.
 */
export function Lightbox({
  image,
  onClose,
  aspect = '3 / 4',
  unoptimized = false,
}: {
  image: MediaImage | null;
  onClose: () => void;
  /** CSS aspect-ratio for the image frame. Journey/About photos are 3:4. */
  aspect?: string;
  /**
   * Serve the original source file at full resolution instead of a next/image
   * resized derivative. Use for already-compressed assets (e.g. the LA History
   * screenshots) where the viewer expects the true full-res capture.
   */
  unoptimized?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  // Once the image loads we know its true aspect ratio, so the frame can size
  // to it exactly (no letterbox bars). Keyed by src so a stale ratio never
  // applies to the next image. Set from onLoad — no effect, no eslint dance.
  const [loaded, setLoaded] = useState<{ src: string; ratio: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Portals need a DOM target, which only exists after mount (avoids SSR crash).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const open = image !== null;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so keyboard/screen-reader users land on it.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // Size the frame by an explicit height so the `fill` image (which is
  // absolutely positioned, hence out of normal flow) has a real box to paint
  // into — a width:auto + aspect-ratio box would collapse to 0×0 and show
  // nothing. Prefer the image's real ratio (once loaded) so it fills the frame
  // with no letterbox bars; fall back to the `aspect` prop until then. Width
  // follows from the ratio; the height cap keeps the derived width within 88vw.
  const ratio =
    image && loaded?.src === image.src
      ? loaded.ratio // width / height
      : ((): number => {
          const [w, h] = aspect.split('/').map((n) => Number(n.trim()));
          return w && h && Number.isFinite(w) && Number.isFinite(h) ? w / h : 3 / 4;
        })();
  // The image height is budgeted so the whole dialog (image + caption + the
  // overlay's padding/gaps) fits within the viewport — the overlay never
  // scrolls. ~11rem is reserved for the padding, the gap, and the (2-line max)
  // caption; the width follows from the height so the aspect ratio is preserved.
  const frameHeight = `min(calc(100vh - 11rem), calc(88vw / ${ratio}))`;

  return createPortal(
    <AnimatePresence>
      {image && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: easing.outExpo }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 overflow-hidden bg-black/80 p-6 backdrop-blur-md md:p-10"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close image"
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-neutral-200 backdrop-blur-md transition-colors hover:border-accent/60 hover:text-accent md:top-6 md:right-6"
          >
            <X className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </button>

          {/* Stop propagation so clicks on the figure don't bubble to the
              backdrop's close handler. */}
          <motion.figure
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: easing.outExpo }}
            className="flex max-w-full shrink-0 flex-col items-center gap-4"
          >
            <div
              className="relative w-auto max-w-[88vw] shrink-0 overflow-hidden rounded-2xl border border-hairline shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]"
              style={{ aspectRatio: String(ratio), height: frameHeight }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                quality={95}
                unoptimized={unoptimized}
                sizes="(max-width: 768px) 90vw, 60vw"
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth && el.naturalHeight) {
                    setLoaded({ src: image.src, ratio: el.naturalWidth / el.naturalHeight });
                  }
                }}
                className="object-cover"
              />
            </div>
            {/* Caption sits in a fully-opaque dark chip with explicit, high-contrast
                white text — independent of theme tokens and guaranteed to read
                against both the dark backdrop and the photo. A subtle border +
                drop shadow lift the box off the backdrop. */}
            <figcaption
              className="rounded-2xl border border-white/15 px-5 py-2.5 text-center text-sm font-medium leading-relaxed shadow-[0_10px_34px_-12px_rgba(0,0,0,0.9)] md:text-base"
              // Fixed, readable width so these descriptions sit on ~2 lines (a
              // narrow portrait photo would otherwise squeeze the box and force
              // the text to wrap to 3+ lines). The 2-line clamp is set inline —
              // display:-webkit-box + line-clamp + overflow:hidden — so it's not
              // dependent on the Tailwind utility being generated.
              style={{
                maxWidth: 'min(88vw, 34rem)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                backgroundColor: '#15151a',
                color: '#ffffff',
              }}
            >
              {image.caption ?? image.alt}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
