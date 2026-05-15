'use client';

import { useSceneStore } from '@/stores/useSceneStore';
import { cn } from '@/lib/cn';

/**
 * Toggle in the nav that flips between full (3D) and lite (no canvas) modes.
 * Auto-detected state is set by <DeviceDetector />; clicking this button
 * overrides auto-detection.
 */
export function LiteModeToggle() {
  const liteMode = useSceneStore((s) => s.liteMode);
  const toggleLiteMode = useSceneStore((s) => s.toggleLiteMode);

  return (
    <button
      type="button"
      onClick={toggleLiteMode}
      aria-pressed={liteMode}
      aria-label={liteMode ? 'Switch to full 3D mode' : 'Switch to lite (no 3D) mode'}
      className={cn(
        'group inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 font-mono text-[11px] tracking-wider uppercase backdrop-blur-md transition-colors',
        'hover:border-accent/60 hover:text-accent',
        'focus-visible:border-accent focus-visible:text-accent',
        liteMode ? 'text-fg-mute' : 'text-fg',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full transition-colors',
          liteMode ? 'bg-fg-mute' : 'bg-accent shadow-[0_0_8px_var(--color-accent)]',
        )}
      />
      {liteMode ? 'Lite' : 'Full'}
    </button>
  );
}
