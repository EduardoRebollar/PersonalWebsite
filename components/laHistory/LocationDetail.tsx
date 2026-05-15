'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { eraByOrder } from '@/content/data/laHistory/eras';
import {
  isLocationUnlocked,
  locationForId,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { Location } from '@/types/laHistory';

type Props = {
  locationId: number | null;
  onClose: () => void;
  onOpenQuiz: (locationId: number) => void;
  onOpenTutor: (locationId: number) => void;
};

export function LocationDetail({
  locationId,
  onClose,
  onOpenQuiz,
  onOpenTutor,
}: Props) {
  const recordVisit = useLaHistoryStore((s) => s.recordVisit);
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);

  const location = useMemo<Location | undefined>(
    () => (locationId == null ? undefined : locationForId(locationId)),
    [locationId],
  );
  const era = location ? eraByOrder.get(location.eraOrder) : undefined;
  const quiz = location ? quizForSlug(location.slug) : undefined;
  const isUnlocked = location
    ? isLocationUnlocked(location, { quizPasses, conceptMaps })
    : false;
  const wasVisited = location ? !!visited[location.slug] : false;
  const passedQuiz = location ? !!quizPasses[location.slug]?.passed : false;

  useEffect(() => {
    if (!location || !isUnlocked) return;
    recordVisit(location.id);
  }, [location, isUnlocked, recordVisit]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (locationId != null) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [locationId, onClose]);

  const open = locationId != null && location != null;

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 cursor-pointer bg-base/40 backdrop-blur-[2px] transition-opacity duration-300',
          open
            ? 'opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={location?.name ?? 'Location details'}
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-hairline bg-surface shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {location && era ? (
          <>
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-base">
              <Image
                src={location.imageUrl}
                alt={location.imageCaption ?? location.name}
                fill
                sizes="(min-width: 768px) 36rem, 100vw"
                className="object-cover"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/95 via-surface/30 to-transparent" />
              <div className="absolute top-3 left-3 inline-flex items-center gap-2">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ background: era.accentColor }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] tracking-[0.18em] text-fg uppercase">
                  {era.shortLabel} · Era {era.order}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close location"
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-base/70 text-fg backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-4 w-4"
                >
                  <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <h2 className="font-display text-3xl text-fg">{location.name}</h2>
              {location.imageCaption ? (
                <p className="mt-2 text-sm text-fg-mute">
                  {location.imageCaption}
                </p>
              ) : null}

              <p className="mt-4 leading-relaxed text-fg">
                {location.fullDescription}
              </p>

              {location.events.length > 0 ? (
                <div className="mt-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
                    Events
                  </p>
                  <ol className="mt-3 space-y-3 border-l border-hairline pl-4">
                    {[...location.events]
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((ev) => (
                        <li key={`${ev.orderIndex}-${ev.title}`}>
                          <p className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
                            {ev.yearDisplay}
                          </p>
                          <p className="mt-1 font-display text-lg text-fg">
                            {ev.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-fg">
                            {ev.content}
                          </p>
                        </li>
                      ))}
                  </ol>
                </div>
              ) : null}

              {location.videoUrl ? (
                <p className="mt-6 text-sm text-fg-mute">
                  <a
                    href={location.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Watch: {location.videoCaption ?? 'related documentary'} ↗
                  </a>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-hairline px-6 py-4">
              <button
                type="button"
                onClick={() => onOpenTutor(location.id)}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-base px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-fg uppercase transition-colors hover:border-accent hover:text-accent"
              >
                Ask the tutor
              </button>
              {quiz ? (
                <button
                  type="button"
                  onClick={() => onOpenQuiz(location.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors',
                    passedQuiz
                      ? 'border-accent/60 text-accent'
                      : 'border-hairline text-fg hover:border-accent hover:text-accent',
                  )}
                >
                  {passedQuiz ? 'Quiz · passed' : 'Take quiz'}
                </button>
              ) : null}
              <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
                {wasVisited ? 'visited' : '+10 pts on first visit'}
              </span>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
