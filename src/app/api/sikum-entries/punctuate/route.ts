import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { generateJson, NoModelError } from '@/lib/rabbiBot/gemini';
import { loadExhausted, markExhausted } from '@/lib/rabbiBot/quota';
import { PUNCTUATE_MAX_CHARS, PUNCTUATE_SCHEMA, PUNCTUATE_SYSTEM, acceptPunctuation } from '@/lib/sikum/punctuate';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

/**
 * POST /api/sikum-entries/punctuate `{ text }` → `{ text }` with punctuation
 * and paragraph breaks added — admin only. Runs on the lite models (large free
 * quota, shared bookkeeping with רבי־בוט), Groq's Qwen as the backup. The
 * result is refused (`changed`) unless every word is the writer's own.
 */
const MODELS = [
  'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-flash-lite-latest',
  'groq:qwen/qwen3.8-27b',
];
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return fail('forbidden', 403);
  const body = await req.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return fail('empty', 400);
  if (text.length > PUNCTUATE_MAX_CHARS) return fail('too_long', 413);

  const skip = await loadExhausted().catch(() => new Set<string>());
  const hooks = { skip, onExhausted: (m: string) => markExhausted(m).catch(() => undefined), deadline: Date.now() + 40_000 };
  // Up to two tries: a model that changed a word gets one more chance on the next model.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { value, model } = await generateJson(MODELS, {
        system: PUNCTUATE_SYSTEM, user: text, schema: PUNCTUATE_SCHEMA, timeoutMs: 25_000,
      }, hooks);
      const accepted = acceptPunctuation(text, value);
      if (accepted) return NextResponse.json({ text: accepted }, { headers: { 'Cache-Control': 'no-store' } });
      hooks.skip.add(model);
    } catch (e) {
      return fail(e instanceof NoModelError && e.quota ? 'quota' : 'unavailable', 503);
    }
  }
  return fail('changed', 422);
}
