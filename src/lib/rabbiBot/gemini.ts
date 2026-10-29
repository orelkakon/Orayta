import { classifyFailure } from './rules';

// Server-only: Gemini REST (Google AI Studio free tier, key in GEMINI_API_KEY).
// The free quota is counted per model *name* (the flash models allow ~20
// requests a day each, the lite models far more), so each step walks a chain
// of models. Planning needs real knowledge of where a law is written (the lite
// models name the wrong siman and the modern word instead of the sources'
// term), so it starts on the fast flash models and falls back to lite; the
// answer runs on the strongest model that still has quota today.
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

const DEFAULT_PLAN = [
  'gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest',
];
// 3.8-flash (and flash-latest, which points at it) is strong but often slow — tried last among the flash models.
const DEFAULT_ANSWER = [
  'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest',
  'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest',
];

const fromEnv = (v: string | undefined, fallback: string[]) => {
  const list = v?.split(',').map(s => s.trim()).filter(Boolean);
  return list?.length ? list : fallback;
};

export const planModels = () => fromEnv(process.env.RABBI_BOT_PLAN_MODELS, DEFAULT_PLAN);
export const answerModels = () => fromEnv(process.env.RABBI_BOT_ANSWER_MODELS, DEFAULT_ANSWER);
/** Every model in use, answer chain order first (admin display, quota bookkeeping). */
export const botModels = () => Array.from(new Set([...answerModels(), ...planModels()]));
/** Lite models are the backup tier: fine for planning, a notch weaker at answering. */
export const isBackupModel = (m: string) => m.includes('lite');

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
  /** Absolute time (ms) by which every model call must be over. */
  deadline: number;
}

export class NoModelError extends Error {
  constructor(readonly quota: boolean) { super(quota ? 'quota' : 'unavailable'); }
}

interface GenResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

type CallResult = { ok: true; value: unknown } | { ok: false; status: number; body: unknown };

const MIN_CALL_MS = 6000;

async function callOnce(model: string, key: string, call: JsonCall, timeoutMs: number): Promise<CallResult> {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    signal: AbortSignal.timeout(timeoutMs),
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
 * Runs one JSON-producing call on the first model in `models` that can take
 * it, within the request's deadline. A daily-quota hit marks that model
 * (onExhausted) and moves on; rate limits, timeouts and server errors move on
 * without marking.
 */
export async function generateJson(models: string[], call: JsonCall, hooks: ModelHooks): Promise<{ value: unknown; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new NoModelError(false);
  let anyLive = false;
  for (const model of models) {
    if (hooks.skip.has(model)) continue;
    const budget = Math.min(call.timeoutMs, hooks.deadline - Date.now());
    if (budget < MIN_CALL_MS) { anyLive = true; break; }
    try {
      let r = await callOnce(model, key, call, budget);
      // "Model overloaded" is usually momentary — one quick retry if time allows.
      if (!r.ok && r.status === 503 && hooks.deadline - Date.now() > MIN_CALL_MS * 2) {
        r = await callOnce(model, key, call, Math.min(call.timeoutMs, hooks.deadline - Date.now()));
      }
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

/**
 * generateJson with a hedge: if the first model hasn't answered after
 * `hedgeMs`, the rest of the chain starts in parallel and the first success
 * wins — a slow free-tier model then costs seconds, not its whole timeout.
 */
export async function generateJsonHedged(models: string[], call: JsonCall, hooks: ModelHooks, hedgeMs: number): Promise<{ value: unknown; model: string }> {
  let settled = false;
  const first = generateJson(models, call, hooks).finally(() => { settled = true; });
  const second = new Promise(r => setTimeout(r, hedgeMs)).then(() => {
    if (settled) throw new NoModelError(false);
    return generateJson(models.slice(1), call, hooks);
  });
  try {
    return await Promise.any([first, second]);
  } catch {
    return first; // both failed — surface the main chain's error
  }
}
