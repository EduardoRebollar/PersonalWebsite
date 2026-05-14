import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AsideProps = {
  tone?: 'note' | 'warn';
  title?: string;
  children: ReactNode;
};

const toneStyles = {
  note: 'border-accent/40 bg-accent/5',
  warn: 'border-warn/40 bg-warn/5',
} as const;

const toneLabels = {
  note: 'Note',
  warn: 'Heads up',
} as const;

export function Aside({ tone = 'note', title, children }: AsideProps) {
  return (
    <aside
      className={cn(
        'my-8 rounded-xl border bg-surface/30 p-5 backdrop-blur-sm',
        toneStyles[tone],
      )}
    >
      <p
        className={cn(
          'mb-2 font-mono text-[11px] tracking-[0.18em] uppercase',
          tone === 'warn' ? 'text-warn' : 'text-accent',
        )}
      >
        {title ?? toneLabels[tone]}
      </p>
      <div className="text-fg-mute">{children}</div>
    </aside>
  );
}
