import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { HE } from '@/lib/hebrewTexts';
import { normalizeCommentText } from '@/lib/feedComments';
import { mapLimit, pushConfigured, sendPush } from '@/lib/push/server';
import type { PushBroadcastRecord, PushPayload } from '@/types/push';

export const dynamic = 'force-dynamic';

/**
 * Admin-only broadcast: one written notification to every subscribed device.
 * Guarded against double-taps (one send per 2 minutes); dead subscriptions
 * (404/410) are removed on the way. The last broadcast is kept for the card.
 */
const LAST_KEY = 'push_broadcast_last';
const COOLDOWN_MS = 2 * 60_000;
const TITLE_MAX = 50;
const BODY_MAX = 180;

async function last(): Promise<PushBroadcastRecord | null> {
  const row = await prisma.appConfig.findUnique({ where: { key: LAST_KEY } });
  try { return row ? JSON.parse(row.value) as PushBroadcastRecord : null; } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ last: await last() }, { headers: { 'Cache-Control': 'no-store' } });
}

function safePath(v: unknown): string {
  return typeof v === 'string' && /^\/(?!\/)[\w\-./?=&%#]*$/.test(v) && v.length <= 200 ? v : '/';
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: 'push not configured' }, { status: 503 });
  let raw: { title?: unknown; body?: unknown; url?: unknown };
  try { raw = await req.json() as typeof raw; } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }

  const body = normalizeCommentText(typeof raw.body === 'string' ? raw.body : '');
  const title = normalizeCommentText(typeof raw.title === 'string' ? raw.title : '').replace(/\s+/g, ' ') || HE.APP_NAME;
  if (body.length < 2 || body.length > BODY_MAX || title.length > TITLE_MAX) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const prev = await last();
  if (prev && Date.now() - Date.parse(prev.at) < COOLDOWN_MS) {
    return NextResponse.json({ error: 'too soon' }, { status: 429 });
  }

  const url = safePath(raw.url);
  const at = new Date().toISOString();
  const payload: PushPayload = { kind: 'broadcast', title, body, url, tag: `broadcast-${at}` };
  // Claim the cooldown before sending, so a double tap can't fan out twice.
  const record: PushBroadcastRecord = { at, title, body, url, sent: 0, failed: 0 };
  await prisma.appConfig.upsert({ where: { key: LAST_KEY }, update: { value: JSON.stringify(record) }, create: { key: LAST_KEY, value: JSON.stringify(record) } });

  const subs = await prisma.pushSubscription.findMany({ select: { id: true, endpoint: true, p256dh: true, auth: true } });
  const outcomes = await mapLimit(subs, 20, s => sendPush(s, payload));
  const gone = subs.filter((_, i) => outcomes[i] === 'gone').map(s => s.id);
  const failedIds = subs.filter((_, i) => outcomes[i] === 'failed').map(s => s.id);
  if (gone.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
  if (failedIds.length) await prisma.pushSubscription.updateMany({ where: { id: { in: failedIds } }, data: { failures: { increment: 1 } } });

  const done = { ...record, sent: outcomes.filter(o => o === 'sent').length, failed: failedIds.length };
  await prisma.appConfig.update({ where: { key: LAST_KEY }, data: { value: JSON.stringify(done) } });
  return NextResponse.json({ total: subs.length, sent: done.sent, failed: done.failed, removed: gone.length });
}
