// Quiz hint generator. Replaces quiz.py POST /api/quiz/<id>/hint.
// One Socratic clue, 2-3 sentences, never reveals the answer. Cost
// (-5 pts) and per-question caching are enforced client-side in
// useLaHistoryStore.recordHint.

import { generateText } from 'ai';
import { z } from 'zod';

import {
  locationForSlug,
  quizForSlug,
} from '@/lib/laHistory/gamification';
import { TUTOR_MODEL } from '@/lib/laHistory/llm';
import { buildQuizHintPrompt } from '@/lib/laHistory/prompts';

export const maxDuration = 60;

const BodySchema = z.object({
  locationSlug: z.string().min(1),
  questionIndex: z.number().int().min(0),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const location = locationForSlug(parsed.locationSlug);
  const quiz = quizForSlug(parsed.locationSlug);
  if (!location || !quiz) {
    return new Response('Unknown location/quiz', { status: 404 });
  }
  const question = quiz.questions[parsed.questionIndex];
  if (!question) {
    return new Response('Unknown question', { status: 404 });
  }

  const prompt = buildQuizHintPrompt({ location, question });

  try {
    const { text } = await generateText({
      model: TUTOR_MODEL,
      prompt,
      temperature: 0.5,
    });
    const hint = text.trim();
    if (!hint) {
      return Response.json({ error: 'empty_response' }, { status: 502 });
    }
    return Response.json({ hint });
  } catch (err) {
    return Response.json(
      {
        error: 'hint_failed',
        message:
          err instanceof Error
            ? err.message
            : 'The hint service is unavailable.',
      },
      { status: 502 },
    );
  }
}
