'use client';

import { useEffect, useState } from 'react';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';

type Props = {
  onClose: () => void;
};

export function SettingsPanel({ onClose }: Props) {
  const audio = useLaHistoryStore((s) => s.audio);
  const setAudio = useLaHistoryStore((s) => s.setAudio);
  const reset = useLaHistoryStore((s) => s.reset);

  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      className="fixed inset-0 z-[60] grid place-items-center bg-base/70 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl text-fg">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-fg-mute transition-colors hover:border-accent hover:text-accent"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4"
            >
              <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <section className="mt-6">
          <h3 className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
            Ambient music
          </h3>
          <div className="mt-2 flex items-center justify-between gap-3">
            <label
              htmlFor="la-history-audio-enabled"
              className="text-sm text-fg"
            >
              Synthesized drone (off by default)
            </label>
            <input
              id="la-history-audio-enabled"
              type="checkbox"
              checked={audio.enabled}
              onChange={(e) => setAudio({ enabled: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
          </div>
          <div className="mt-3">
            <label
              htmlFor="la-history-audio-volume"
              className="flex items-center justify-between text-xs text-fg-mute"
            >
              <span>Volume</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase">
                {Math.round(audio.volume * 100)}%
              </span>
            </label>
            <input
              id="la-history-audio-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.volume}
              onChange={(e) =>
                setAudio({ volume: Number(e.target.value) })
              }
              disabled={!audio.enabled}
              className="mt-1 w-full accent-[var(--color-accent)] disabled:opacity-40"
            />
          </div>
        </section>

        <section className="mt-8 border-t border-hairline pt-6">
          <h3 className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
            Progress
          </h3>
          <p className="mt-2 text-sm text-fg-mute">
            Progress is stored locally in your browser. Nothing is sent to a
            server.
          </p>
          {confirmReset ? (
            <div className="mt-3 rounded-xl border border-warn/40 bg-warn/5 p-3">
              <p className="text-sm text-fg">
                This wipes points, badges, quiz results, concept maps, and
                chat history. It can&apos;t be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="rounded-full border border-warn bg-warn/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-warn uppercase hover:bg-warn/25"
                >
                  Yes — reset everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase hover:text-fg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="mt-3 rounded-full border border-warn/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-warn uppercase hover:bg-warn/10"
            >
              Reset progress…
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
