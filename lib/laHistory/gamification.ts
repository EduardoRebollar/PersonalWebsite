// Pure scoring + unlock + badge logic, ported from
// Personal Data/Personal Projects/LA History/app/services/gamification.py.
// No I/O, no React — every function is a pure transform over data the store
// already holds. The store calls these and applies the returned mutations.

import { locations } from '@/content/data/laHistory/locations';
import { quizzes } from '@/content/data/laHistory/quizzes';
import type {
  Badge,
  ConceptMapEvaluation,
  EdgeAssessment,
  Location,
  ProgressState,
  QuizAttempt,
} from '@/types/laHistory';

export const POINTS = {
  visit: 10,
  quizPassFirst: 50,
  quizPassRetry: 25,
  quizBonus90: 20,
  conceptMapSubmit: 75,
  conceptMapBonus: 25,
  hint: 5,
  insight: 15,
} as const;

export const INSIGHT_MAX_USES = 3;
export const PASSING_SCORE = 75;

type BadgeDef = {
  id: string;
  name: string;
  description: string;
};

export const BADGE_CATALOG: readonly BadgeDef[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Visit your first location.' },
  { id: 'explorer', name: 'Explorer', description: 'Visit 5 locations.' },
  { id: 'historian', name: 'Historian', description: 'Visit every location.' },
  { id: 'first_victory', name: 'First Victory', description: 'Pass your first quiz.' },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Pass every quiz.' },
  { id: 'thrifty_scholar', name: 'Thrifty Scholar', description: 'Pass a quiz on the first attempt without using any hints.' },
  { id: 'century_seeker', name: 'Century Seeker', description: 'Earn 500 points.' },
  { id: 'native_scholar', name: 'Native Scholar', description: 'Pass every quiz in the Tongva era.' },
  { id: 'spanish_era_complete', name: 'Spanish Scholar', description: 'Pass every quiz in the Spanish era.' },
  { id: 'rancho_era_complete', name: 'Rancho Scholar', description: 'Pass every quiz in the Rancho era.' },
  { id: 'modern_era_complete', name: 'Modern Scholar', description: 'Pass every quiz in the Modern era.' },
  { id: 'era_synthesizer_1', name: 'Tongva Synthesizer', description: 'Submit a concept map for the Tongva era.' },
  { id: 'era_synthesizer_2', name: 'Spanish Synthesizer', description: 'Submit a concept map for the Spanish era.' },
  { id: 'era_synthesizer_3', name: 'Rancho Synthesizer', description: 'Submit a concept map for the Rancho era.' },
  { id: 'era_synthesizer_4', name: 'Modern Synthesizer', description: 'Submit a concept map for the Modern era.' },
  { id: 'master_cartographer', name: 'Master Cartographer', description: 'Submit concept maps for all four eras.' },
];

const BADGE_BY_ID = new Map(BADGE_CATALOG.map((b) => [b.id, b] as const));
const ERA_QUIZ_BADGE_BY_ORDER: Record<number, string> = {
  1: 'native_scholar',
  2: 'spanish_era_complete',
  3: 'rancho_era_complete',
  4: 'modern_era_complete',
};
const ERA_SYNTHESIZER_BADGE_BY_ORDER: Record<number, string> = {
  1: 'era_synthesizer_1',
  2: 'era_synthesizer_2',
  3: 'era_synthesizer_3',
  4: 'era_synthesizer_4',
};

function locationsByEra(): Map<number, Location[]> {
  const map = new Map<number, Location[]>();
  for (const loc of locations) {
    const list = map.get(loc.eraOrder) ?? [];
    list.push(loc as Location);
    map.set(loc.eraOrder, list);
  }
  return map;
}

const ERA_LOCATIONS = locationsByEra();
const ERA_ORDERS = [...ERA_LOCATIONS.keys()].sort((a, b) => a - b);

export function isLocationUnlocked(
  location: Pick<Location, 'isStarter' | 'eraOrder'>,
  state: Pick<ProgressState, 'quizPasses' | 'conceptMaps'>,
): boolean {
  if (location.isStarter) return true;
  return isEraUnlocked(location.eraOrder, state);
}

export function isEraUnlocked(
  eraOrder: number,
  state: Pick<ProgressState, 'quizPasses' | 'conceptMaps'>,
): boolean {
  if (eraOrder === 1) return true;
  const prevLocs = ERA_LOCATIONS.get(eraOrder - 1) ?? [];
  if (prevLocs.length === 0) return true;
  const allPrevPassed = prevLocs.every(
    (loc) => state.quizPasses[loc.slug]?.passed === true,
  );
  const prevMap = state.conceptMaps[eraOrder - 1];
  return allPrevPassed && prevMap?.submitted === true;
}

export function unlockedEraOrders(
  state: Pick<ProgressState, 'quizPasses' | 'conceptMaps'>,
): number[] {
  return ERA_ORDERS.filter((o) => isEraUnlocked(o, state));
}

export function computeQuizPointsAwarded(args: {
  scorePercent: number;
  isFirstAttempt: boolean;
  hintsUsed: number;
  quizPointsReward: number;
}): { pointsAwarded: number; passed: boolean; passedOnFirstAttempt: boolean } {
  const passed = args.scorePercent >= PASSING_SCORE;
  if (!passed) {
    return { pointsAwarded: 0, passed: false, passedOnFirstAttempt: false };
  }
  const hintPenalty = Math.min(args.hintsUsed * POINTS.hint, args.quizPointsReward);
  const effectiveReward = Math.max(0, args.quizPointsReward - hintPenalty);
  let pts = args.isFirstAttempt
    ? effectiveReward
    : Math.floor(effectiveReward / 2);
  if (args.scorePercent >= 90) pts += POINTS.quizBonus90;
  return {
    pointsAwarded: pts,
    passed: true,
    passedOnFirstAttempt: args.isFirstAttempt,
  };
}

export function computeConceptMapPoints(
  evaluation: Pick<ConceptMapEvaluation, 'edgeFeedback'>,
): number {
  const total = evaluation.edgeFeedback.length;
  if (total === 0) return POINTS.conceptMapSubmit;
  const strong = evaluation.edgeFeedback.filter(
    (e: EdgeAssessment) => e.rating === 'strong',
  ).length;
  const ratio = strong / total;
  return ratio > 0.5
    ? POINTS.conceptMapSubmit + POINTS.conceptMapBonus
    : POINTS.conceptMapSubmit;
}

/**
 * Returns the union of newly-earned badge IDs given the current progress
 * snapshot. Caller is responsible for filtering against already-earned
 * badges and for stamping `earnedAt`.
 */
export function eligibleBadgeIds(
  state: Pick<
    ProgressState,
    'visited' | 'quizPasses' | 'conceptMaps' | 'points'
  >,
  opts?: { thriftyScholar?: boolean },
): string[] {
  const visitedCount = Object.values(state.visited).filter(Boolean).length;
  const totalLocations = locations.length;
  const passedCount = Object.values(state.quizPasses).filter(
    (p) => p?.passed,
  ).length;

  const candidates: string[] = [];
  if (visitedCount >= 1) candidates.push('first_steps');
  if (visitedCount >= 5) candidates.push('explorer');
  if (visitedCount >= totalLocations) candidates.push('historian');
  if ((state.points ?? 0) >= 500) candidates.push('century_seeker');
  if (passedCount >= 1) candidates.push('first_victory');
  if (passedCount >= totalLocations) candidates.push('quiz_master');

  for (const eraOrder of ERA_ORDERS) {
    const locs = ERA_LOCATIONS.get(eraOrder) ?? [];
    if (
      locs.length > 0 &&
      locs.every((loc) => state.quizPasses[loc.slug]?.passed === true)
    ) {
      candidates.push(ERA_QUIZ_BADGE_BY_ORDER[eraOrder]!);
    }
  }

  let submittedMaps = 0;
  for (const eraOrder of ERA_ORDERS) {
    if (state.conceptMaps[eraOrder]?.submitted) {
      candidates.push(ERA_SYNTHESIZER_BADGE_BY_ORDER[eraOrder]!);
      submittedMaps += 1;
    }
  }
  if (submittedMaps >= 4) candidates.push('master_cartographer');

  if (opts?.thriftyScholar) candidates.push('thrifty_scholar');

  return candidates.filter((id) => BADGE_BY_ID.has(id));
}

export function makeBadge(id: string, now = Date.now()): Badge | null {
  const def = BADGE_BY_ID.get(id);
  if (!def) return null;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    earnedAt: now,
  };
}

export function emptyAttempt(): QuizAttempt {
  return {
    attempts: 0,
    bestScore: 0,
    hintsUsed: 0,
    passed: false,
    passedOnFirstAttempt: false,
    pointsAwarded: 0,
  };
}

export function quizForSlug(slug: string) {
  return quizzes.find((q) => q.locationSlug === slug);
}

export function locationForSlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug) as Location | undefined;
}

export function locationForId(id: number): Location | undefined {
  return locations.find((l) => l.id === id) as Location | undefined;
}

export function locationsInEra(eraOrder: number): readonly Location[] {
  return ERA_LOCATIONS.get(eraOrder) ?? [];
}
