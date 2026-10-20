import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseSubscription, pushIpHash, isPushRateLimited, pushConfigured } from '@/lib/push/server';
import { parsePrefs } from '@/lib/push/prefs';

export const dynamic = 'force-dynamic';

/**
 * Registers (or refreshes) this device. Re-subscribing with the same endpoint
 * keeps the row and its "sent today" markers, so toggling never double-sends.
 */
export async function POST(req: NextRequest) {
  if (!pushConfigured()) return NextResponse.json({ error: 'push not configured' }, { status: 503 });
  let body: { subscription?: unknown; prefs?: unknown; timeZone?: unknown; previousEndpoint?: unknown };
  try { body = await req.json() as typeof body; } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }

  const sub = parseSubscription(body.subscription);
  if (!sub) return NextResponse.json({ error: 'invalid subscription' }, { status: 400 });
  const prev = typeof body.previousEndpoint === 'string'
    ? await prisma.pushSubscription.findUnique({ where: { endpoint: body.previousEndpoint } })
    : null;
  // A rotated subscription inherits the old one's settings.
  const inherited = prev
    ? { timeZone: prev.timeZone, dailyMinutes: prev.dailyMinutes, daily: prev.daily, hilula: prev.hilula, omer: prev.omer }
    : {};
  const prefs = { ...inherited, ...parsePrefs(body.prefs, body.timeZone) };

  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint: sub.endpoint }, select: { id: true } });
  const ipHash = pushIpHash(req);
  if (!existing && !prev && await isPushRateLimited(ipHash)) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 });
  }

  const data = { p256dh: sub.keys.p256dh, auth: sub.keys.auth, ...prefs, failures: 0 };
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: data,
    create: { endpoint: sub.endpoint, ipHash, ...data },
  });

  // pushsubscriptionchange: the browser rotated the endpoint — drop the old row.
  if (prev && prev.endpoint !== sub.endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { id: prev.id } });
  }
  return NextResponse.json({ ok: true });
}
