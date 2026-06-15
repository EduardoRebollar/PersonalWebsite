'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'motion/react';
import { extractYouTubeId } from '@/lib/laHistory/youtube';

// useLayoutEffect warns on the server; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Keys that advance past the cover for keyboard users (the scroll-hijack
// otherwise traps them — Arrow/PageDown fire `scroll`, which we reset to top).
const ADVANCE_KEYS = new Set(['ArrowDown', 'PageDown', 'End', 'Enter', ' ', 'Spacebar']);

type Props = {
  /** A local video file or YouTube URL — autoplayed (muted, looped) while expanding. */
  videoUrl: string;
  /** Still shown full-bleed behind the media; fades out as it expands. */
  bgImageSrc: string;
  /** Cover title; first word + the rest slide apart on scroll. */
  title: string;
  /** Small mono kicker inside the media frame (the original component's `date`). */
  kicker?: string;
  /** Mono scroll prompt inside the media frame. */
  scrollToExpand?: string;
};

/**
 * Cinematic scroll-to-expand cover for the LA History case study (above the
 * broadsheet nameplate). Scrolling grows the video to fill the screen, then
 * releases the page into the article. Hardened from the source component:
 *  - `motion/react` + bare `<img>` (matches the broadsheet),
 *  - gated on motion preference — reduced-motion / no-JS get a static still
 *    with a watch link and never engage the scroll hijack,
 *  - keyboard advance so the hijack isn't a keyboard trap.
 */
export function ScrollExpandCover({
  videoUrl,
  bgImageSrc,
  title,
  kicker,
  scrollToExpand,
}: Props) {
  const videoId = extractYouTubeId(videoUrl);
  const isYouTube = videoId !== null;
  const firstWord = title.split(' ')[0];
  const restOfTitle = title.split(' ').slice(1).join(' ');

  // Engage the hijack + autoplay only when motion is allowed. Set before paint
  // so reduced-motion / no-JS visitors never flash the interactive state — the
  // same gate CaseStudyShell uses for `.anim-ok`.
  const [interactive, setInteractive] = useState(false);
  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setInteractive(true);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  // Lazy-init from the current width — avoids a setState in the effect body.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!interactive) return;

    const onWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const next = Math.min(Math.max(scrollProgress + e.deltaY * 0.0009, 0), 1);
        setScrollProgress(next);
        if (next >= 1) setMediaFullyExpanded(true);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0]?.clientY ?? 0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      const touchY = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchY;
      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Higher sensitivity when dragging back up than down.
        const factor = deltaY < 0 ? 0.008 : 0.005;
        const next = Math.min(Math.max(scrollProgress + deltaY * factor, 0), 1);
        setScrollProgress(next);
        if (next >= 1) setMediaFullyExpanded(true);
        setTouchStartY(touchY);
      }
    };

    const onTouchEnd = () => setTouchStartY(0);

    const onScroll = () => {
      if (!mediaFullyExpanded) window.scrollTo(0, 0);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (mediaFullyExpanded || !ADVANCE_KEYS.has(e.key)) return;
      e.preventDefault();
      setScrollProgress(1);
      setMediaFullyExpanded(true);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [interactive, scrollProgress, mediaFullyExpanded, touchStartY]);

  // Reduced-motion / no-JS: static framed still, no hijack, no autoplay.
  if (!interactive) {
    return (
      <section className="bs-cover bs-cover--static" aria-label={title}>
        <div className="bs-cover-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImageSrc} alt="" loading="eager" decoding="async" />
        </div>
        <div className="bs-cover-static-inner">
          <div className="bs-cover-titles">
            <h2>{firstWord}</h2>
            {restOfTitle && <h2>{restOfTitle}</h2>}
          </div>
          {kicker && <p className="bs-cover-kicker">{kicker}</p>}
          {isYouTube && (
            <a
              className="bs-cover-watch"
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              ▶ Watch the documentary
            </a>
          )}
        </div>
      </section>
    );
  }

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1&disablekb=1`
    : null;

  return (
    <section className="bs-cover" aria-label={title}>
      <motion.div
        className="bs-cover-bg"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: 1 - scrollProgress }}
        transition={{ duration: 0.1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImageSrc} alt="" loading="eager" decoding="async" />
      </motion.div>

      <div className="bs-cover-stage">
        <div
          className="bs-cover-media"
          style={{
            width: `${mediaWidth}px`,
            height: `${mediaHeight}px`,
            maxWidth: '95vw',
            maxHeight: '85vh',
          }}
        >
          {isYouTube && embedSrc ? (
            <iframe
              src={embedSrc}
              title={`${title} — documentary`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              // muted is set imperatively too — React's `muted` prop alone is
              // unreliable and some browsers block autoplay without it.
              ref={(el) => {
                if (el) el.muted = true;
              }}
              src={videoUrl}
              poster={bgImageSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
            />
          )}
          <motion.div
            className="bs-cover-mediascrim"
            initial={false}
            animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
            transition={{ duration: 0.2 }}
          />
          <div className="bs-cover-meta">
            {kicker && (
              <p
                className="bs-cover-kicker"
                style={{ transform: `translateX(-${textTranslateX}vw)` }}
              >
                {kicker}
              </p>
            )}
            {scrollToExpand && (
              <p
                className="bs-cover-hint"
                style={{ transform: `translateX(${textTranslateX}vw)` }}
              >
                {scrollToExpand}
              </p>
            )}
          </div>
        </div>

        <div className="bs-cover-titles">
          <h2 style={{ transform: `translateX(-${textTranslateX}vw)` }}>{firstWord}</h2>
          {restOfTitle && (
            <h2 style={{ transform: `translateX(${textTranslateX}vw)` }}>{restOfTitle}</h2>
          )}
        </div>
      </div>
    </section>
  );
}
