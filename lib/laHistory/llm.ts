// Single source of truth for the LLM the LA History demo routes call.
// Uses Vercel AI Gateway via the AI SDK's plain "provider/model" string
// form — the gateway resolves it from AI_GATEWAY_API_KEY at runtime.
//
// Bumping the model here updates every API route at once.

export const TUTOR_MODEL = 'anthropic/claude-haiku-4-5';

// Slightly higher-capability model for the structured concept-map grading,
// where edge-by-edge JSON output rewards stronger instruction following.
export const EVALUATOR_MODEL = 'anthropic/claude-haiku-4-5';
