'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { eras } from '@/content/data/laHistory/eras';
import { locations } from '@/content/data/laHistory/locations';
import {
  BADGE_CATALOG,
  INSIGHT_MAX_USES,
  PASSING_SCORE,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { Location } from '@/types/laHistory';

export function Dashboard() {
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);
  const points = useLaHistoryStore((s) => s.points);
  const earnedBadges = useLaHistoryStore((s) => s.badges);

  const earnedIds = useMemo(
    () => new Set(earnedBadges.map((b) => b.id)),
    [earnedBadges],
  );

  return (
    <div className="mx-auto max-w-[var(--container-shell)] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-display text-3xl text-fg">Your progress</h1>
        <span className="rounded-full border border-hairline px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-fg uppercase">
          {points} pts
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
          {Object.values(visited).filter(Boolean).length} / {locations.length}{' '}
          visited
        </span>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {eras.map((era) => {
          const eraLocations = (locations as readonly Location[]).filter(
            (l) => l.eraOrder === era.order,
          );
          const visitedCount = eraLocations.filter((l) => visited[l.slug])
            .length;
          const passedCount = eraLocations.filter(
            (l) => quizPasses[l.slug]?.passed,
          ).length;
          const cm = conceptMaps[era.order];
          const insightUsesLeft =
            INSIGHT_MAX_USES - (cm?.insightUses ?? 0);
          return (
            <article
              key={era.order}
              className="rounded-2xl border border-hairline bg-surface p-5"
            >
              <header className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-2 w-12 rounded-full"
                  style={{ background: era.accentColor }}
                />
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
                    Era {era.order}
                  </p>
                  <h2 className="font-display text-xl text-fg">{era.name}</h2>
                </div>
              </header>
              <p className="mt-2 text-sm leading-relaxed text-fg-mute">
                {era.description}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat
                  label="Visited"
                  value={`${visitedCount}/${eraLocations.length}`}
                />
                <Stat
                  label={`Quizzes ≥${PASSING_SCORE}%`}
                  value={`${passedCount}/${eraLocations.length}`}
                />
                <Stat
                  label="Concept map"
                  value={cm?.submitted ? '✓' : '—'}
                />
              </dl>

              <ul className="mt-4 space-y-1.5">
                {eraLocations.map((loc) => {
                  const attempt = quizPasses[loc.slug];
                  const isVisited = !!visited[loc.slug];
                  return (
                    <li
                      key={loc.id}
                      className="flex items-center justify-between rounded-md border border-hairline px-2.5 py-1.5 text-xs"
                    >
                      <span
                        className={cn(
                          isVisited ? 'text-fg' : 'text-fg-mute',
                        )}
                      >
                        {loc.name}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
                        {attempt?.passed
                          ? `${attempt.bestScore}% passed`
                          : attempt
                            ? `best ${attempt.bestScore}%`
                            : isVisited
                              ? 'visited'
                              : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {cm?.submitted && cm.evaluation ? (
                <p className="mt-3 text-xs text-fg-mute">
                  Concept-map score:{' '}
                  <span className="text-fg">
                    {cm.evaluation.synthesisScore}/100
                  </span>{' '}
                  · +{cm.evaluation.pointsAwarded} pts
                </p>
              ) : cm ? (
                <p className="mt-3 text-xs text-fg-mute">
                  Concept-map draft saved · {insightUsesLeft} insight
                  {insightUsesLeft === 1 ? '' : 's'} left
                </p>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl text-fg">Badges</h2>
        <p className="mt-1 text-sm text-fg-mute">
          {earnedBadges.length} of {BADGE_CATALOG.length} earned
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {BADGE_CATALOG.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <li
                key={badge.id}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  earned
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-hairline bg-base/40 opacity-60',
                )}
              >
                <p className="font-display text-sm text-fg">{badge.name}</p>
                <p className="mt-1 text-xs leading-snug text-fg-mute">
                  {badge.description}
                </p>
                {!earned ? (
                  <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-fg-mute uppercase">
                    Locked
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.14em] text-fg-mute uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-lg text-fg">{value}</p>
    </div>
  );
}
