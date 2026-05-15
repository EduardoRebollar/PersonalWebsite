'use client';

import { chartNeutrals, fontStack } from "./shared";

export type DashboardMode = 'static' | 'interactive';

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: DashboardMode;
  onChange: (next: DashboardMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Dashboard variant"
      style={{
        display: 'inline-flex',
        gap: 0,
        background: '#FFFFFF',
        border: `1px solid ${chartNeutrals.rule}`,
        borderRadius: 999,
        padding: 3,
        fontFamily: fontStack,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <ToggleButton
        label="Static"
        active={mode === 'static'}
        onClick={() => onChange('static')}
      />
      <ToggleButton
        label="Interactive"
        active={mode === 'interactive'}
        onClick={() => onChange('interactive')}
      />
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 0,
        padding: '7px 16px',
        borderRadius: 999,
        cursor: 'pointer',
        background: active ? chartNeutrals.text : 'transparent',
        color: active ? '#FFFFFF' : chartNeutrals.subtext,
        transition: 'background 180ms ease, color 180ms ease',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
      }}
    >
      {label}
    </button>
  );
}
