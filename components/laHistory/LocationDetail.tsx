'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  isLocationUnlocked,
  locationForId,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import { useTts } from '@/lib/laHistory/tts';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';
import type { Location } from '@/types/laHistory';

// Sliding right detail panel — 1:1 port of the original `.detail-panel`
// (static/js/map.js openDetailPanel): era pill, image figure + lightbox,
// description, historical timeline, YouTube video embed, and quiz actions.
// TTS read-aloud + copy-link are added in Step 7.

type Props = {
  locationId: number | null;
  onClose: () => void;
  onOpenQuiz: (locationId: number) => void;
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
}

export function LocationDetail({ locationId, onClose, onOpenQuiz }: Props) {
  const recordVisit = useLaHistoryStore((s) => s.recordVisit);
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);

  const tts = useTts();
  const ttsHighlight = useLaHistorySettings((st) => st.ttsHighlight);

  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Reset transient UI when the open location changes — the documented
  // "adjust state during render" pattern (avoids a setState-in-effect).
  const [prevLocationId, setPrevLocationId] = useState(locationId);
  if (locationId !== prevLocationId) {
    setPrevLocationId(locationId);
    setVideoPlaying(false);
    setLightbox(null);
  }

  const location = useMemo<Location | undefined>(
    () => (locationId == null ? undefined : locationForId(locationId)),
    [locationId],
  );
  const quiz = location ? quizForSlug(location.slug) : undefined;
  const attempt = location ? quizPasses[location.slug] : undefined;
  const isUnlocked = location
    ? isLocationUnlocked(location, { quizPasses, conceptMaps })
    : false;
  const wasVisited = location ? !!visited[location.slug] : false;
  const passedQuiz = !!attempt?.passed;

  useEffect(() => {
    if (!location || !isUnlocked) return;
    recordVisit(location.id);
  }, [location, isUnlocked, recordVisit]);

  useEffect(() => {
    if (locationId == null && !lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (lightbox) setLightbox(null);
      else onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locationId, lightbox, onClose]);

  const open = locationId != null && location != null;
  const videoId = location?.videoUrl ? extractYouTubeId(location.videoUrl) : null;
  const sortedEvents = location
    ? [...location.events].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  return (
    <>
      <aside
        className={cn('detail-panel', open && 'open')}
        role="dialog"
        aria-modal="false"
        aria-label={location?.name ?? 'Location details'}
        aria-hidden={!open}
      >
        <div className="detail-panel-header">
          <span>
            {location ? (
              <span className={cn('era-badge', location.era)}>
                {location.era}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            className="detail-close"
            title="Close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {location ? (
          <div className="detail-panel-body">
            <div className="detail-era-header">
              <h2 className="detail-name">{location.name}</h2>
              <div className="detail-header-meta">
                {wasVisited ? (
                  <span
                    className="quiz-passed-badge"
                    style={{ fontSize: '0.78rem' }}
                  >
                    ✓ Visited
                  </span>
                ) : null}
                {tts.supported ? (
                  <button
                    type="button"
                    className={cn('detail-tts-btn', tts.activeId === 'desc' && 'active')}
                    title="Read aloud"
                    onClick={() => tts.toggle('desc', location.fullDescription)}
                  >
                    {tts.activeId === 'desc' ? '⏹ Stop' : '🔊 Read Aloud'}
                  </button>
                ) : null}
              </div>
            </div>
            {tts.activeId === 'desc' ? (
              <div className="tts-progress-bar">
                <div
                  className="tts-progress-fill"
                  style={{ width: `${tts.ratio * 100}%` }}
                />
              </div>
            ) : null}

            {location.imageUrl ? (
              <figure
                className="detail-image-figure"
                title="Click to enlarge"
                role="button"
                tabIndex={0}
                onClick={() =>
                  setLightbox({
                    src: location.imageUrl,
                    caption: location.imageCaption || location.name,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightbox({
                      src: location.imageUrl,
                      caption: location.imageCaption || location.name,
                    });
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="detail-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="detail-image-expand-hint">⤢</div>
                {location.imageCaption ? (
                  <figcaption className="detail-image-caption">
                    {location.imageCaption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            {location.videoUrl && videoId ? (
              <div className="detail-video-section">
                {videoPlaying ? (
                  <div className="detail-video-embed-wrap">
                    <iframe
                      className="detail-video-iframe"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title="Historical video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="detail-video-thumb-wrap"
                    onClick={() => setVideoPlaying(true)}
                    aria-label="Play video"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt="Video thumbnail"
                      className="detail-video-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="detail-video-play-btn" aria-hidden>
                      ▶
                    </span>
                  </button>
                )}
                {location.videoCaption ? (
                  <figcaption className="detail-video-caption">
                    {location.videoCaption}
                  </figcaption>
                ) : null}
              </div>
            ) : null}

            <div className="detail-description">
              <TtsDescription
                text={location.fullDescription}
                active={tts.activeId === 'desc'}
                ratio={tts.ratio}
                highlight={ttsHighlight}
              />
            </div>

            {sortedEvents.length > 0 ? (
              <div className="events-section">
                <div className="events-section-header">
                  <h4>Historical Timeline</h4>
                  {tts.supported ? (
                    <button
                      type="button"
                      className={cn(
                        'timeline-tts-btn',
                        tts.activeId === 'timeline' && 'active',
                      )}
                      title="Read timeline aloud"
                      onClick={() =>
                        tts.toggle(
                          'timeline',
                          sortedEvents
                            .map((e) => `${e.yearDisplay}. ${e.title}. ${e.content}`)
                            .join(' '),
                        )
                      }
                    >
                      {tts.activeId === 'timeline' ? '⏹' : '🔊'}
                    </button>
                  ) : null}
                </div>
                <div className="timeline">
                  {sortedEvents.map((ev) => (
                    <div
                      className="timeline-item"
                      key={`${ev.orderIndex}-${ev.title}`}
                    >
                      <div className="timeline-dot" />
                      <div className="timeline-year">{ev.yearDisplay}</div>
                      <div className="timeline-title">{ev.title}</div>
                      <div className="timeline-content">{ev.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {quiz ? (
              <div className="detail-actions">
                <div className="detail-quiz-row">
                  {passedQuiz ? (
                    <span className="quiz-passed-badge">
                      ✓ Quiz Passed — {attempt?.bestScore}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onOpenQuiz(location.id)}
                    >
                      📝 Take the Quiz
                    </button>
                  )}
                  {attempt && attempt.attempts > 0 ? (
                    <span className="quiz-attempts-label">
                      {attempt.attempts} attempt
                      {attempt.attempts === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>

      <div
        className={cn('image-lightbox-overlay', lightbox && 'open')}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
        aria-hidden={!lightbox}
      >
        <div className="image-lightbox-box">
          <button
            type="button"
            className="image-lightbox-close"
            title="Close"
            aria-label="Close image"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          {lightbox ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="image-lightbox-img"
                src={lightbox.src}
                alt={lightbox.caption}
              />
              {lightbox.caption ? (
                <p className="image-lightbox-caption">{lightbox.caption}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

// Renders the description as word spans; when TTS is reading (and word
// highlight is on) the word at the current progress ratio gets `.tts-active`.
function TtsDescription({
  text,
  active,
  ratio,
  highlight,
}: {
  text: string;
  active: boolean;
  ratio: number;
  highlight: boolean;
}) {
  const tokens = useMemo(() => {
    const total = text.length || 1;
    const out: { type: 'word' | 'space' | 'br'; text: string; frac: number; wi: number }[] = [];
    const re = /(\n)|([^\S\n]+)|(\S+)/g;
    let charPos = 0;
    let wi = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m[1]) out.push({ type: 'br', text: '', frac: charPos / total, wi: -1 });
      else if (m[2]) out.push({ type: 'space', text: m[2], frac: charPos / total, wi: -1 });
      else out.push({ type: 'word', text: m[3]!, frac: charPos / total, wi: wi++ });
      charPos += m[0].length;
    }
    return out;
  }, [text]);

  // Active word index from the progress ratio.
  let activeWi = -1;
  if (active && highlight) {
    for (const t of tokens) {
      if (t.type === 'word' && t.frac <= ratio) activeWi = t.wi;
    }
  }

  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === 'br') return <br key={i} />;
        if (t.type === 'space') return <Fragment key={i}>{t.text}</Fragment>;
        return (
          <span
            key={i}
            className={cn('tts-word', active && highlight && t.wi === activeWi && 'tts-active')}
          >
            {t.text}
          </span>
        );
      })}
    </>
  );
}
