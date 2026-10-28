import { prisma } from '@/lib/db';
import { dayKeys, jerusalemDay } from '@/lib/adminStatsUtils';
import type { RabbiBotAdminRow, RabbiBotAdminStats, RabbiBotStatus } from '@/types/rabbiBot';
import { loadExhausted } from './quota';
import { botModels } from './gemini';
import { quotaResetAt, RETENTION_DAYS } from './rules';

const LIST_N = 8;
const TOP_N = 8;
const DAY_MS = 86_400_000;

const ROW_SELECT = {
  id: true, createdAt: true, question: true, status: true, topic: true,
  rating: true, reported: true, note: true, verified: true, points: true,
} as const;

type Row = { id: string; createdAt: Date; question: string | null; status: string; topic: string | null; rating: number | null; reported: boolean; note: string | null; verified: number; points: number };

const toRow = (r: Row): RabbiBotAdminRow => ({ ...r, status: r.status as RabbiBotStatus, createdAt: r.createdAt.toISOString() });
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/** Everything the admin card shows, computed straight from RabbiBotQuestion. */
export async function getRabbiBotStats(now = new Date()): Promise<RabbiBotAdminStats> {
  const days = dayKeys(14, now.getTime());
  const since14 = new Date(now.getTime() - 15 * DAY_MS);
  const since10 = new Date(now.getTime() - RETENTION_DAYS * DAY_MS);
  const quotaSince = new Date(quotaResetAt(now).getTime() - DAY_MS);

  const [total, agg, ratingRows, statusRows, topicRows, windowRows, askers, bookRows, modelRows, reports, lowRated, recent, exhausted] = await Promise.all([
    prisma.rabbiBotQuestion.count(),
    prisma.rabbiBotQuestion.aggregate({ _avg: { rating: true, latencyMs: true }, _sum: { points: true, verified: true } }),
    prisma.rabbiBotQuestion.groupBy({ by: ['rating'], where: { rating: { not: null } }, _count: { _all: true } }),
    prisma.rabbiBotQuestion.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.rabbiBotQuestion.groupBy({ by: ['topic'], _count: { _all: true } }),
    prisma.rabbiBotQuestion.findMany({ where: { createdAt: { gte: since14 } }, select: { createdAt: true, cached: true } }),
    prisma.rabbiBotQuestion.groupBy({ by: ['ipHash'], where: { createdAt: { gte: since10 }, ipHash: { not: null } } }),
    prisma.rabbiBotQuestion.findMany({ where: { books: { isEmpty: false } }, select: { books: true }, orderBy: { createdAt: 'desc' }, take: 2000 }),
    prisma.rabbiBotQuestion.groupBy({ by: ['model'], where: { createdAt: { gte: quotaSince }, cached: false }, _count: { _all: true } }),
    prisma.rabbiBotQuestion.count({ where: { reported: true } }),
    prisma.rabbiBotQuestion.findMany({
      where: { OR: [{ rating: { lte: 2 } }, { reported: true }], createdAt: { gte: since10 } },
      orderBy: { createdAt: 'desc' }, take: LIST_N, select: ROW_SELECT,
    }),
    prisma.rabbiBotQuestion.findMany({ orderBy: { createdAt: 'desc' }, take: LIST_N, select: ROW_SELECT }),
    loadExhausted(now),
  ]);

  const perDay = new Map<string, number>();
  windowRows.forEach(r => { const d = jerusalemDay(r.createdAt); perDay.set(d, (perDay.get(d) ?? 0) + 1); });
  const series = days.map(d => perDay.get(d) ?? 0);
  const sum = (from: number, to: number) => series.slice(Math.max(0, from), to).reduce((a, b) => a + b, 0);
  const n = series.length;

  const ratingDist = [1, 2, 3, 4, 5].map(s => ratingRows.find(r => r.rating === s)?._count._all ?? 0);
  const ratingCount = ratingDist.reduce((a, b) => a + b, 0);
  const byStatus: RabbiBotAdminStats['byStatus'] = {};
  statusRows.forEach(r => { byStatus[r.status as RabbiBotStatus] = r._count._all; });

  const bookCounts = new Map<string, number>();
  bookRows.forEach(r => r.books.forEach(b => bookCounts.set(b, (bookCounts.get(b) ?? 0) + 1)));

  return {
    total,
    today: series[n - 1] ?? 0,
    yesterday: series[n - 2] ?? 0,
    week: sum(n - 7, n),
    prevWeek: sum(n - 14, n - 7),
    askers10d: askers.length,
    ratingAvg: agg._avg.rating === null ? null : Math.round(agg._avg.rating * 10) / 10,
    ratingCount,
    ratingDist,
    answeredPct: pct(byStatus.answered ?? 0, total),
    verifiedPct: pct(agg._sum.verified ?? 0, agg._sum.points ?? 0),
    avgLatencyMs: Math.round(agg._avg.latencyMs ?? 0),
    cachedPct: pct(windowRows.filter(r => r.cached).length, windowRows.length),
    reports,
    byStatus,
    byTopic: topicRows.map(r => ({ topic: r.topic ?? 'other', count: r._count._all })).sort((a, b) => b.count - a.count),
    topBooks: Array.from(bookCounts, ([book, count]) => ({ book, count })).sort((a, b) => b.count - a.count).slice(0, TOP_N),
    models: botModels(),
    modelsToday: modelRows.flatMap(r => (r.model ? [{ model: r.model, count: r._count._all }] : [])),
    exhaustedToday: Array.from(exhausted),
    lowRated: lowRated.map(toRow),
    recent: recent.map(toRow),
  };
}
