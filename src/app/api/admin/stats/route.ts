import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import type { AdminStats, AdminDailyRow, DailyMetric } from '@/types';

export const dynamic = 'force-dynamic';

const DAYS = 30;
const COUNTER_KEYS = ['questions', 'feedSaves', 'whatsappShares', 'storyShares'];
const METRICS: DailyMetric[] = [
  'users', 'feed', 'content', 'today', 'pwa',
  'stories', 'quiz', 'rabbis', 'study', 'sikumim', 'chidushim', 'gematria', 'live',
];

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
    const row = { day } as AdminDailyRow;
    METRICS.forEach(m => { row[m] = 0; });
    dailyRows
      .filter(r => r.day === day && (METRICS as string[]).includes(r.metric))
      .forEach(r => { row[r.metric as DailyMetric] = r.count; });
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
    totals: Object.fromEntries(METRICS.map(m => [m, total(m)])) as Record<DailyMetric, number>,
    daily,
  };
  return NextResponse.json(stats);
}
