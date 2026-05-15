// Per-era concept-map Socratic chat. Replaces concept_map.py POST
// /api/concept_map/<era_order>/chat. Streams; uses the full 17-rule
// system_prompt_v3 with the student's current map summarized in-context.

import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { z } from 'zod';

import { TUTOR_MODEL } from '@/lib/laHistory/llm';
import {
  buildConceptMapChatPrompt,
} from '@/lib/laHistory/prompts';
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
  messages: z.array(z.unknown()),
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

  const uiMessages = parsed.messages as UIMessage[];
  const modelMessages = (await convertToModelMessages(uiMessages)).slice(-6);

  const result = streamText({
    model: TUTOR_MODEL,
    system: buildConceptMapChatPrompt({
      eraOrder: parsed.eraOrder,
      graphSummary,
    }),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
