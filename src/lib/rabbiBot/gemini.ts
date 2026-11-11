import { classifyFailure, isMomentary } from './rules';
import { callGroq, isGroqModel, GROQ_PREFIX } from './groq';
import { readSse } from './sse';

// Server-only: the models behind רבי־בוט, all on free tiers — Gemini REST
// (Google AI Studio, GEMINI_API_KEY) and Groq ("groq:" models, GROQ_API_KEY,
// see groq.ts). Free quota is counted per model *name* (the Gemini flash
// models allow ~20 requests a day each), so each step walks a chain of models.
// Planning runs first on the Groq ensemble (plan.ts: two models in parallel,
// merged — they miss different simanim), which leaves the scarce flash quota
// to the answer; the Gemini plan chain is its fallback. The answer runs on the
// strongest model that still has quota today: flash, then Groq's Qwen, then lite.
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

const DEFAULT_PLAN = [
  'gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest',
];
// 3.8-flash (and flash-latest, which points at it) is strong but often slow — tried last among the flash models.
// Qwen on Groq beat the lite models on halacha answers (and gpt-oss-120b, which
// gives up too readily), so it comes right after flash.
const DEFAULT_ANSWER = [
  'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest',
  'groq:qwen/qwen3.8-27b',
  'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest',
];
// Planned in parallel and merged: Qwen restates the question best, gpt-oss knows more simanim.
const DEFAULT_PLAN_ENSEMBLE = ['groq:qwen/qwen3.8-27b', 'groq:openai/gpt-oss-120b'];

const fromEnv = (v: string | undefined, fallback: string[]) => {
  const list = v?.split(',').map(s => s.trim()).filter(Boolean);
  return list?.length ? list : fallback;
};

export const planModels = () => fromEnv(process.env.RABBI_BOT_PLAN_MODELS, DEFAULT_PLAN);
export const answerModels = () => fromEnv(process.env.RABBI_BOT_ANSWER_MODELS, DEFAULT_ANSWER);
export const planEnsemble = () => fromEnv(process.env.RABBI_BOT_PLAN_ENSEMBLE, DEFAULT_PLAN_ENSEMBLE);
/** Every model in use, answer chain order first (admin display, quota bookkeeping). */
export const botModels = () => Array.from(new Set([...answerModels(), ...planEnsemble(), ...planModels()]));
/** The backup tier — a notch weaker at answering than the Gemini flash models. */
export const isBackupModel = (m: string) => m.includes('lite') || isGroqModel(m);

export interface JsonCall {
  system: string;
  user: string;
  /** A shorter `user` for models with small input limits (Groq's free tier); defaults to `user`. */
  compactUser?: string;
  schema: object;
  timeoutMs: number;
  /** Streams the output: called with the text so far as it arrives (Gemini; Groq answers whole). */
  onText?: (soFar: string) => void;
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

export type CallResult = { ok: true; value: unknown } | { ok: false; status: number; body: unknown };

const MIN_CALL_MS = 6000;

/** The API key a model's provider needs, or undefined when it isn't configured (the model is skipped). */
const keyFor = (model: string) => (isGroqModel(model) ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY);
export const isConfigured = (model: string) => Boolean(keyFor(model));

function callOnce(model: string, key: string, call: JsonCall, timeoutMs: number): Promise<CallResult> {
  return isGroqModel(model) ? callGroq(model.slice(GROQ_PREFIX.length), key, call, timeoutMs) : callGemini(model, key, call, timeoutMs);
}

const partsText = (r: GenResponse | null) =>
  r?.candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? '').join('') ?? '';

async function callGemini(model: string, key: string, call: JsonCall, timeoutMs: number): Promise<CallResult> {
  const stream = Boolean(call.onText);
  const res = await fetch(`${API}/${model}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`, {
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
  if (!res.ok) return { ok: false, status: res.status, body: await res.json().catch(() => null) as unknown };
  let text = '';
  if (stream && res.body) {
    await readSse(res.body, chunk => {
      const add = partsText(chunk as GenResponse);
      if (!add) return;
      text += add;
      call.onText?.(text);
    });
  } else {
    text = partsText(await res.json().catch(() => null) as GenResponse | null);
  }
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
  let anyLive = false;
  for (const model of models) {
    const key = keyFor(model);
    if (!key || hooks.skip.has(model)) continue;
    const budget = Math.min(call.timeoutMs, hooks.deadline - Date.now());
    if (budget < MIN_CALL_MS) { anyLive = true; break; }
    try {
      let r = await callOnce(model, key, call, budget);
      // Overload or a derailed generation is usually momentary — one quick retry if time allows.
      if (!r.ok && isMomentary(r.status, r.body) && hooks.deadline - Date.now() > MIN_CALL_MS * 2) {
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
  // "Out of quota" only when every configured model has used up its day.
  const configured = models.filter(isConfigured);
  throw new NoModelError(!anyLive && configured.length > 0 && configured.every(m => hooks.skip.has(m)));
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
