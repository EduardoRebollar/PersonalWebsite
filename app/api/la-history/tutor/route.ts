// Per-location Socratic tutor chat. Replaces chat.py POST /api/chat.
// Streams via the AI SDK; the client uses useChat() to consume.

import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { z } from 'zod';

import { locationForId } from '@/lib/laHistory/gamification';
import { TUTOR_MODEL } from '@/lib/laHistory/llm';
import { buildLocationTutorPrompt } from '@/lib/laHistory/prompts';

export const maxDuration = 60;

const BodySchema = z.object({
  locationId: z.number().int().positive(),
  messages: z.array(z.unknown()),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const location = locationForId(parsed.locationId);
  if (!location) {
    return new Response('Unknown location', { status: 404 });
  }

  const uiMessages = parsed.messages as UIMessage[];
  const modelMessages = (await convertToModelMessages(uiMessages)).slice(-6);

  const result = streamText({
    model: TUTOR_MODEL,
    system: buildLocationTutorPrompt(location),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
