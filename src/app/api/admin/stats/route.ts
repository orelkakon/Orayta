import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import type { AdminStats, AdminDailyRow } from '@/types';

export const dynamic = 'force-dynamic';

const DAYS = 30;
const COUNTER_KEYS = ['questions', 'feedSaves', 'whatsappShares', 'storyShares'];

function dayKeys(n: number): string[] {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' });
  return Array.from({ length: n }, (_, i) => fmt.format(new Date(Date.now() - (n - 1 - i) * 86400000)));
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const days = dayKeys(DAYS);
  const [visits, counters, reactionRows, totalRows, dailyRows] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.globalCounter.findMany({ where: { key: { in: COUNTER_KEYS } } }),
    prisma.feedLike.groupBy({ by: ['reaction'], _sum: { likes: true } }),
    prisma.dailyStat.groupBy({ by: ['metric'], _sum: { count: true } }),
    prisma.dailyStat.findMany({ where: { day: { gte: days[0] } } }),
  ]);

  const counter  = (key: string) => counters.find(c => c.key === key)?.value ?? 0;
  const reaction = (r: string) => reactionRows.find(x => x.reaction === r)?._sum.likes ?? 0;
  const total    = (m: string) => totalRows.find(x => x.metric === m)?._sum.count ?? 0;

  const daily: AdminDailyRow[] = days.map(day => {
    const row: AdminDailyRow = { day, users: 0, feed: 0, content: 0, today: 0, pwa: 0 };
    dailyRows
      .filter(r => r.day === day)
      .forEach(r => { row[r.metric as keyof Omit<AdminDailyRow, 'day'>] = r.count; });
    return row;
  });

  const heart = reaction('heart');
  const fire  = reaction('fire');
  const spark = reaction('spark');

  const stats: AdminStats = {
    visits,
    questions: counter('questions'),
    saves: counter('feedSaves'),
    shares: { wa: counter('whatsappShares'), story: counter('storyShares') },
    reactions: { total: heart + fire + spark, heart, fire, spark },
    totals: {
      users: total('users'),
      feed: total('feed'),
      content: total('content'),
      today: total('today'),
      pwa: total('pwa'),
    },
    daily,
  };
  return NextResponse.json(stats);
}
