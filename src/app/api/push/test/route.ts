import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { HE } from '@/lib/hebrewTexts';
import { lastPushError, sendPush } from '@/lib/push/server';
import { localClock, DEFAULT_TIME_ZONE } from '@/lib/push/schedule';
import { dailyPayload, hilulaPayload, omerPayload } from '@/lib/push/content';
import { hebrewDayAnchor } from '@/lib/push/hilula';
import type { PushPayload } from '@/types/push';

export const dynamic = 'force-dynamic';

/**
 * Admin-only: sends a real server push (through the push service, end to end)
 * to the admin's own device, with today's actual daily / hilula / omer content.
 * Doesn't touch the "sent today" markers.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: { endpoint?: unknown; kind?: unknown };
  try { body = await req.json() as typeof body; } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (typeof body.endpoint !== 'string') return NextResponse.json({ error: 'endpoint required' }, { status: 400 });
  const sub = await prisma.pushSubscription.findUnique({ where: { endpoint: body.endpoint } });
  if (!sub) return NextResponse.json({ error: 'not subscribed' }, { status: 404 });

  const now = new Date();
  const day = localClock(now, DEFAULT_TIME_ZONE).day;
  let payload: PushPayload | null;
  if (body.kind === 'daily') payload = await dailyPayload(now, day);
  else if (body.kind === 'hilula') payload = await hilulaPayload(hebrewDayAnchor(now), day);
  else if (body.kind === 'omer') payload = omerPayload(33, day);
  else payload = { kind: 'test', title: HE.PUSH_TEST_TITLE, body: HE.PUSH_TEST_BODY, url: '/', tag: 'test' };
  if (!payload) return NextResponse.json({ error: 'nothing to send today' }, { status: 404 });

  const outcome = await sendPush(sub, payload);
  return NextResponse.json({ outcome, payload, ...(outcome === 'sent' ? {} : { reason: lastPushError() }) });
}
