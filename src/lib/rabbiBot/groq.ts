import type { CallResult, JsonCall } from './gemini';

// Server-only: Groq's free tier (key in GROQ_API_KEY, no billing), an
// OpenAI-compatible API with strict JSON-schema output. Its models sit in the
// same chains as Gemini's under a "groq:" prefix (e.g. "groq:openai/gpt-oss-120b");
// without a key they are skipped. Free limits are per model: 200,000 tokens a
// day (TPD, a rolling window — the real ceiling: a plan costs ~2.4k tokens on
// Qwen, ~4k on gpt-oss with its reasoning) and 7–8k input tokens a minute
// (≈ 0.5 token per Hebrew character), so the answer step sends Groq a compact
// prompt (JsonCall.compactUser).
const API = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_PREFIX = 'groq:';
export const isGroqModel = (model: string) => model.startsWith(GROQ_PREFIX);

type Schema = { [k: string]: unknown };

/**
 * Strict structured output needs every object closed (additionalProperties:
 * false) with all its properties required. Pure — unit-tested.
 */
export function strictSchema(schema: Schema): Schema {
  const out: Schema = { ...schema };
  if (out.type === 'object' && out.properties && typeof out.properties === 'object') {
    const props = out.properties as Record<string, Schema>;
    out.properties = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, strictSchema(v)]));
    out.required = Object.keys(props);
    out.additionalProperties = false;
  }
  if (out.items && typeof out.items === 'object') out.items = strictSchema(out.items as Schema);
  // maxItems isn't part of the strict subset; the pipeline caps lists itself.
  delete out.maxItems;
  return out;
}

/** gpt-oss reasons at "low"; Qwen 3 models take "none" (answer directly). */
const reasoningEffort = (model: string) => (model.startsWith('qwen/') ? 'none' : 'low');

interface ChatResponse { choices?: { message?: { content?: string | null } }[] }

export async function callGroq(model: string, key: string, call: JsonCall, timeoutMs: number): Promise<CallResult> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
    body: JSON.stringify({
      model,
      temperature: 0.2,
      reasoning_effort: reasoningEffort(model),
      messages: [{ role: 'system', content: call.system }, { role: 'user', content: call.compactUser ?? call.user }],
      response_format: { type: 'json_schema', json_schema: { name: 'result', strict: true, schema: strictSchema(call.schema as Schema) } },
    }),
  });
  const body = await res.json().catch(() => null) as unknown;
  if (!res.ok) return { ok: false, status: res.status, body };
  const text = (body as ChatResponse).choices?.[0]?.message?.content ?? '';
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 502, body: null };
  }
}
