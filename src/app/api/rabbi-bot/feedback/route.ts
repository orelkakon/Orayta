import { NextRequest, NextResponse } from 'next/server';
import { isRating } from '@/lib/rabbiBot/rules';
import { normalizeCommentText } from '@/lib/feedComments';
import { applyFeedback, verifyQuestionToken } from '@/lib/rabbiBot/store';

export const dynamic = 'force-dynamic';

const NOTE_MAX = 500;

/** Public: the asker rates an answer (1–5) or reports an error. Owner = signed token from /ask. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as
    { id?: unknown; token?: unknown; rating?: unknown; report?: unknown; note?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  const token = typeof body?.token === 'string' ? body.token : null;
  if (!id || id.length > 40 || !verifyQuestionToken(id, token)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const raw = body?.rating;
  const rating = isRating(raw) ? raw : undefined;
  const report = body?.report === true;
  if (!rating && !report) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const note = typeof body?.note === 'string' ? normalizeCommentText(body.note).slice(0, NOTE_MAX) : undefined;

  const ok = await applyFeedback(id, { rating, report, note });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}
