'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { eras } from '@/content/data/laHistory/eras';
import { locations } from '@/content/data/laHistory/locations';
import { isEraUnlocked, locationsInEra } from '@/lib/laHistory/gamification';
import { ERA_META, badgeIcon } from '@/lib/laHistory/display';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { Location } from '@/types/laHistory';

// Left "Your Journey" sidebar — 1:1 port of the original map-page sidebar
// (templates/map/index.html + static/js/progress.js renderSidebar):
// completion ring, points box, per-era progress bars, earned-badge grid.

const RING_CIRCUMFERENCE = 125.7; // 2πr, r = 20
const TOTAL_LOCATIONS = locations.length;

export function Sidebar({
  collapsed,
  onOpenConceptMap,
}: {
  collapsed: boolean;
  onOpenConceptMap: (eraOrder: number) => void;
}) {
  const points = useLaHistoryStore((s) => s.points);
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);
  const badges = useLaHistoryStore((s) => s.badges);

  const visitedCount = useMemo(
    () => Object.values(visited).filter(Boolean).length,
    [visited],
  );
  const passedCount = useMemo(
    () =>
      (locations as readonly Location[]).filter(
        (l) => quizPasses[l.slug]?.passed,
      ).length,
    [quizPasses],
  );

  const completionPct =
    TOTAL_LOCATIONS > 0 ? Math.round((passedCount / TOTAL_LOCATIONS) * 100) : 0;
  const ringOffset =
    RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * completionPct) / 100;

  return (
    <aside className={cn('sidebar', collapsed && 'collapsed')} aria-label="Your progress">
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div>
            <h3>Your Journey</h3>
            <div className="sidebar-username">Explorer</div>
          </div>
          <div className="sidebar-ring" title="Overall completion">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle className="sidebar-ring-bg" cx="26" cy="26" r="20" />
              <circle
                className="sidebar-ring-fill"
                cx="26"
                cy="26"
                r="20"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="sidebar-ring-text">
              <span className="sidebar-ring-pct">{completionPct}%</span>
            </div>
          </div>
        </div>
        <div className="sidebar-points">
          <span className="points-label">Points</span>
          <span className="points-value">{points}</span>
          <span className="sidebar-visited-counter">
            {visitedCount}/{TOTAL_LOCATIONS} visited
          </span>
        </div>
      </div>

      <div className="sidebar-body">
        <div className="era-progress-section">
          <h4>Era Progress</h4>
          {eras.map((era) => {
            const eraLocs = locationsInEra(era.order);
            const total = eraLocs.length;
            const passed = eraLocs.filter(
              (l) => quizPasses[l.slug]?.passed,
            ).length;
            const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
            const unlocked = isEraUnlocked(era.order, {
              quizPasses,
              conceptMaps,
            });
            const meta = ERA_META[era.key];
            return (
              <div
                key={era.order}
                className={cn('era-progress-item', !unlocked && 'era-item-locked')}
              >
                <div className="era-progress-header">
                  <span className="era-progress-name">
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="era-progress-stat">
                    {unlocked ? (
                      `${passed}/${total} passed`
                    ) : (
                      <span className="era-locked-badge">🔒 Locked</span>
                    )}
                  </span>
                </div>
                {unlocked ? (
                  <div className="era-bar-bg">
                    <div
                      className={cn('era-bar-fill', era.key)}
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                ) : (
                  <div className="era-unlock-hint">{unlockHint(era.order)}</div>
                )}

                {(() => {
                  const submitted = !!conceptMaps[era.order]?.submitted;
                  if (!unlocked) {
                    return (
                      <button
                        type="button"
                        className={cn(
                          'cm-era-trigger-btn',
                          `era-${era.key}`,
                          'cm-btn-locked',
                        )}
                        disabled
                        title="Complete the previous era to unlock"
                      >
                        🔒 Concept Map
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      className={cn(
                        'cm-era-trigger-btn',
                        `era-${era.key}`,
                        submitted && 'cm-btn-submitted',
                      )}
                      onClick={() => onOpenConceptMap(era.order)}
                    >
                      {submitted ? '✅ Concept Map' : '🗺 Concept Map'}
                    </button>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <div className="sidebar-divider" />

        <div className="badge-section">
          <h4>Badges Earned</h4>
          <div className="badge-grid">
            {badges.length === 0 ? (
              <span className="badge-empty">
                No badges earned yet — keep exploring!
              </span>
            ) : (
              badges.map((b) => (
                <div
                  key={b.id}
                  className="badge-item"
                  title={`${b.name}: ${b.description}`}
                >
                  <div className="badge-icon">{badgeIcon(b.id)}</div>
                  <span className="badge-name">{b.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function unlockHint(eraOrder: number): string {
  const prev = eras.find((e) => e.order === eraOrder - 1);
  if (!prev) return 'Complete the previous era to unlock.';
  const label = ERA_META[prev.key].label;
  return `Pass all ${label} quizzes and submit the ${label} concept map to unlock.`;
}
