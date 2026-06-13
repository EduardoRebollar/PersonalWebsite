'use client';

// Parchment-skinned onboarding walkthrough. Auto-shows once on first visit
// (suppressed under prefers-reduced-motion), and can be replayed from
// Settings via `forceOpen`. (A lighter card than the original spotlight tour.)

import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { playSfx } from '@/lib/laHistory/sfx';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Explore the map',
    body: 'Tap an unlocked marker to open its history. Era 1 (Tongva) is open right away; the others unlock as you progress.',
  },
  {
    title: 'Take quizzes and chat with the tutor',
    body: 'Each location has a short quiz and a Socratic tutor. Hints cost points but never reveal the answer.',
  },
  {
    title: 'Build a concept map',
    body: 'Open a concept map from the sidebar, drop nodes, draw labeled edges, and submit for an AI evaluation. Submitting completes an era and unlocks the next.',
  },
];

export function Tutorial({
  forceOpen,
  onForceClose,
}: {
  forceOpen: boolean;
  onForceClose: () => void;
}) {
  const tutorialSeen = useLaHistoryStore((s) => s.tutorialSeen);
  const markTutorialSeen = useLaHistoryStore((s) => s.markTutorialSeen);
  const [step, setStep] = useState(0);

  const visible = !tutorialSeen || forceOpen;

  // Reset to the first step each time the dialog becomes visible.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setStep(0);
  }

  // Auto-suppress the first-run tour under reduced motion (not a replay).
  useEffect(() => {
    if (!tutorialSeen && !forceOpen && prefersReducedMotion()) {
      markTutorialSeen();
    }
  }, [tutorialSeen, forceOpen, markTutorialSeen]);

  function finish() {
    if (!tutorialSeen) markTutorialSeen();
    if (forceOpen) onForceClose();
    playSfx('tutorial-complete');
  }

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') finish();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="settings-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the LA History demo"
      style={{ zIndex: 1300 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) finish();
      }}
    >
      <div className="settings-modal" style={{ width: 460, maxWidth: 'calc(100vw - 32px)' }}>
        <div className="settings-modal-header">
          <span>
            Welcome · {step + 1} / {STEPS.length}
          </span>
          <button
            type="button"
            className="settings-close"
            aria-label="Close walkthrough"
            onClick={finish}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '16px 20px 20px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            {current.title}
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text)' }}>
            {current.body}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 20,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }} aria-hidden>
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  style={{
                    height: 6,
                    width: 24,
                    borderRadius: 99,
                    background: i === step ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={finish}>
                Skip
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (isLast) finish();
                  else {
                    setStep((x) => x + 1);
                    playSfx('tutorial-step');
                  }
                }}
              >
                {isLast ? 'Start' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
