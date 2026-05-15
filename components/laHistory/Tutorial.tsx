'use client';

// Thin 3-step onboarding. Suppressed on prefers-reduced-motion (per
// CLAUDE.md user memory). One-shot — once dismissed it never re-appears
// unless the user resets progress in Settings.

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Explore the map',
    body: 'Tap an unlocked marker to open its history. Era 1 (Tongva) is open right away; the others unlock as you build up.',
  },
  {
    title: 'Take quizzes and chat with the tutor',
    body: 'Each location has a short quiz and a Socratic tutor. Hints cost points but never reveal the answer.',
  },
  {
    title: 'Build a concept map',
    body: 'In Concept Map view, drop nodes, draw labeled edges, and submit your map for an AI evaluation. Submitting completes an era and unlocks the next.',
  },
];

export function Tutorial() {
  const tutorialSeen = useLaHistoryStore((s) => s.tutorialSeen);
  const markTutorialSeen = useLaHistoryStore((s) => s.markTutorialSeen);
  const [step, setStep] = useState(0);

  // Auto-suppress when the OS asks for reduced motion. We also flag it as
  // seen so the user doesn't get a fresh tutorial on next visit.
  useEffect(() => {
    if (!tutorialSeen && prefersReducedMotion()) {
      markTutorialSeen();
    }
  }, [tutorialSeen, markTutorialSeen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') markTutorialSeen();
    }
    if (!tutorialSeen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [tutorialSeen, markTutorialSeen]);

  if (tutorialSeen) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the LA History demo"
      className="fixed inset-0 z-[55] grid place-items-center bg-base/70 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-6 shadow-2xl">
        <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
          Welcome · {step + 1} / {STEPS.length}
        </p>
        <h2 className="mt-2 font-display text-2xl text-fg">{current.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-fg">{current.body}</p>

        <div className="mt-6 flex items-center gap-2">
          <div
            className="flex gap-1.5"
            role="tablist"
            aria-label="Tutorial steps"
          >
            {STEPS.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  'h-1.5 w-6 rounded-full',
                  i === step ? 'bg-accent' : 'bg-hairline',
                )}
              />
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={markTutorialSeen}
              className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase hover:text-fg"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() =>
                isLast ? markTutorialSeen() : setStep((s) => s + 1)
              }
              className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] text-accent uppercase hover:bg-accent/20"
            >
              {isLast ? 'Start' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
