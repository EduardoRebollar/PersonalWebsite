// Concept-map insight (direct hint, not Socratic). Replaces concept_map.py
// POST /api/concept_map/<era_order>/insight. Costs 15 pts client-side, max
// 3 uses per era — both gates enforced in useLaHistoryStore before the
// fetch. This route just produces the text.

import { generateText } from 'ai';
import { z } from 'zod';

import { TUTOR_MODEL } from '@/lib/laHistory/llm';
import { buildConceptMapInsightPrompt } from '@/lib/laHistory/prompts';
import { summarizeGraphForChat } from '@/lib/laHistory/graphSummary';
import type { ConceptMapGraph } from '@/types/laHistory';

export const maxDuration = 60;

const GraphSchema = z
  .object({
    elements: z.array(z.unknown()).default([]),
  })
  .nullable();

const BodySchema = z.object({
  eraOrder: z.number().int().min(1).max(4),
  graph: GraphSchema.optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const graph = (parsed.graph ?? null) as ConceptMapGraph | null;
  const graphSummary = summarizeGraphForChat(graph);
  const prompt = buildConceptMapInsightPrompt({
    eraOrder: parsed.eraOrder,
    graphSummary,
  });

  try {
    const { text } = await generateText({
      model: TUTOR_MODEL,
      prompt,
      temperature: 0.5,
    });
    const insight = text.trim();
    if (!insight) {
      return Response.json(
        { error: 'empty_response' },
        { status: 502 },
      );
    }
    return Response.json({ insight });
  } catch (err) {
    return Response.json(
      {
        error: 'insight_failed',
        message:
          err instanceof Error
            ? err.message
            : 'The insight service is unavailable.',
      },
      { status: 502 },
    );
  }
}
