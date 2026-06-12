'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { ViewKey } from './LaHistoryApp';

// Fixed dark navbar — a 1:1 port of the original Flask app's `.navbar`
// (templates/base.html): compass brand, view links, points pill, help (?)
// and settings (gear) buttons.

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: 'map', label: 'Map' },
  // NOTE: the original navbar has only Map + Dashboard; the concept map opens
  // as a full-screen overlay. This temporary link keeps it reachable until
  // Step 4 converts it to an overlay launched from the dashboard.
  { key: 'concept-map', label: 'Concept Map' },
  { key: 'dashboard', label: 'Dashboard' },
];

export function Navbar({
  view,
  onViewChange,
  onOpenSettings,
  onOpenShortcuts,
}: {
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}) {
  const points = useLaHistoryStore((s) => s.points);

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-brand"
        onClick={() => onViewChange('map')}
        aria-label="LA History — go to map"
      >
        <svg
          className="navbar-brand-icon"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="13" cy="13" r="11.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
          <circle cx="13" cy="13" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
          <path d="M13 2 L13 24 M2 13 L24 13" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <path d="M13 2 L15 11 L13 13 L11 11 Z" fill="currentColor" opacity="0.9" />
          <path d="M13 24 L15 15 L13 13 L11 15 Z" fill="currentColor" opacity="0.4" />
          <path d="M2 13 L11 11 L13 13 L11 15 Z" fill="currentColor" opacity="0.4" />
          <path d="M24 13 L15 11 L13 13 L15 15 Z" fill="currentColor" opacity="0.4" />
          <circle cx="13" cy="13" r="1.8" fill="currentColor" />
        </svg>
        <span className="navbar-brand-text">
          <span className="la">LA</span>
          <span className="history">History</span>
        </span>
      </button>

      <div className="navbar-divider" />

      <Link
        href="/work/la-history"
        className="navbar-link"
        aria-label="Back to LA History case study"
      >
        ← Case study
      </Link>

      <div className="navbar-spacer" />

      {VIEWS.map((v) => (
        <button
          key={v.key}
          type="button"
          onClick={() => onViewChange(v.key)}
          aria-current={view === v.key ? 'page' : undefined}
          className={cn('navbar-link', view === v.key && 'active')}
        >
          {v.label}
        </button>
      ))}

      <span className="navbar-points" aria-label={`${points} points`}>
        ✦ {points} pts
      </span>

      <button
        type="button"
        id="help-btn"
        title="Keyboard shortcuts"
        aria-label="Show keyboard shortcuts"
        onClick={onOpenShortcuts}
      >
        ?
      </button>

      <button
        type="button"
        id="settings-btn"
        title="Settings"
        aria-label="Open settings"
        onClick={onOpenSettings}
      >
        ⚙
      </button>
    </nav>
  );
}
