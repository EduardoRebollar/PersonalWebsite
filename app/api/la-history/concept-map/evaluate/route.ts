// Concept-map evaluator. Replaces concept_map.py POST
// /api/concept_map/<era_order>/evaluate. Returns a structured JSON grade
// using the AI SDK's generateObject() so the client never has to parse
// hand-written JSON. Schema mirrors ollama_service.py:CONCEPT_MAP_EVAL_PROMPT.

import { generateObject } from 'ai';
import { z } from 'zod';

import { EVALUATOR_MODEL } from '@/lib/laHistory/llm';
import { buildConceptMapEvalPrompt } from '@/lib/laHistory/prompts';
import { countEdges, summarizeGraphForEval } from '@/lib/laHistory/graphSummary';
import type { ConceptMapEvaluation, ConceptMapGraph } from '@/types/laHistory';

export const maxDuration = 120;

const MIN_EDGES_TO_SUBMIT = 3;

const GraphSchema = z.object({
  elements: z.array(z.unknown()).default([]),
});

const BodySchema = z.object({
  eraOrder: z.number().int().min(1).max(4),
  graph: GraphSchema,
});

const EvaluationSchema = z.object({
  edgeFeedback: z
    .array(
      z.object({
        source: z.string().describe('source node label'),
        target: z.string().describe('target node label'),
        label: z.string().describe('edge label as the student wrote it'),
        quality: z.enum(['strong', 'partial', 'needs_probing']),
        comment: z
          .string()
          .describe(
            'One affirming observation followed by one probing question.',
          ),
      }),
    )
    .describe('One entry per edge in the student map.'),
  overallComment: z
    .string()
    .describe(
      '2-3 sentences: specific strengths, one reflective gap, broader arc.',
    ),
  followUpQuestion: z
    .string()
    .describe(
      "One specific question about THIS student's map that extends thinking.",
    ),
  synthesisScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('0-100 score for how cohesively the edges argue a position.'),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const graph = parsed.graph as ConceptMapGraph;
  if (countEdges(graph) < MIN_EDGES_TO_SUBMIT) {
    return Response.json(
      {
        error: 'min_edges',
        message: `Add at least ${MIN_EDGES_TO_SUBMIT} edges before submitting.`,
      },
      { status: 400 },
    );
  }

  const graphSummary = summarizeGraphForEval(graph);
  const prompt = buildConceptMapEvalPrompt({
    eraOrder: parsed.eraOrder,
    graphSummary,
  });

  try {
    const { object } = await generateObject({
      model: EVALUATOR_MODEL,
      schema: EvaluationSchema,
      prompt,
      temperature: 0.3,
    });

    const evaluation: Omit<ConceptMapEvaluation, 'pointsAwarded' | 'evaluatedAt'> = {
      edgeFeedback: object.edgeFeedback.map((e) => ({
        edgeLabel: `${e.source} → ${e.target}${e.label ? ` (${e.label})` : ''}`,
        rating: e.quality === 'needs_probing' ? 'weak' : e.quality,
        feedback: e.comment,
      })),
      overallComment: object.overallComment,
      followUpQuestion: object.followUpQuestion,
      synthesisScore: object.synthesisScore,
    };

    return Response.json({ evaluation });
  } catch (err) {
    return Response.json(
      {
        error: 'evaluator_failed',
        message:
          err instanceof Error
            ? err.message
            : 'The evaluator returned an invalid response.',
      },
      { status: 502 },
    );
  }
}
