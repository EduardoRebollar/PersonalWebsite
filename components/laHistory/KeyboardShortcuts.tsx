'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

// Keyboard-shortcuts overlay — 1:1 port of the original `.shortcut-overlay`
// (templates/base.html). Toggled by `?` / the navbar help button.

type Row = { keys: string[]; desc: string; context?: string; plus?: boolean };
type Group = { label?: string; rows: Row[] };

const GROUPS: Group[] = [
  { rows: [{ keys: ['?'], desc: 'Show / hide this overlay' }] },
  {
    label: 'Map',
    rows: [
      { keys: ['/'], desc: 'Focus location search' },
      { keys: ['S'], desc: 'Toggle sidebar' },
      { keys: ['R'], desc: 'Reset map view' },
      { keys: ['↑', '↓', '←', '→'], desc: 'Pan map' },
      { keys: ['Q'], desc: 'Take quiz', context: '(when location open)' },
      { keys: ['T'], desc: 'Read aloud', context: '(when location open)' },
      { keys: ['Esc'], desc: 'Close open panel / modal' },
    ],
  },
  {
    label: 'Concept Map',
    rows: [
      { keys: ['Ctrl', 'Z'], desc: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' },
      { keys: ['Delete'], desc: 'Remove selected node / edge' },
      { keys: ['Enter'], desc: 'Confirm connection / label' },
      { keys: ['Esc'], desc: 'Cancel / close menus' },
    ],
  },
];

export function KeyboardShortcuts({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn('shortcut-overlay', open && 'open')}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="shortcut-modal">
        <div className="shortcut-modal-header">
          <span>Keyboard Shortcuts</span>
          <button
            type="button"
            className="settings-close"
            aria-label="Close shortcuts"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="shortcut-body">
          {GROUPS.map((group, gi) => (
            <div className="shortcut-group" key={gi}>
              {group.label ? (
                <div className="shortcut-group-label">{group.label}</div>
              ) : null}
              {group.rows.map((row, ri) => (
                <div className="shortcut-row" key={ri}>
                  <div className="shortcut-keys">
                    {row.keys.map((k, ki) => (
                      <kbd key={ki}>{k}</kbd>
                    ))}
                  </div>
                  <div className="shortcut-desc">
                    {row.desc}
                    {row.context ? (
                      <span className="shortcut-context"> {row.context}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
