'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  PASSING_SCORE,
  POINTS,
  locationForId,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import { playSfx } from '@/lib/laHistory/sfx';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { AnswerKey, Badge, QuizQuestion } from '@/types/laHistory';

// Quiz modal — 1:1 port of the original `.quiz-modal` (static/js/quiz.js):
// single-button two-phase flow (check → continue), per-question feedback,
// AI hint, results screen with recap. Reuses the existing store actions.

type Props = {
  locationId: number;
  onClose: () => void;
};

type AnswerState = Record<number, { picked: AnswerKey; correct: boolean }>;

type QuizResult = {
  scorePercent: number;
  passed: boolean;
  pointsEarned: number;
  correctCount: number;
  newBadges: Badge[];
  newlyUnlockedLocationIds: number[];
};

function questionOptions(q: QuizQuestion): { key: AnswerKey; text: string }[] {
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

function optionText(q: QuizQuestion, key: AnswerKey): string {
  if (q.questionType === 'true_false') return key === 'a' ? 'True' : 'False';
  const map: Record<AnswerKey, string | undefined> = {
    a: q.optionA,
    b: q.optionB,
    c: q.optionC,
    d: q.optionD,
  };
  return map[key] || key.toUpperCase();
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

  const points = useLaHistoryStore((s) => s.points);
  const recordHint = useLaHistoryStore((s) => s.recordHint);
  const recordQuizSubmission = useLaHistoryStore((s) => s.recordQuizSubmission);
  const cachedHints = useLaHistoryStore((s) => s.hints);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [picked, setPicked] = useState<AnswerKey | null>(null);
  const [reveal, setReveal] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [hintsTotal, setHintsTotal] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  const total = quiz?.questions.length ?? 0;
  const question = quiz?.questions[index];
  const lastQuestion = index + 1 >= total;
  const slug = location?.slug ?? '';
  const cachedHint = cachedHints[hintKey(slug, index)];
  const hasHint = !!cachedHint;
  const revealedCorrect = reveal && !!answers[index]?.correct;

  const advance = useCallback(() => {
    if (!quiz || !location) return;
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPicked(null);
      setReveal(false);
      setHintError(null);
      return;
    }
    const correctCount = Object.values(answers).filter((a) => a.correct).length;
    const scorePercent = Math.round((correctCount / total) * 100);
    const outcome = recordQuizSubmission({
      locationSlug: location.slug,
      scorePercent,
      hintsUsed: hintsTotal,
    });
    setResult({
      scorePercent,
      passed: outcome.passed,
      pointsEarned: outcome.pointsEarned,
      correctCount,
      newBadges: outcome.newBadges,
      newlyUnlockedLocationIds: outcome.newlyUnlockedLocationIds,
    });
    // Reward cues — staggered so the SFX engine's single-sound gate keeps
    // each one audible (unlock fanfare → badge fanfare).
    if (outcome.newlyUnlockedLocationIds.length > 0) {
      window.setTimeout(() => playSfx('era-unlock'), 250);
    }
    if (outcome.newBadges.length > 0) {
      window.setTimeout(() => playSfx('badge-earned'), 1100);
    }
  }, [quiz, location, index, total, answers, hintsTotal, recordQuizSubmission]);

  const closeQuiz = useCallback(() => {
    playSfx('panel-close');
    onClose();
  }, [onClose]);

  function checkAnswer() {
    if (picked == null || !question) return;
    const correct = picked === question.correctAnswer;
    setAnswers((a) => ({ ...a, [index]: { picked, correct } }));
    setReveal(true);
    playSfx(correct ? 'quiz-success' : 'quiz-error');
  }

  // Auto-advance shortly after a correct answer (matches the original).
  useEffect(() => {
    if (!revealedCorrect || result) return;
    const t = setTimeout(() => advance(), 1200);
    return () => clearTimeout(t);
  }, [revealedCorrect, result, advance]);

  useEffect(() => {
    playSfx('quiz-open');
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeQuiz();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeQuiz]);

  const fetchHint = useCallback(async () => {
    if (!location) return;
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
        body: JSON.stringify({ locationSlug: location.slug, questionIndex: index }),
      });
      if (!res.ok) {
        setHintError('Couldn’t fetch a hint. Try again in a moment.');
        return;
      }
      const data = (await res.json()) as { hint?: string };
      const text = data.hint?.trim();
      if (!text) {
        setHintError('The hint service returned an empty response.');
        return;
      }
      const stored = recordHint(hintKey(location.slug, index), text);
      if (!stored.ok) setHintError(`Need ${POINTS.hint} pts for a hint.`);
      else {
        setHintsTotal((h) => h + 1);
        playSfx('hint-reveal');
      }
    } catch {
      setHintError('Network error fetching hint.');
    } finally {
      setHintLoading(false);
    }
  }, [location, cachedHint, points, index, recordHint]);

  function retry() {
    setIndex(0);
    setAnswers({});
    setPicked(null);
    setReveal(false);
    setHintsTotal(0);
    setHintError(null);
    setResult(null);
  }

  if (!location || !quiz || !question) return null;

  const progressPct = result ? 100 : Math.round((index / total) * 100);

  return (
    <div
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label={`${location.name} quiz`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuiz();
      }}
    >
      <div className="quiz-modal">
        <div className="quiz-header">
          <div className="quiz-header-left">
            <h2>{quiz.title}</h2>
            {result ? (
              <p>Results</p>
            ) : (
              <p>
                Pass with {PASSING_SCORE}% · {quiz.pointsReward} pts on first
                pass
              </p>
            )}
          </div>
          <button
            type="button"
            className="quiz-close"
            aria-label="Close quiz"
            onClick={closeQuiz}
          >
            ×
          </button>
        </div>

        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${progressPct}%`,
              ...(result
                ? {
                    background: result.passed
                      ? 'var(--success)'
                      : 'var(--danger)',
                  }
                : null),
            }}
          />
        </div>

        {result ? (
          <ResultsBody
            result={result}
            total={total}
            quiz={quiz}
            answers={answers}
            hintsTotal={hintsTotal}
            onClose={closeQuiz}
            onRetry={retry}
          />
        ) : (
          <>
            <div className="quiz-body">
              <div className="quiz-question-counter">
                Question {index + 1} of {total}
              </div>
              <div className="quiz-question-text">{question.questionText}</div>

              {!reveal && !hasHint ? (
                <button
                  type="button"
                  className="quiz-hint-btn"
                  onClick={fetchHint}
                  disabled={hintLoading}
                >
                  {hintLoading ? 'Loading hint…' : `Use Hint (${POINTS.hint} pts)`}
                </button>
              ) : null}
              {!reveal && hasHint ? (
                <button type="button" className="quiz-hint-btn hint-used" disabled>
                  Hint Used ✓
                </button>
              ) : null}

              <div className={cn('quiz-options', reveal && 'locked')}>
                {questionOptions(question).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={cn('quiz-option', picked === opt.key && 'selected')}
                    disabled={reveal}
                    onClick={() => setPicked(opt.key)}
                  >
                    <span className="option-letter">{opt.key.toUpperCase()}</span>
                    {opt.text}
                  </button>
                ))}
              </div>

              <div className="quiz-explanation-slot">
                {!reveal && hasHint ? (
                  <div className="quiz-hint-text">
                    <strong>Hint:</strong> {cachedHint}
                  </div>
                ) : null}
                {!reveal && hintError ? (
                  <div className="quiz-hint-text">{hintError}</div>
                ) : null}
                {reveal && answers[index]?.correct ? (
                  <div className="quiz-feedback-correct">✓ Correct!</div>
                ) : null}
                {reveal && !answers[index]?.correct ? (
                  <div className="quiz-feedback-wrong">
                    <strong>Not quite.</strong>{' '}
                    {explanationFor(question, picked!)}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="quiz-footer">
              {hintsTotal > 0 ? (
                <span className="quiz-hint-footer">
                  Hints used: {hintsTotal} (−{hintsTotal * POINTS.hint} pts from
                  reward)
                </span>
              ) : null}
              <button
                type="button"
                className="btn btn-primary"
                disabled={
                  !reveal ? picked == null : !!answers[index]?.correct
                }
                onClick={reveal && !answers[index]?.correct ? advance : checkAnswer}
              >
                {!reveal
                  ? lastQuestion
                    ? 'Submit Quiz'
                    : 'Next Question →'
                  : answers[index]?.correct
                    ? lastQuestion
                      ? 'Submit Quiz'
                      : 'Next Question →'
                    : lastQuestion
                      ? 'Continue to Results'
                      : 'Continue →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultsBody({
  result,
  total,
  quiz,
  answers,
  hintsTotal,
  onClose,
  onRetry,
}: {
  result: QuizResult;
  total: number;
  quiz: NonNullable<ReturnType<typeof quizForSlug>>;
  answers: AnswerState;
  hintsTotal: number;
  onClose: () => void;
  onRetry: () => void;
}) {
  const unlockedNames = result.newlyUnlockedLocationIds
    .map((id) => locationForId(id)?.name)
    .filter((n): n is string => !!n);

  return (
    <div className="quiz-body">
      <div className="quiz-results">
        <div className={cn('results-score', result.passed ? 'pass' : 'fail')}>
          {result.scorePercent}%
        </div>
        <div className={cn('results-label', result.passed ? 'pass' : 'fail')}>
          {result.passed ? '✓ Passed!' : '✗ Not quite'}
        </div>
        <div className="results-detail">
          {result.correctCount} of {total} correct
        </div>
        {result.pointsEarned > 0 ? (
          <div className="results-points">✦ +{result.pointsEarned} points</div>
        ) : null}
        {hintsTotal > 0 ? (
          <div className="results-hint-penalty">
            {hintsTotal} hint{hintsTotal > 1 ? 's' : ''} used (−
            {hintsTotal * POINTS.hint} pts from reward)
          </div>
        ) : null}
        {unlockedNames.length > 0 ? (
          <div className="results-unlock-notice">
            <strong>🔓 New era unlocked!</strong>
            New historical locations are now available on the map.
          </div>
        ) : null}
        <div className="results-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {!result.passed ? (
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              Try Again
            </button>
          ) : null}
        </div>

        <div className="quiz-recap">
          <div className="recap-header">Question Recap</div>
          {quiz.questions.map((q, i) => {
            const a = answers[i];
            if (!a) return null;
            return (
              <div
                key={i}
                className={cn('recap-item', a.correct ? 'recap-correct' : 'recap-wrong')}
              >
                <span className="recap-icon">{a.correct ? '✓' : '✗'}</span>
                <div className="recap-content">
                  <div className="recap-question">
                    Q{i + 1}: {q.questionText}
                  </div>
                  <div className="recap-answer">
                    You answered: {optionText(q, a.picked)}
                  </div>
                  {!a.correct ? (
                    <div className="recap-explanation">
                      {explanationFor(q, a.picked)}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
