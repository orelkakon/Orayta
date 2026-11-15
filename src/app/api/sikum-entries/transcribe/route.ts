import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { AUDIO_MAX_BYTES, AUDIO_MIN_BYTES, audioExtension } from '@/lib/rabbiBot/voice/transcript';
import { transcribe } from '@/lib/rabbiBot/voice/whisper';
import { dictationPrompt } from '@/lib/sikum/dictation';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/sikum-entries/transcribe?book=&title=&before= — one dictated
 * piece of a summary (raw audio body) → `{ text }`. Admin only (the writer).
 * The query carries the context that steers Whisper (see `dictationPrompt`).
 * Audio goes to Whisper and is never stored.
 */
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return fail('forbidden', 403);
  const ext = audioExtension(req.headers.get('content-type'));
  if (!ext) return fail('bad_request', 415);
  if (Number(req.headers.get('content-length') ?? 0) > AUDIO_MAX_BYTES) return fail('too_large', 413);

  const audio = await req.blob().catch(() => null);
  if (!audio || audio.size < AUDIO_MIN_BYTES) return fail('empty', 400);
  if (audio.size > AUDIO_MAX_BYTES) return fail('too_large', 413);

  const q = req.nextUrl.searchParams;
  const prompt = dictationPrompt({
    book: q.get('book')?.slice(0, 80) ?? undefined,
    title: q.get('title')?.slice(0, 120) ?? undefined,
    before: q.get('before')?.slice(-400) ?? undefined,
  });
  const result = await transcribe(audio, ext, prompt);
  if (!result.ok) return fail(result.error, result.error === 'busy' ? 503 : 502);
  return NextResponse.json({ text: result.text }, { headers: { 'Cache-Control': 'no-store' } });
}
