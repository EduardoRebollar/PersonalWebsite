'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { eras } from '@/content/data/laHistory/eras';
import { locations } from '@/content/data/laHistory/locations';
import {
  BADGE_CATALOG,
  isEraUnlocked,
  locationsInEra,
} from '@/lib/laHistory/gamification';
import { ERA_META, badgeIcon } from '@/lib/laHistory/display';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { ConceptMapGraph, EraKey, Location } from '@/types/laHistory';

// Progress dashboard — 1:1 port of templates/dashboard/index.html: hero stats,
// era-progress cards, sortable badge showcase, sortable location table with a
// hover image preview, and concept-map cards with mini-graph previews.

const RING_HERO = 125.7; // r=20
const RING_ERA = 213; // r=34
const TOTAL = locations.length;

const ERA_SUB: Record<EraKey, string> = {
  native: 'Tongva People',
  spanish: '1769–1847',
  rancho: '1848–1899',
  modern: '1900–Present',
};

type BadgeSort =
  | 'default'
  | 'name'
  | 'name-desc'
  | 'earned'
  | 'date-new'
  | 'date-old';
type LocSort = 'era' | 'name' | 'name-desc' | 'visited' | 'quiz' | 'points';

type Props = {
  onOpenConceptMap: (eraOrder: number) => void;
  onGoToMap: () => void;
  onOpenLocation: (id: number) => void;
};

export function Dashboard({ onOpenConceptMap, onGoToMap, onOpenLocation }: Props) {
  const points = useLaHistoryStore((s) => s.points);
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);
  const earnedBadges = useLaHistoryStore((s) => s.badges);

  const [badgeSort, setBadgeSort] = useState<BadgeSort>('default');
  const [locSort, setLocSort] = useState<LocSort>('era');
  const [preview, setPreview] = useState<
    { src: string; name: string; x: number; y: number } | null
  >(null);

  const earnedMap = useMemo(
    () => new Map(earnedBadges.map((b) => [b.id, b])),
    [earnedBadges],
  );

  const totalVisited = useMemo(
    () => Object.values(visited).filter(Boolean).length,
    [visited],
  );
  const totalPassed = useMemo(
    () =>
      (locations as readonly Location[]).filter((l) => quizPasses[l.slug]?.passed)
        .length,
    [quizPasses],
  );
  const completionPct = TOTAL > 0 ? Math.round((totalPassed / TOTAL) * 100) : 0;
  const visitPts = totalVisited * 10;
  const quizPts = useMemo(
    () =>
      Object.values(quizPasses).reduce((a, p) => a + (p?.pointsAwarded ?? 0), 0),
    [quizPasses],
  );
  const earnedCount = earnedBadges.length;

  // Location rows.
  const rows = useMemo(() => {
    const out = eras.flatMap((era) =>
      locationsInEra(era.order).map((loc, i) => {
        const attempt = quizPasses[loc.slug];
        const unlocked = isEraUnlocked(era.order, { quizPasses, conceptMaps })
          ? true
          : loc.isStarter;
        const wasVisited = !!visited[loc.slug];
        return {
          loc,
          eraOrder: era.order,
          eraKey: loc.era,
          unlocked,
          visited: wasVisited,
          quizPassed: !!attempt?.passed,
          quizScore: attempt?.bestScore ?? 0,
          attempts: attempt?.attempts ?? 0,
          points: (wasVisited ? 10 : 0) + (attempt?.pointsAwarded ?? 0),
          idx: era.order * 100 + i,
        };
      }),
    );
    const sorted = [...out];
    sorted.sort((a, b) => {
      switch (locSort) {
        case 'name':
          return a.loc.name.localeCompare(b.loc.name);
        case 'name-desc':
          return b.loc.name.localeCompare(a.loc.name);
        case 'visited': {
          const va = a.unlocked ? (a.visited ? 1 : 0) : -1;
          const vb = b.unlocked ? (b.visited ? 1 : 0) : -1;
          return vb - va || a.idx - b.idx;
        }
        case 'quiz':
          return b.quizScore - a.quizScore || a.idx - b.idx;
        case 'points':
          return b.points - a.points || a.idx - b.idx;
        default:
          return a.idx - b.idx;
      }
    });
    return sorted;
  }, [quizPasses, conceptMaps, visited, locSort]);

  // Badge cards.
  const badgeCards = useMemo(() => {
    const all = BADGE_CATALOG.map((b, i) => {
      const earned = earnedMap.get(b.id);
      return {
        ...b,
        earned: !!earned,
        earnedAt: earned?.earnedAt ?? 0,
        idx: i,
      };
    });
    all.sort((a, b) => {
      switch (badgeSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'earned':
          return Number(b.earned) - Number(a.earned) || a.idx - b.idx;
        case 'date-new':
          return Number(b.earned) - Number(a.earned) || b.earnedAt - a.earnedAt;
        case 'date-old':
          return Number(b.earned) - Number(a.earned) || a.earnedAt - b.earnedAt;
        default:
          return a.idx - b.idx;
      }
    });
    return all;
  }, [earnedMap, badgeSort]);

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-greeting">
          <div className="hero-greeting-eyebrow">Explorer Profile</div>
          <h1>Explorer</h1>
          <span className="hero-rule" />
          <p>Your Los Angeles history journey</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat hero-stat-has-tip hero-stat-completion" tabIndex={0}>
            <div className="hero-completion-ring">
              <svg width="54" height="54" viewBox="0 0 52 52">
                <circle className="hero-ring-bg" cx="26" cy="26" r="20" />
                <circle
                  className="hero-ring-fill"
                  cx="26"
                  cy="26"
                  r="20"
                  strokeDasharray={RING_HERO}
                  strokeDashoffset={RING_HERO - (RING_HERO * completionPct) / 100}
                />
              </svg>
              <div className="hero-ring-label">{completionPct}%</div>
            </div>
            <span className="hero-stat-label">Complete</span>
            <div className="hero-stat-tip">
              <span>📊 {completionPct}% overall completion</span>
              <span>✅ {totalPassed} / {TOTAL} quizzes passed</span>
              <span>📍 {totalVisited} / {TOTAL} locations visited</span>
            </div>
          </div>
          <div className="hero-stat hero-stat-points" tabIndex={0}>
            <span className="hero-stat-value">{points}</span>
            <span className="hero-stat-label">Points</span>
            <div className="points-breakdown-tip">
              <span>🗺 {visitPts} visit pts</span>
              <span>📝 {quizPts} quiz pts</span>
            </div>
          </div>
          <div className="hero-stat hero-stat-has-tip" tabIndex={0}>
            <span className="hero-stat-value">{totalVisited}</span>
            <span className="hero-stat-label">Visited</span>
            <div className="hero-stat-tip">
              <span>🗺 {totalVisited} of {TOTAL} locations</span>
              <span>⬜ {TOTAL - totalVisited} remaining</span>
            </div>
          </div>
          <div className="hero-stat hero-stat-has-tip" tabIndex={0}>
            <span className="hero-stat-value">{totalPassed}</span>
            <span className="hero-stat-label">Quizzes Passed</span>
            <div className="hero-stat-tip">
              <span>✅ {totalPassed} of {TOTAL} quizzes</span>
              <span>❌ {TOTAL - totalPassed} not yet passed</span>
            </div>
          </div>
          <div className="hero-stat hero-stat-has-tip" tabIndex={0}>
            <span className="hero-stat-value">{earnedCount}</span>
            <span className="hero-stat-label">Badges</span>
            <div className="hero-stat-tip">
              <span>🏅 {earnedCount} of {BADGE_CATALOG.length} earned</span>
              <span>🔒 {BADGE_CATALOG.length - earnedCount} still locked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Era progress */}
      <h2 className="section-title">Era Progress</h2>
      <div className="era-cards">
        {eras.map((era) => {
          const locs = locationsInEra(era.order);
          const total = locs.length;
          const passed = locs.filter((l) => quizPasses[l.slug]?.passed).length;
          const vis = locs.filter((l) => visited[l.slug]).length;
          const pct = total > 0 ? Math.floor((passed / total) * 100) : 0;
          const unlocked = isEraUnlocked(era.order, { quizPasses, conceptMaps });
          const meta = ERA_META[era.key];
          return (
            <div className={cn('era-card', era.key)} key={era.order}>
              <div className="era-card-name">
                Era {era.order}: {meta.label}
              </div>
              <div className="era-card-sub">{ERA_SUB[era.key]}</div>
              <div className="era-ring-container">
                <div className="era-ring">
                  <svg width="84" height="84" viewBox="0 0 84 84">
                    <circle className="era-ring-bg" cx="42" cy="42" r="34" />
                    <circle
                      className="era-ring-fill"
                      cx="42"
                      cy="42"
                      r="34"
                      stroke={meta.color}
                      strokeDasharray={RING_ERA}
                      strokeDashoffset={RING_ERA - (RING_ERA * pct) / 100}
                    />
                  </svg>
                  <div className="era-ring-text">
                    <span className="era-ring-pct" style={{ color: meta.color }}>
                      {pct}%
                    </span>
                    <span className="era-ring-sub">passed</span>
                  </div>
                </div>
              </div>
              <div className="era-card-stats">
                <span>
                  📍 Visited: <strong>{vis}/{total}</strong>
                </span>
                <span>
                  ✅ Passed: <strong>{passed}/{total}</strong>
                </span>
              </div>
              <div className="era-card-status">
                {!unlocked
                  ? '🔒 Locked'
                  : passed === total
                    ? '🏆 Era complete!'
                    : `⬜ ${total - passed} quiz${total - passed !== 1 ? 'zes' : ''} remaining`}
              </div>
              <div className="era-card-tip">
                <span>
                  {meta.emoji} <strong>{ERA_SUB[era.key]}</strong>
                </span>
                <span>
                  📊 Completion: <strong>{pct}%</strong>
                </span>
                {!unlocked ? (
                  <span>🔒 Locked — complete Era {era.order - 1} to unlock</span>
                ) : passed === total ? (
                  <span>🏆 Era complete!</span>
                ) : (
                  <span>
                    ⬜ {total - passed} quiz
                    {total - passed !== 1 ? 'zes' : ''} remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <h2 className="section-title">Badge Collection</h2>
      <div className="sort-bar">
        <span className="sort-label">Sort:</span>
        <select
          className="sort-select"
          value={badgeSort}
          onChange={(e) => setBadgeSort(e.target.value as BadgeSort)}
          aria-label="Sort badges"
        >
          <option value="default">Default</option>
          <option value="name">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="earned">Earned First</option>
          <option value="date-new">Date (Newest)</option>
          <option value="date-old">Date (Oldest)</option>
        </select>
      </div>
      <div className="badge-showcase">
        {badgeCards.map((b) => (
          <div
            key={b.id}
            className={cn('badge-card', !b.earned && 'badge-card-locked')}
          >
            <div className="badge-card-icon">{badgeIcon(b.id)}</div>
            <div className="badge-card-info">
              <h4>{b.earned ? b.name : `🔒 ${b.name}`}</h4>
              <p>{b.description}</p>
              {b.earned && b.earnedAt ? (
                <span className="badge-card-date">
                  {new Date(b.earnedAt).toISOString().slice(0, 10)}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Location breakdown */}
      <h2 className="section-title">Location Breakdown</h2>
      <div className="sort-bar">
        <span className="sort-label">Sort:</span>
        <select
          className="sort-select"
          value={locSort}
          onChange={(e) => setLocSort(e.target.value as LocSort)}
          aria-label="Sort locations"
        >
          <option value="era">By Era</option>
          <option value="name">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="visited">Visited First</option>
          <option value="quiz">Quiz Score ↓</option>
          <option value="points">Points ↓</option>
        </select>
      </div>
      <table className="location-table">
        <thead>
          <tr>
            <th>Location</th>
            <th>Era</th>
            <th>Status</th>
            <th>Quiz</th>
            <th>Tries</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.loc.id}
              onMouseEnter={(e) =>
                r.loc.imageUrl &&
                setPreview({
                  src: r.loc.imageUrl,
                  name: r.loc.name,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseMove={(e) =>
                setPreview((p) => (p ? { ...p, x: e.clientX, y: e.clientY } : p))
              }
              onMouseLeave={() => setPreview(null)}
            >
              <td style={{ fontWeight: 500 }}>
                {r.loc.name}
                {r.unlocked ? (
                  <button
                    type="button"
                    className="loc-map-btn"
                    title="View on map"
                    onClick={() => onOpenLocation(r.loc.id)}
                  >
                    ↗ Map
                  </button>
                ) : null}
              </td>
              <td>
                <span className={cn('era-badge', r.eraKey)}>{r.eraKey}</span>
              </td>
              <td>
                {!r.unlocked ? (
                  <span style={{ color: 'var(--era-locked)', fontSize: '0.8rem' }}>
                    🔒 Locked
                  </span>
                ) : r.visited ? (
                  <>
                    <span className="status-dot visited" />
                    Visited
                  </>
                ) : (
                  <>
                    <span className="status-dot unvisited" />
                    Unvisited
                  </>
                )}
              </td>
              <td>
                {r.quizPassed ? (
                  <span className="quiz-passed-badge">✓ {r.quizScore}%</span>
                ) : r.unlocked ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Not taken
                  </span>
                ) : (
                  <span style={{ color: 'var(--border)' }}>—</span>
                )}
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {r.attempts > 0 ? `${r.attempts}×` : '—'}
              </td>
              <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                {r.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Concept maps */}
      <h2 className="section-title">Concept Maps</h2>
      <div className="cm-dash-grid">
        {eras.map((era) => {
          const cm = conceptMaps[era.order];
          const unlocked = isEraUnlocked(era.order, { quizPasses, conceptMaps });
          const meta = ERA_META[era.key];
          const { nodes, edges } = graphSummary(cm?.graph);
          const score = cm?.evaluation?.synthesisScore;
          const pts = cm?.evaluation?.pointsAwarded ?? 0;
          return (
            <div
              className={cn('cm-dash-card', era.key, !unlocked && 'cm-dash-card-locked')}
              key={era.order}
            >
              <div className="cm-dash-card-header">
                <span className="cm-dash-card-name">
                  {meta.emoji} Era {era.order}: {meta.label}
                </span>
                {!unlocked ? (
                  <span className="cm-dash-status locked">🔒 Locked</span>
                ) : cm?.submitted ? (
                  <span className="cm-dash-status submitted">Submitted ✓</span>
                ) : cm ? (
                  <span className="cm-dash-status in-progress">In Progress</span>
                ) : (
                  <span className="cm-dash-status not-started">Not Started</span>
                )}
              </div>

              {!unlocked ? (
                <div className="cm-dash-stats cm-dash-locked-hint">
                  Pass all Era {era.order - 1} quizzes and submit that concept map
                  to unlock
                </div>
              ) : nodes.length > 0 ? (
                <div className="cm-dash-stats">
                  {nodes.length} concept{nodes.length !== 1 ? 's' : ''} ·{' '}
                  {edges.length} connection{edges.length !== 1 ? 's' : ''}
                </div>
              ) : !cm ? (
                <div className="cm-dash-stats" style={{ fontStyle: 'italic' }}>
                  No map created yet
                </div>
              ) : (
                <div className="cm-dash-stats" style={{ fontStyle: 'italic' }}>
                  Empty map
                </div>
              )}

              {cm?.submitted && score != null ? (
                <div className="cm-dash-score">
                  <div className="cm-score-bar-bg">
                    <div
                      className="cm-score-bar-fill"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="cm-score-val">{score}/100</span>
                </div>
              ) : null}

              {unlocked ? (
                <div className="cm-mini-preview">
                  <CmMini nodes={nodes} edges={edges} color={meta.color} />
                </div>
              ) : null}

              <div className="cm-dash-footer">
                <span className="cm-dash-pts">{pts ? `✦ ${pts} pts` : ''}</span>
                {unlocked ? (
                  <button
                    type="button"
                    className="cm-dash-open-btn"
                    onClick={() => onOpenConceptMap(era.order)}
                  >
                    Open →
                  </button>
                ) : (
                  <span className="cm-dash-open-btn cm-dash-open-btn-disabled">
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-footer">
        <button type="button" className="btn btn-primary btn-lg" onClick={onGoToMap}>
          Continue Exploring →
        </button>
      </div>

      {preview ? (
        <div
          id="loc-img-preview"
          style={{
            display: 'block',
            left: Math.min(preview.x + 16, window.innerWidth - 180),
            top: Math.min(preview.y + 16, window.innerHeight - 140),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.src} alt="" />
          <div id="loc-img-preview-name">{preview.name}</div>
        </div>
      ) : null}
    </div>
  );
}

function graphSummary(graph: ConceptMapGraph | undefined): {
  nodes: string[];
  edges: [number, number][];
} {
  if (!graph) return { nodes: [], edges: [] };
  const nodeEls = graph.elements.filter((e) => {
    const d = e.data as { source?: string; target?: string } | undefined;
    return !(d?.source && d?.target);
  });
  const idIndex = new Map<string, number>();
  const nodes: string[] = [];
  nodeEls.forEach((e, i) => {
    const d = e.data as { id?: string; label?: string } | undefined;
    if (d?.id) idIndex.set(d.id, i);
    nodes.push(d?.label ?? '');
  });
  const edges: [number, number][] = [];
  for (const e of graph.elements) {
    const d = e.data as { source?: string; target?: string } | undefined;
    if (d?.source && d?.target) {
      const s = idIndex.get(d.source);
      const t = idIndex.get(d.target);
      if (s != null && t != null) edges.push([s, t]);
    }
  }
  return { nodes, edges };
}

function CmMini({
  nodes,
  edges,
  color,
}: {
  nodes: string[];
  edges: [number, number][];
  color: string;
}) {
  if (nodes.length === 0) {
    return <div className="cm-mini-preview-empty">No concepts added yet</div>;
  }
  const W = 200;
  const H = 130;
  const cx = W / 2;
  const cy = H / 2;
  const n = nodes.length;
  const pos = nodes.map((_, i) => {
    if (n === 1) return { x: cx, y: cy };
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = Math.min(W, H) * 0.36;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const nodeFill = '#f8f4ec';
  const textFill = '#5a4535';
  const edgeStroke = 'rgba(0,0,0,0.12)';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      {edges.map(([s, t], i) =>
        s < 0 || t < 0 || s >= n || t >= n ? null : (
          <line
            key={`e${i}`}
            x1={pos[s]!.x}
            y1={pos[s]!.y}
            x2={pos[t]!.x}
            y2={pos[t]!.y}
            stroke={edgeStroke}
            strokeWidth={1.5}
          />
        ),
      )}
      {nodes.map((label, i) => (
        <g key={`n${i}`}>
          <circle cx={pos[i]!.x} cy={pos[i]!.y} r={15} fill={nodeFill} stroke={color} strokeWidth={1.5} />
          <text
            x={pos[i]!.x}
            y={pos[i]!.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={5.5}
            fontFamily="sans-serif"
            fill={textFill}
          >
            {label.length > 9 ? `${label.slice(0, 8)}…` : label}
          </text>
        </g>
      ))}
    </svg>
  );
}
