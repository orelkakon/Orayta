import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pushConfigured } from '@/lib/push/server';
import { runDispatch } from '@/lib/push/dispatch';
import { OMER_AFTER_SUNSET_MIN } from '@/lib/push/schedule';
import { hebrewDayAnchor, hilulaRabbisOn } from '@/lib/push/hilula';
import { inNightfallWindow, needsDispatch, type Tonight } from '@/lib/push/wake';
import { cachedHilulaDates, cachedSchedule } from '@/lib/push/scheduleCache';
import { getOmerDay } from '@/lib/omer';
import { jerusalemSunTimes } from '@/lib/siddur/calendar';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Public, secret-free heartbeat (cron-job.org every 5 minutes + site visits).
 * Decides from cached data whether anyone is due right now; only then does it
 * touch Neon — claim the run (at most once a minute, AppConfig
 * `push_tick_last`) and run the idempotent dispatcher.
 */
const KEY = 'push_tick_last';
const MIN_GAP_MS = 55_000;
const IDLE = { headers: { 'Cache-Control': 'no-store' } };

async function claim(now: number): Promise<boolean> {
  const row = await prisma.appConfig.findUnique({ where: { key: KEY } });
  if (row && now - Number(row.value) < MIN_GAP_MS) return false;
  if (!row) {
    try { await prisma.appConfig.create({ data: { key: KEY, value: String(now) } }); return true; } catch { return false; }
  }
  const won = await prisma.appConfig.updateMany({ where: { key: KEY, value: row.value }, data: { value: String(now) } });
  return won.count === 1;
}

async function tick() {
  if (!pushConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  const now = new Date();
  const entries = await cachedSchedule();
  if (entries.length === 0) return NextResponse.json({ ok: true, ran: false, idle: true }, IDLE);

  const nightfall = jerusalemSunTimes(now).sunset.getTime() + OMER_AFTER_SUNSET_MIN * 60_000;
  const tonight: Tonight = { hilula: false, omer: false };
  if (inNightfallWindow(now, nightfall)) {
    tonight.omer = getOmerDay(now) !== null;
    if (entries.some(e => e.hilula)) {
      const dates = await cachedHilulaDates();
      tonight.hilula = hilulaRabbisOn(dates.map(deathDate => ({ deathDate })), hebrewDayAnchor(now)).length > 0;
    }
  }
  if (!needsDispatch(now, entries, nightfall, tonight)) return NextResponse.json({ ok: true, ran: false, idle: true }, IDLE);

  if (!(await claim(now.getTime()))) return NextResponse.json({ ok: true, ran: false }, IDLE);
  const r = await runDispatch();
  return NextResponse.json({ ok: true, ran: true, sent: r.sent }, IDLE);
}

export const GET = tick;
export const POST = tick;
