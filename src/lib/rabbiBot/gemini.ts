import { classifyFailure } from './rules';

// Server-only: Gemini REST (Google AI Studio free tier, key in GEMINI_API_KEY).
// Each model has its own free daily quota, so the backup model is a second,
// independent allowance — no extra account needed.
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

export function botModels(): string[] {
  const env = process.env.RABBI_BOT_MODELS?.split(',').map(s => s.trim()).filter(Boolean);
  return env?.length ? env : DEFAULT_MODELS;
}

export interface JsonCall {
  system: string;
  user: string;
  schema: object;
  timeoutMs: number;
}

export interface ModelHooks {
  /** Models known to be out of daily quota — skipped. */
  skip: Set<string>;
  /** Called when a model reports its daily quota is used up. */
  onExhausted: (model: string) => Promise<void>;
}

export class NoModelError extends Error {
  constructor(readonly quota: boolean) { super(quota ? 'quota' : 'unavailable'); }
}

interface GenResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

async function callOnce(model: string, key: string, call: JsonCall): Promise<{ ok: true; value: unknown } | { ok: false; status: number; body: unknown }> {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    signal: AbortSignal.timeout(call.timeoutMs),
    cache: 'no-store',
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: call.system }] },
      contents: [{ role: 'user', parts: [{ text: call.user }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseJsonSchema: call.schema,
        thinkingConfig: { thinkingLevel: 'low' },
      },
    }),
  });
  const body = await res.json().catch(() => null) as unknown;
  if (!res.ok) return { ok: false, status: res.status, body };
  const text = (body as GenResponse).candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? '').join('') ?? '';
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 502, body: null };
  }
}

/**
 * Runs one JSON-producing call on the first model that can take it. A daily
 * quota hit marks that model (onExhausted) and falls through to the backup;
 * rate limits, timeouts and server errors fall through without marking.
 */
export async function generateJson(call: JsonCall, hooks: ModelHooks): Promise<{ value: unknown; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new NoModelError(false);
  const models = botModels();
  let anyLive = false;
  for (const model of models) {
    if (hooks.skip.has(model)) continue;
    try {
      let r = await callOnce(model, key, call);
      // "Model overloaded" is usually momentary — one quick retry before the backup.
      if (!r.ok && r.status === 503) r = await callOnce(model, key, call);
      if (r.ok) return { value: r.value, model };
      const failure = classifyFailure(r.status, r.body);
      console.warn('[rabbi-bot] model failed', model, r.status, failure);
      if (failure === 'daily') {
        hooks.skip.add(model);
        await hooks.onExhausted(model);
      } else {
        anyLive = true;
      }
    } catch (e) {
      console.warn('[rabbi-bot] model error', model, e instanceof Error ? e.name : e);
      anyLive = true;
    }
  }
  throw new NoModelError(!anyLive && models.every(m => hooks.skip.has(m)));
}
