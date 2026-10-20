import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { localClock, DEFAULT_TIME_ZONE } from '@/lib/push/schedule';
import type { PushAdminStats } from '@/types/push';

export const dynamic = 'force-dynamic';

/** Admin: subscriber counts by preference and what went out today. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const today = localClock(new Date(), DEFAULT_TIME_ZONE).day;
  const [total, daily, hilula, omer, sentToday, failing] = await Promise.all([
    prisma.pushSubscription.count(),
    prisma.pushSubscription.count({ where: { daily: true } }),
    prisma.pushSubscription.count({ where: { hilula: true } }),
    prisma.pushSubscription.count({ where: { omer: true } }),
    prisma.pushSubscription.count({ where: { lastDailyDay: today } }),
    prisma.pushSubscription.count({ where: { failures: { gt: 0 } } }),
  ]);
  const stats: PushAdminStats = { total, daily, hilula, omer, sentToday, failing };
  return NextResponse.json(stats);
}
