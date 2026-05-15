// Persistent client-side progress store for the LA History demo. Replaces
// the Flask + SQLite UserProgress / ConceptMap / ChatSession tables with a
// single localStorage-backed Zustand store, gated to anonymous use.
//
// Versioned under the key `la-history:v1`. Bump on schema changes and add a
// migration in the persist config.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { locations } from '@/content/data/laHistory/locations';
import {
  BADGE_CATALOG,
  INSIGHT_MAX_USES,
  POINTS,
  computeConceptMapPoints,
  computeQuizPointsAwarded,
  eligibleBadgeIds,
  emptyAttempt,
  isEraUnlocked,
  isLocationUnlocked,
  locationForId,
  makeBadge,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import type {
  Badge,
  ConceptMapEvaluation,
  ConceptMapGraph,
  ConceptMapState,
  Location,
  ProgressState,
  TutorMessage,
  TutorRole,
} from '@/types/laHistory';

const STORAGE_KEY = 'la-history:v1';

type SpendResult = { ok: true } | { ok: false; reason: 'insufficient_points' };

type RecordVisitResult = {
  alreadyVisited: boolean;
  pointsEarned: number;
  newBadges: Badge[];
};

type RecordQuizResult = {
  passed: boolean;
  pointsEarned: number;
  newlyUnlockedLocationIds: number[];
  newBadges: Badge[];
};

type SubmitConceptMapResult = {
  pointsEarned: number;
  newlyUnlockedLocationIds: number[];
  newBadges: Badge[];
};

export type LaHistoryStore = ProgressState & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;

  recordVisit: (locationId: number) => RecordVisitResult;
  recordHint: (questionKey: string, hint: string) => SpendResult;
  recordQuizSubmission: (args: {
    locationSlug: string;
    scorePercent: number;
    hintsUsed: number;
  }) => RecordQuizResult;
  chargeInsight: (eraOrder: number) =>
    | { ok: true; remainingUses: number }
    | { ok: false; reason: 'no_uses_left' | 'insufficient_points' };
  saveConceptMap: (eraOrder: number, graph: ConceptMapGraph) => void;
  submitConceptMap: (
    eraOrder: number,
    evaluation: ConceptMapEvaluation,
  ) => SubmitConceptMapResult;

  appendChatMessage: (
    key: string,
    role: TutorRole,
    content: string,
  ) => TutorMessage;
  setChatHistory: (key: string, messages: TutorMessage[]) => void;
  clearChatHistory: (key: string) => void;

  setAudio: (audio: Partial<ProgressState['audio']>) => void;
  markTutorialSeen: () => void;
  reset: () => void;
};

function initialProgress(): ProgressState {
  return {
    visited: {},
    quizPasses: {},
    conceptMaps: {},
    chatHistory: {},
    hints: {},
    points: 0,
    badges: [],
    audio: { enabled: false, volume: 0.4 },
    tutorialSeen: false,
  };
}

function snapshotUnlockedLocationIds(state: ProgressState): Set<number> {
  const ids = new Set<number>();
  for (const loc of locations as readonly Location[]) {
    if (isLocationUnlocked(loc, state)) ids.add(loc.id);
  }
  return ids;
}

function diffUnlocked(before: Set<number>, after: Set<number>): number[] {
  const newly: number[] = [];
  for (const id of after) if (!before.has(id)) newly.push(id);
  return newly;
}

function awardNewBadges(
  state: ProgressState,
  opts?: { thriftyScholar?: boolean },
): Badge[] {
  const earned = new Set(state.badges.map((b) => b.id));
  const eligible = eligibleBadgeIds(state, opts);
  const fresh: Badge[] = [];
  const now = Date.now();
  for (const id of eligible) {
    if (earned.has(id)) continue;
    const badge = makeBadge(id, now);
    if (badge) fresh.push(badge);
  }
  return fresh;
}

export const useLaHistoryStore = create<LaHistoryStore>()(
  persist(
    (set, get) => ({
      ...initialProgress(),
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      recordVisit: (locationId) => {
        const loc = locationForId(locationId);
        if (!loc) {
          return { alreadyVisited: false, pointsEarned: 0, newBadges: [] };
        }
        const state = get();
        if (state.visited[loc.slug]) {
          return { alreadyVisited: true, pointsEarned: 0, newBadges: [] };
        }
        const next: ProgressState = {
          ...state,
          visited: { ...state.visited, [loc.slug]: true },
          points: state.points + POINTS.visit,
        };
        const newBadges = awardNewBadges(next);
        set({
          visited: next.visited,
          points: next.points,
          badges: newBadges.length
            ? [...state.badges, ...newBadges]
            : state.badges,
        });
        return {
          alreadyVisited: false,
          pointsEarned: POINTS.visit,
          newBadges,
        };
      },

      recordHint: (questionKey, hint) => {
        const state = get();
        if (state.points < POINTS.hint) {
          return { ok: false, reason: 'insufficient_points' };
        }
        if (state.hints[questionKey]) {
          // Already paid for and cached — no second deduction.
          return { ok: true };
        }
        set({
          points: state.points - POINTS.hint,
          hints: { ...state.hints, [questionKey]: hint },
        });
        return { ok: true };
      },

      recordQuizSubmission: ({ locationSlug, scorePercent, hintsUsed }) => {
        const quiz = quizForSlug(locationSlug);
        if (!quiz) {
          return {
            passed: false,
            pointsEarned: 0,
            newlyUnlockedLocationIds: [],
            newBadges: [],
          };
        }
        const state = get();
        const prevAttempt = state.quizPasses[locationSlug] ?? emptyAttempt();
        const isFirstAttempt = prevAttempt.attempts === 0;
        const alreadyPassed = prevAttempt.passed;

        const result = computeQuizPointsAwarded({
          scorePercent,
          isFirstAttempt,
          hintsUsed,
          quizPointsReward: quiz.pointsReward,
        });

        const updatedAttempt = {
          attempts: prevAttempt.attempts + 1,
          bestScore: Math.max(prevAttempt.bestScore, scorePercent),
          hintsUsed: prevAttempt.hintsUsed + hintsUsed,
          passed: alreadyPassed || result.passed,
          passedOnFirstAttempt:
            prevAttempt.passedOnFirstAttempt ||
            (result.passed && isFirstAttempt && hintsUsed === 0),
          pointsAwarded:
            prevAttempt.pointsAwarded +
            (alreadyPassed ? 0 : result.pointsAwarded),
        };

        const earnedThriftyScholar =
          result.passed && !alreadyPassed && isFirstAttempt && hintsUsed === 0;

        const before = snapshotUnlockedLocationIds(state);
        const next: ProgressState = {
          ...state,
          quizPasses: {
            ...state.quizPasses,
            [locationSlug]: updatedAttempt,
          },
          points: state.points + (alreadyPassed ? 0 : result.pointsAwarded),
        };
        const after = snapshotUnlockedLocationIds(next);
        const newBadges = awardNewBadges(next, {
          thriftyScholar: earnedThriftyScholar,
        });

        set({
          quizPasses: next.quizPasses,
          points: next.points,
          badges: newBadges.length
            ? [...state.badges, ...newBadges]
            : state.badges,
        });

        return {
          passed: result.passed,
          pointsEarned: alreadyPassed ? 0 : result.pointsAwarded,
          newlyUnlockedLocationIds: diffUnlocked(before, after),
          newBadges,
        };
      },

      chargeInsight: (eraOrder) => {
        const state = get();
        const cm = state.conceptMaps[eraOrder];
        const used = cm?.insightUses ?? 0;
        if (used >= INSIGHT_MAX_USES) {
          return { ok: false, reason: 'no_uses_left' };
        }
        if (state.points < POINTS.insight) {
          return { ok: false, reason: 'insufficient_points' };
        }
        const next: ConceptMapState = cm
          ? { ...cm, insightUses: used + 1, updatedAt: Date.now() }
          : {
              graph: { elements: [] },
              submitted: false,
              insightUses: 1,
              updatedAt: Date.now(),
            };
        set({
          points: state.points - POINTS.insight,
          conceptMaps: { ...state.conceptMaps, [eraOrder]: next },
        });
        return { ok: true, remainingUses: INSIGHT_MAX_USES - next.insightUses };
      },

      saveConceptMap: (eraOrder, graph) => {
        const state = get();
        const existing = state.conceptMaps[eraOrder];
        if (existing?.submitted) {
          // Submitted maps are frozen — ignore late autosaves.
          return;
        }
        const next: ConceptMapState = {
          graph,
          submitted: false,
          insightUses: existing?.insightUses ?? 0,
          evaluation: existing?.evaluation,
          updatedAt: Date.now(),
        };
        set({
          conceptMaps: { ...state.conceptMaps, [eraOrder]: next },
        });
      },

      submitConceptMap: (eraOrder, evaluation) => {
        const state = get();
        const existing = state.conceptMaps[eraOrder];
        if (existing?.submitted) {
          return {
            pointsEarned: 0,
            newlyUnlockedLocationIds: [],
            newBadges: [],
          };
        }
        const pts = computeConceptMapPoints(evaluation);
        const finalEval: ConceptMapEvaluation = {
          ...evaluation,
          pointsAwarded: pts,
          evaluatedAt: Date.now(),
        };
        const next: ConceptMapState = {
          graph: existing?.graph ?? { elements: [] },
          submitted: true,
          insightUses: existing?.insightUses ?? 0,
          evaluation: finalEval,
          updatedAt: Date.now(),
        };
        const before = snapshotUnlockedLocationIds(state);
        const nextState: ProgressState = {
          ...state,
          conceptMaps: { ...state.conceptMaps, [eraOrder]: next },
          points: state.points + pts,
        };
        const after = snapshotUnlockedLocationIds(nextState);
        const newBadges = awardNewBadges(nextState);
        set({
          conceptMaps: nextState.conceptMaps,
          points: nextState.points,
          badges: newBadges.length
            ? [...state.badges, ...newBadges]
            : state.badges,
        });
        return {
          pointsEarned: pts,
          newlyUnlockedLocationIds: diffUnlocked(before, after),
          newBadges,
        };
      },

      appendChatMessage: (key, role, content) => {
        const message: TutorMessage = {
          role,
          content,
          createdAt: Date.now(),
        };
        const state = get();
        const prev = state.chatHistory[key] ?? [];
        set({
          chatHistory: { ...state.chatHistory, [key]: [...prev, message] },
        });
        return message;
      },

      setChatHistory: (key, messages) => {
        const state = get();
        set({
          chatHistory: { ...state.chatHistory, [key]: messages },
        });
      },

      clearChatHistory: (key) => {
        const state = get();
        const { [key]: _removed, ...rest } = state.chatHistory;
        set({ chatHistory: rest });
      },

      setAudio: (audio) => {
        const state = get();
        set({ audio: { ...state.audio, ...audio } });
      },

      markTutorialSeen: () => set({ tutorialSeen: true }),

      reset: () => {
        set({ ...initialProgress(), hydrated: true });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        visited: state.visited,
        quizPasses: state.quizPasses,
        conceptMaps: state.conceptMaps,
        chatHistory: state.chatHistory,
        hints: state.hints,
        points: state.points,
        badges: state.badges,
        audio: state.audio,
        tutorialSeen: state.tutorialSeen,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsLocationUnlocked =
  (locationId: number) => (state: LaHistoryStore) => {
    const loc = locationForId(locationId);
    return loc ? isLocationUnlocked(loc, state) : false;
  };

export const selectIsEraUnlocked =
  (eraOrder: number) => (state: LaHistoryStore) =>
    isEraUnlocked(eraOrder, state);

export const selectInsightUsesRemaining =
  (eraOrder: number) => (state: LaHistoryStore) => {
    const used = state.conceptMaps[eraOrder]?.insightUses ?? 0;
    return Math.max(0, INSIGHT_MAX_USES - used);
  };

export const selectBadgeCatalog = () => BADGE_CATALOG;
