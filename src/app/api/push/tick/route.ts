import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pushConfigured } from '@/lib/push/server';
import { mightBeDue, runDispatch } from '@/lib/push/dispatch';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Public, secret-free heartbeat for any free pinger (cron-job.org, UptimeRobot…)
 * and a backup for GitHub's unreliable schedules. It only ever sends what is
 * already due (the dispatcher is idempotent), and runs at most once a minute:
 * the run is claimed with a conditional update on AppConfig `push_tick_last`.
 */
const KEY = 'push_tick_last';
const MIN_GAP_MS = 55_000;

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
  if (!mightBeDue(new Date())) return NextResponse.json({ ok: true, ran: false, idle: true }, { headers: { 'Cache-Control': 'no-store' } });
  if (!(await claim(Date.now()))) return NextResponse.json({ ok: true, ran: false }, { headers: { 'Cache-Control': 'no-store' } });
  const r = await runDispatch();
  return NextResponse.json({ ok: true, ran: true, sent: r.sent }, { headers: { 'Cache-Control': 'no-store' } });
}

export const GET = tick;
export const POST = tick;
