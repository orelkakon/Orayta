import { NextRequest, NextResponse } from 'next/server';
import type { RabbiBotEvent, RabbiBotAnswer } from '@/types/rabbiBot';
import { validateQuestion, quotaResetAt } from '@/lib/rabbiBot/rules';
import { questionKey } from '@/lib/rabbiBot/text';
import { askRabbiBot } from '@/lib/rabbiBot/pipeline';
import { NoModelError } from '@/lib/rabbiBot/gemini';
import { loadExhausted, markExhausted, pruneMailClaims } from '@/lib/rabbiBot/quota';
import {
  botIpHash, isRateLimited, findCached, saveQuestion, purgeOld, signQuestionToken,
} from '@/lib/rabbiBot/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Every model call must be over by then — leaves time to save under maxDuration. */
const BUDGET_MS = 52_000;

const json = (body: RabbiBotEvent, status: number) => NextResponse.json(body, { status });

/**
 * Public: ask רבי־בוט a question. Validated, rate-limited per hashed IP, and
 * answered from cache when the same question was answered well recently.
 * Streams NDJSON progress (RabbiBotEvent) ending with `done` or `error`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { question?: unknown; website?: unknown } | null;
  if (!body || (typeof body.website === 'string' && body.website.trim())) {
    return json({ type: 'error', error: 'bad_request' }, 400);
  }
  const v = validateQuestion(body.question);
  if (!v.ok) return json({ type: 'error', error: v.error }, 400);

  const ipHash = botIpHash(req);
  await purgeOld();
  if (await isRateLimited(ipHash)) return json({ type: 'error', error: 'rate_limited' }, 429);

  const qHash = questionKey(v.text);
  const started = Date.now();
  const cached = await findCached(qHash);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: RabbiBotEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      const finish = async (answer: RabbiBotAnswer, model: string | null, fromCache: boolean) => {
        const id = await saveQuestion({
          question: v.text, qHash, ipHash, answer, model, cached: fromCache, latencyMs: Date.now() - started,
        });
        send({ type: 'done', id, token: signQuestionToken(id), answer });
      };
      try {
        if (cached) {
          await finish(cached, null, true);
        } else {
          const skip = await loadExhausted();
          const hooks = { skip, onExhausted: (m: string) => markExhausted(m), deadline: started + BUDGET_MS };
          const result = await askRabbiBot(v.text, hooks, (step, extra) => send({ type: 'step', step, ...extra }));
          await finish(result.answer, result.model, false);
        }
      } catch (e) {
        if (e instanceof NoModelError && e.quota) {
          send({ type: 'error', error: 'quota', resetAt: quotaResetAt(new Date()).toISOString() });
          await pruneMailClaims().catch(() => undefined);
        } else {
          console.error('[rabbi-bot] ask failed', e);
          send({ type: 'error', error: e instanceof NoModelError ? 'busy' : 'unavailable' });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
