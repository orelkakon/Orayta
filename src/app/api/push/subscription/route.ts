import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findOwnedSubscription } from '@/lib/push/server';
import { parsePrefs } from '@/lib/push/prefs';
import { invalidateSchedule } from '@/lib/push/scheduleCache';

export const dynamic = 'force-dynamic';

type Body = { endpoint?: unknown; auth?: unknown; prefs?: unknown; timeZone?: unknown };

async function readBody(req: NextRequest): Promise<Body | null> {
  try { return await req.json() as Body; } catch { return null; }
}

/** Updates preferences — the caller proves ownership with endpoint + auth secret. */
export async function PATCH(req: NextRequest) {
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: 'bad json' }, { status: 400 });
  const row = await findOwnedSubscription(body.endpoint, body.auth);
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const prefs = parsePrefs(body.prefs, body.timeZone);
  const updated = await prisma.pushSubscription.update({ where: { id: row.id }, data: prefs });
  invalidateSchedule();
  return NextResponse.json({
    dailyMinutes: updated.dailyMinutes, daily: updated.daily, hilula: updated.hilula, omer: updated.omer,
  });
}

export async function DELETE(req: NextRequest) {
  const body = await readBody(req);
  if (!body) return NextResponse.json({ error: 'bad json' }, { status: 400 });
  const row = await findOwnedSubscription(body.endpoint, body.auth);
  if (row) {
    await prisma.pushSubscription.delete({ where: { id: row.id } });
    invalidateSchedule();
  }
  return NextResponse.json({ ok: true });
}
