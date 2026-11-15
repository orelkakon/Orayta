import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { dayKeys } from '@/lib/adminStatsUtils';
import { getCommentStats } from '@/lib/adminCommentStats';
import { orMissing } from '@/lib/audience/server';
import { DAILY_METRICS } from '@/types';
import type { AdminStats, AdminDailyRow, DailyMetric } from '@/types';

export const dynamic = 'force-dynamic';

const DAYS = 30;
const COUNTER_KEYS = ['questions', 'feedSaves', 'whatsappShares', 'storyShares', 'telegramShares'];
const METRICS = DAILY_METRICS;

/** Distinct devices active in [from, to] — null while DeviceDay doesn't exist.
 *  Other DB errors are logged (orMissing) and the KPI keeps its old number;
 *  the audience card on the same page reports the failure. */
async function uniqueDevices(from: string, to: string): Promise<number | null> {
  return orMissing(async () => {
    const rows = await prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(DISTINCT "idHash")::int AS n FROM "DeviceDay" WHERE "day" >= ${from} AND "day" <= ${to}`;
    return rows[0]?.n ?? 0;
  }, null).catch(() => null);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const days = dayKeys(DAYS);
  const last14 = dayKeys(14);
  const [visits, counters, reactionRows, totalRows, dailyRows, comments, devWeek, devPrev] = await Promise.all([
    prisma.pageVisit.count(),
    prisma.globalCounter.findMany({ where: { key: { in: COUNTER_KEYS } } }),
    prisma.feedLike.groupBy({ by: ['reaction'], _sum: { likes: true } }),
    prisma.dailyStat.groupBy({ by: ['metric'], _sum: { count: true }, _min: { day: true } }),
    prisma.dailyStat.findMany({ where: { day: { gte: days[0] } } }),
    getCommentStats(days),
    uniqueDevices(last14[7], last14[13]),
    uniqueDevices(last14[0], last14[6]),
  ]);

  const counter  = (key: string) => counters.find(c => c.key === key)?.value ?? 0;
  const reaction = (r: string) => reactionRows.find(x => x.reaction === r)?._sum.likes ?? 0;
  const totalRow = (m: string) => totalRows.find(x => x.metric === m);
  const total    = (m: string) => totalRow(m)?._sum.count ?? 0;

  const daily: AdminDailyRow[] = days.map(day => {
    const row = { day } as AdminDailyRow;
    METRICS.forEach(m => { row[m] = 0; });
    dailyRows
      .filter(r => r.day === day && (METRICS as readonly string[]).includes(r.metric))
      .forEach(r => { row[r.metric as DailyMetric] = r.count; });
    return row;
  });

  const games = dailyRows.filter(r => r.metric === 'games');
  const gamesFrom = (from: string) => games.filter(r => r.day >= from).reduce((s, r) => s + r.count, 0);

  const heart = reaction('heart');
  const fire  = reaction('fire');
  const spark = reaction('spark');

  const stats: AdminStats = {
    visits,
    questions: counter('questions'),
    saves: counter('feedSaves'),
    shares: { wa: counter('whatsappShares'), story: counter('storyShares'), tg: counter('telegramShares') },
    reactions: { total: heart + fire + spark, heart, fire, spark },
    comments,
    totals: Object.fromEntries(METRICS.map(m => [m, total(m)])) as Record<DailyMetric, number>,
    daily,
    devices: devWeek === null || devPrev === null ? null : { week: devWeek, prevWeek: devPrev },
    games: {
      today: gamesFrom(days[DAYS - 1]),
      week: gamesFrom(days[DAYS - 7]),
      month: gamesFrom(days[0]),
      total: total('games'),
      since: totalRow('games')?._min.day ?? null,
    },
  };
  return NextResponse.json(stats);
}
