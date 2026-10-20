import { prisma } from '@/lib/db';
import { isCommentTarget } from '@/lib/feedComments';
import { jerusalemDay } from '@/lib/adminStatsUtils';
import { clip } from '@/lib/siteUrl';
import type { AdminCommentStats, AdminCommentPost, FeedCommentTarget } from '@/types';

const TOP_N = 5;
const RECENT_N = 8;
const PREVIEW_LEN = 70;

type Ref = { type: FeedCommentTarget; id: string };

/** One short line describing each post, fetched per type in parallel. */
async function previews(refs: Ref[]): Promise<Map<string, string>> {
  const ids = (t: FeedCommentTarget) => Array.from(new Set(refs.filter(r => r.type === t).map(r => r.id)));
  const inIds = (t: FeedCommentTarget) => ({ where: { id: { in: ids(t) } } });
  const [citations, rabbis, books, chidushim, gematrias, sikumim, reels] = await Promise.all([
    prisma.citation.findMany({ ...inIds('citation'), select: { id: true, content: true } }),
    prisma.rabbi.findMany({ ...inIds('rabbi'), select: { id: true, name: true } }),
    prisma.book.findMany({ ...inIds('book'), select: { id: true, title: true } }),
    prisma.chidush.findMany({ ...inIds('chidush'), select: { id: true, text: true } }),
    prisma.gematria.findMany({ ...inIds('gematria'), select: { id: true, word: true, value: true } }),
    prisma.sikumEntry.findMany({ ...inIds('sikum'), select: { id: true, title: true, text: true } }),
    prisma.instagramReel.findMany({ ...inIds('reel'), select: { id: true, code: true, page: { select: { username: true } } } }),
  ]);
  const map = new Map<string, string>();
  const put = (t: FeedCommentTarget, id: string, text: string) => map.set(`${t}:${id}`, clip(text.replace(/\s+/g, ' '), PREVIEW_LEN));
  citations.forEach(c => put('citation', c.id, c.content));
  rabbis.forEach(r => put('rabbi', r.id, r.name));
  books.forEach(b => put('book', b.id, b.title));
  chidushim.forEach(c => put('chidush', c.id, c.text));
  gematrias.forEach(g => put('gematria', g.id, `${g.word} = ${g.value}`));
  sikumim.forEach(s => put('sikum', s.id, s.title || s.text));
  reels.forEach(r => put('reel', r.id, r.page?.username ? `@${r.page.username}` : r.code));
  return map;
}

/** Comment activity for the admin dashboard; `days` = the dashboard's day keys. */
export async function getCommentStats(days: string[]): Promise<AdminCommentStats> {
  const since = new Date(Date.now() - (days.length + 1) * 86400000);
  const [total, commenterRows, postRows, typeRows, windowRows, recentRows] = await Promise.all([
    prisma.feedComment.count(),
    prisma.feedComment.groupBy({ by: ['ipHash'] }),
    prisma.feedComment.groupBy({ by: ['itemType', 'itemId'], _count: { _all: true } }),
    prisma.feedComment.groupBy({ by: ['itemType'], _count: { _all: true } }),
    prisma.feedComment.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.feedComment.findMany({
      orderBy: { createdAt: 'desc' }, take: RECENT_N,
      select: { id: true, name: true, text: true, createdAt: true, itemType: true, itemId: true },
    }),
  ]);

  // Per-day counts on the same Jerusalem day keys as the rest of the dashboard.
  const perDay = new Map<string, number>();
  windowRows.forEach(r => { const d = jerusalemDay(r.createdAt); perDay.set(d, (perDay.get(d) ?? 0) + 1); });
  const series = days.map(d => perDay.get(d) ?? 0);
  const sum = (from: number, to: number) => series.slice(Math.max(0, from), to).reduce((a, b) => a + b, 0);
  const n = series.length;

  const top = postRows
    .filter(r => isCommentTarget(r.itemType))
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, TOP_N)
    .map(r => ({ type: r.itemType as FeedCommentTarget, id: r.itemId, count: r._count._all }));
  const recent = recentRows.filter(r => isCommentTarget(r.itemType));

  const prev = await previews([
    ...top,
    ...recent.map(r => ({ type: r.itemType as FeedCommentTarget, id: r.itemId })),
  ]);
  const post = (type: FeedCommentTarget, id: string): AdminCommentPost =>
    ({ type, id, preview: prev.get(`${type}:${id}`) ?? '' });

  const byType: AdminCommentStats['byType'] = {};
  typeRows.forEach(r => { if (isCommentTarget(r.itemType)) byType[r.itemType] = r._count._all; });

  return {
    total,
    today: series[n - 1] ?? 0,
    yesterday: series[n - 2] ?? 0,
    week: sum(n - 7, n),
    prevWeek: sum(n - 14, n - 7),
    commenters: commenterRows.length,
    posts: postRows.length,
    byType,
    top: top.map(t => ({ ...post(t.type, t.id), count: t.count })),
    recent: recent.map(r => ({
      id: r.id, name: r.name, text: r.text, createdAt: r.createdAt.toISOString(),
      post: post(r.itemType as FeedCommentTarget, r.itemId),
    })),
  };
}
