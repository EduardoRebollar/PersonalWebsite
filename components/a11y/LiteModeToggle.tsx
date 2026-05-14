'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Visual stub for Step 3. Wires up to useSceneStore in Step 5 so toggling
 * actually switches the 3D scene on and off.
 */
export function LiteModeToggle() {
  const [isLite, setIsLite] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsLite((v) => !v)}
      aria-pressed={isLite}
      aria-label={isLite ? 'Switch to full 3D mode' : 'Switch to lite (no 3D) mode'}
      className={cn(
        'group inline-flex h-8 items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 font-mono text-[11px] tracking-wider uppercase backdrop-blur-md transition-colors',
        'hover:border-accent/60 hover:text-accent',
        'focus-visible:border-accent focus-visible:text-accent',
        isLite ? 'text-fg' : 'text-fg-mute',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full transition-colors',
          isLite ? 'bg-fg-mute' : 'bg-accent shadow-[0_0_8px_var(--color-accent)]',
        )}
      />
      {isLite ? 'Lite' : 'Full'}
    </button>
  );
}
