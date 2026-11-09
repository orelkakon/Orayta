import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { botIpHash } from '@/lib/rabbiBot/store';
import { makeRateLimiter } from '@/lib/minyan/server';
import { AUDIO_MAX_BYTES, AUDIO_MIN_BYTES, audioExtension } from '@/lib/rabbiBot/voice/transcript';
import { transcribe } from '@/lib/rabbiBot/voice/whisper';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/rabbi-bot/transcribe — a recorded question (raw audio body) →
 * `{ text }`. The text only fills the composer; asking stays a separate,
 * rate-limited request. Rate-limited per hashed IP (admin exempt); the audio
 * goes to Whisper and is never stored.
 */
const burst = makeRateLimiter(12, 10 * 60_000);
const daily = makeRateLimiter(80, 24 * 3600_000);
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  const ext = audioExtension(req.headers.get('content-type'));
  if (!ext) return fail('bad_request', 415);
  const size = Number(req.headers.get('content-length') ?? 0);
  if (size > AUDIO_MAX_BYTES) return fail('too_large', 413);

  if (!isAdmin(req)) {
    const ip = botIpHash(req);
    if (burst(ip) || daily(ip)) return fail('rate_limited', 429);
  }
  const audio = await req.blob().catch(() => null);
  if (!audio || audio.size < AUDIO_MIN_BYTES) return fail('empty', 400);
  if (audio.size > AUDIO_MAX_BYTES) return fail('too_large', 413);

  const result = await transcribe(audio, ext);
  if (!result.ok) return fail(result.error, result.error === 'busy' ? 503 : 502);
  if (!result.text) return fail('empty', 422);
  return NextResponse.json({ text: result.text }, { headers: { 'Cache-Control': 'no-store' } });
}
