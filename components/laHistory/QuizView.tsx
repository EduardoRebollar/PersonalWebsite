'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  eraByOrder,
} from '@/content/data/laHistory/eras';
import {
  POINTS,
  locationForId,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type {
  AnswerKey,
  Badge,
  QuizQuestion,
} from '@/types/laHistory';

type Props = {
  locationId: number;
  onClose: () => void;
};

type AnswerState = Record<
  number,
  { picked: AnswerKey; correct: boolean }
>;

type QuizResult = {
  scorePercent: number;
  passed: boolean;
  pointsEarned: number;
  newBadges: Badge[];
  newlyUnlockedLocationIds: number[];
};

function questionOptions(
  q: QuizQuestion,
): { key: AnswerKey; text: string }[] {
  if (q.questionType === 'true_false') {
    return [
      { key: 'a', text: 'True' },
      { key: 'b', text: 'False' },
    ];
  }
  const out: { key: AnswerKey; text: string }[] = [];
  if (q.optionA) out.push({ key: 'a', text: q.optionA });
  if (q.optionB) out.push({ key: 'b', text: q.optionB });
  if (q.optionC) out.push({ key: 'c', text: q.optionC });
  if (q.optionD) out.push({ key: 'd', text: q.optionD });
  return out;
}

function explanationFor(q: QuizQuestion, picked: AnswerKey): string {
  if (picked === q.correctAnswer) return q.explanation;
  const map: Record<AnswerKey, string | undefined> = {
    a: q.wrongExplanationA,
    b: q.wrongExplanationB,
    c: q.wrongExplanationC,
    d: q.wrongExplanationD,
  };
  return map[picked] || q.explanation;
}

function hintKey(slug: string, idx: number): string {
  return `${slug}:${idx}`;
}

export function QuizView({ locationId, onClose }: Props) {
  const location = useMemo(() => locationForId(locationId), [locationId]);
  const quiz = useMemo(
    () => (location ? quizForSlug(location.slug) : undefined),
    [location],
  );
  const era = location ? eraByOrder.get(location.eraOrder) : undefined;

  const points = useLaHistoryStore((s) => s.points);
  const recordHint = useLaHistoryStore((s) => s.recordHint);
  const recordQuizSubmission = useLaHistoryStore(
    (s) => s.recordQuizSubmission,
  );
  const cachedHints = useLaHistoryStore((s) => s.hints);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [picked, setPicked] = useState<AnswerKey | null>(null);
  const [reveal, setReveal] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [hintsTotal, setHintsTotal] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!location || !quiz) return null;
  const total: number = quiz.questions.length;

  const question = quiz.questions[index]!;
  const options = questionOptions(question);
  const cachedHint = cachedHints[hintKey(location.slug, index)];
  const hasHint = !!cachedHint;

  async function fetchHint() {
    setHintError(null);
    if (cachedHint) return;
    if (points < POINTS.hint) {
      setHintError(`Need ${POINTS.hint} pts for a hint.`);
      return;
    }
    setHintLoading(true);
    try {
      const res = await fetch('/api/la-history/quiz/hint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locationSlug: location!.slug,
          questionIndex: index,
        }),
      });
      if (!res.ok) {
        setHintError('Couldn’t fetch a hint. Try again in a moment.');
        setHintLoading(false);
        return;
      }
      const data = (await res.json()) as { hint?: string; error?: string };
      const text = data.hint?.trim();
      if (!text) {
        setHintError('The hint service returned an empty response.');
        setHintLoading(false);
        return;
      }
      const stored = recordHint(hintKey(location!.slug, index), text);
      if (!stored.ok) {
        setHintError(`Need ${POINTS.hint} pts for a hint.`);
      } else {
        setHintsTotal((h) => h + 1);
      }
    } catch {
      setHintError('Network error fetching hint.');
    } finally {
      setHintLoading(false);
    }
  }

  function checkAnswer() {
    if (picked == null) return;
    const correct = picked === question.correctAnswer;
    setAnswers((a) => ({ ...a, [index]: { picked, correct } }));
    setReveal(true);
  }

  function advance() {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPicked(null);
      setReveal(false);
      return;
    }
    // Final submit — compute score from accumulated answers, including
    // the just-revealed current question.
    const correctCount = Object.values(answers).filter((a) => a.correct).length;
    const scorePercent = Math.round((correctCount / total) * 100);
    const outcome = recordQuizSubmission({
      locationSlug: location!.slug,
      scorePercent,
      hintsUsed: hintsTotal,
    });
    setResult({
      scorePercent,
      passed: outcome.passed,
      pointsEarned: outcome.pointsEarned,
      newBadges: outcome.newBadges,
      newlyUnlockedLocationIds: outcome.newlyUnlockedLocationIds,
    });
  }

  if (result) {
    return (
      <QuizResultScreen
        locationName={location.name}
        eraAccent={era?.accentColor ?? '#4fc3d9'}
        result={result}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${location.name} quiz`}
      className="fixed inset-0 z-50 grid place-items-center bg-base/80 p-4 backdrop-blur-md"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
              {quiz.title}
            </p>
            <p className="mt-0.5 font-display text-xl text-fg">
              Question {index + 1} / {total}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz"
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
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-lg leading-relaxed text-fg">
            {question.questionText}
          </p>

          <ul className="mt-5 space-y-2">
            {options.map((opt) => {
              const isCorrect = opt.key === question.correctAnswer;
              const isPicked = picked === opt.key;
              const revealedThis = reveal && isPicked;
              const revealedCorrect = reveal && isCorrect;
              return (
                <li key={opt.key}>
                  <button
                    type="button"
                    disabled={reveal}
                    onClick={() => setPicked(opt.key)}
                    aria-pressed={isPicked}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      'disabled:cursor-default',
                      revealedCorrect && 'border-accent bg-accent/10 text-fg',
                      revealedThis && !isCorrect &&
                        'border-warn bg-warn/10 text-fg',
                      !reveal && isPicked &&
                        'border-accent text-fg',
                      !reveal && !isPicked &&
                        'border-hairline text-fg hover:border-fg-mute',
                    )}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current font-mono text-[10px] uppercase">
                      {opt.key}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {reveal ? (
            <div
              className={cn(
                'mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed',
                answers[index]?.correct
                  ? 'border-accent/40 bg-accent/5 text-fg'
                  : 'border-warn/40 bg-warn/5 text-fg',
              )}
              aria-live="polite"
            >
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase">
                {answers[index]?.correct ? 'Correct' : 'Not quite'}
              </p>
              <p className="mt-1.5">
                {explanationFor(question, picked!)}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <button
                type="button"
                onClick={fetchHint}
                disabled={hintLoading || hasHint}
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-50"
              >
                {hasHint
                  ? 'Hint shown'
                  : hintLoading
                    ? 'Loading hint…'
                    : `Hint (−${POINTS.hint} pts)`}
              </button>
              {hasHint ? (
                <p className="mt-3 rounded-xl border border-hairline bg-base/40 px-4 py-3 text-sm leading-relaxed text-fg">
                  {cachedHint}
                </p>
              ) : null}
              {hintError ? (
                <p className="mt-2 text-xs text-warn">{hintError}</p>
              ) : null}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-hairline px-6 py-4">
          <span className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
            {points} pts · pass at 75%
          </span>
          {reveal ? (
            <button
              type="button"
              onClick={advance}
              className="rounded-full border border-accent bg-accent/10 px-5 py-2 font-mono text-[11px] tracking-[0.14em] text-accent uppercase transition-colors hover:bg-accent/20"
            >
              {index + 1 < total ? 'Next question' : 'See results'}
            </button>
          ) : (
            <button
              type="button"
              onClick={checkAnswer}
              disabled={picked == null}
              className="rounded-full border border-hairline px-5 py-2 font-mono text-[11px] tracking-[0.14em] text-fg uppercase transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
            >
              Check answer
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function QuizResultScreen({
  locationName,
  eraAccent,
  result,
  onClose,
}: {
  locationName: string;
  eraAccent: string;
  result: QuizResult;
  onClose: () => void;
}) {
  const unlockedNames = result.newlyUnlockedLocationIds
    .map((id) => locationForId(id)?.name)
    .filter((n): n is string => !!n);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quiz result"
      className="fixed inset-0 z-50 grid place-items-center bg-base/85 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 text-center shadow-2xl">
        <span
          className="mx-auto mb-3 inline-flex h-2 w-12 rounded-full"
          style={{ background: eraAccent }}
          aria-hidden
        />
        <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
          {locationName}
        </p>
        <p className="mt-2 font-display text-5xl text-fg">
          {result.scorePercent}%
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-[11px] tracking-[0.18em] uppercase',
            result.passed ? 'text-accent' : 'text-warn',
          )}
        >
          {result.passed ? 'Passed' : 'Keep going — try again'}
        </p>

        {result.pointsEarned > 0 ? (
          <p className="mt-4 text-fg">+{result.pointsEarned} points</p>
        ) : null}

        {result.newBadges.length > 0 ? (
          <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-3 text-left">
            <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
              New badge{result.newBadges.length > 1 ? 's' : ''}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-fg">
              {result.newBadges.map((b) => (
                <li key={b.id}>
                  <span className="font-medium">{b.name}</span>{' '}
                  <span className="text-fg-mute">— {b.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {unlockedNames.length > 0 ? (
          <div className="mt-4 rounded-xl border border-glow/40 bg-glow/5 p-3 text-left">
            <p className="font-mono text-[10px] tracking-[0.18em] text-glow uppercase">
              Newly unlocked
            </p>
            <ul className="mt-2 space-y-1 text-sm text-fg">
              {unlockedNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-hairline px-5 py-2 font-mono text-[11px] tracking-[0.14em] text-fg uppercase transition-colors hover:border-accent hover:text-accent"
        >
          Back to map
        </button>
      </div>
    </div>
  );
}
