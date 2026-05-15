import type { ElementDefinition } from 'cytoscape';

export const ERA_KEYS = ['native', 'spanish', 'rancho', 'modern'] as const;
export type EraKey = (typeof ERA_KEYS)[number];

export type Era = {
  key: EraKey;
  order: number;
  name: string;
  shortLabel: string;
  description: string;
  accentColor: string;
};

export type LocationEvent = {
  title: string;
  year: number;
  yearDisplay: string;
  content: string;
  orderIndex: number;
};

export type Location = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  era: EraKey;
  eraOrder: number;
  isStarter: boolean;
  unlockThreshold: number;
  imageUrl: string;
  imageCaption: string;
  shortDescription: string;
  fullDescription: string;
  videoUrl?: string;
  videoCaption?: string;
  events: readonly LocationEvent[];
};

export type QuizQuestionType = 'multiple_choice' | 'true_false';
export type AnswerKey = 'a' | 'b' | 'c' | 'd';

export type QuizQuestion = {
  questionText: string;
  questionType: QuizQuestionType;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: AnswerKey;
  explanation: string;
  wrongExplanationA?: string;
  wrongExplanationB?: string;
  wrongExplanationC?: string;
  wrongExplanationD?: string;
  orderIndex: number;
};

export type Quiz = {
  locationSlug: string;
  title: string;
  passingScore: number;
  pointsReward: number;
  questions: readonly QuizQuestion[];
};

export type ConceptMapGraph = {
  elements: ElementDefinition[];
};

export type TutorRole = 'user' | 'assistant';
export type TutorMessage = {
  role: TutorRole;
  content: string;
  createdAt: number;
};

export type QuizAttempt = {
  attempts: number;
  bestScore: number;
  hintsUsed: number;
  passed: boolean;
  passedOnFirstAttempt: boolean;
  pointsAwarded: number;
};

export type EdgeAssessment = {
  edgeLabel: string;
  rating: 'strong' | 'partial' | 'weak';
  feedback: string;
};

export type ConceptMapEvaluation = {
  edgeFeedback: EdgeAssessment[];
  overallComment: string;
  synthesisScore: number;
  followUpQuestion: string;
  pointsAwarded: number;
  evaluatedAt: number;
};

export type ConceptMapState = {
  graph: ConceptMapGraph;
  submitted: boolean;
  insightUses: number;
  evaluation?: ConceptMapEvaluation;
  updatedAt: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  earnedAt: number;
};

export type ProgressState = {
  visited: Record<string, boolean>;
  quizPasses: Record<string, QuizAttempt>;
  conceptMaps: Record<number, ConceptMapState>;
  chatHistory: Record<string, TutorMessage[]>;
  hints: Record<string, string>;
  points: number;
  badges: Badge[];
  audio: { enabled: boolean; volume: number };
  tutorialSeen: boolean;
};
