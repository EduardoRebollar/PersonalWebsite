'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { ViewKey } from './LaHistoryApp';

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'concept-map', label: 'Concept Map' },
  { key: 'dashboard', label: 'Dashboard' },
];

export function Toolbar({
  view,
  onViewChange,
  onOpenSettings,
}: {
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
  onOpenSettings: () => void;
}) {
  const points = useLaHistoryStore((s) => s.points);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[var(--container-shell)] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/work/la-history"
          className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase transition-colors hover:text-fg"
          aria-label="Back to LA History case study"
        >
          ← Case study
        </Link>

        <nav
          aria-label="Demo views"
          className="ml-auto hidden items-center gap-1 sm:flex"
        >
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => onViewChange(v.key)}
              aria-current={view === v.key ? 'page' : undefined}
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors',
                view === v.key
                  ? 'border-accent text-accent'
                  : 'border-hairline text-fg-mute hover:border-fg-mute hover:text-fg',
              )}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <span
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-fg uppercase sm:ml-0"
          aria-label={`${points} points`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          {points} pts
        </span>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-fg-mute transition-colors hover:border-fg-mute hover:text-fg"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
        </button>
      </div>

      <nav
        aria-label="Demo views"
        className="flex items-center gap-1 border-t border-hairline px-4 py-2 sm:hidden"
      >
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onViewChange(v.key)}
            aria-current={view === v.key ? 'page' : undefined}
            className={cn(
              'flex-1 rounded-full border px-2 py-1 text-center font-mono text-[10px] tracking-[0.12em] uppercase transition-colors',
              view === v.key
                ? 'border-accent text-accent'
                : 'border-hairline text-fg-mute',
            )}
          >
            {v.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
