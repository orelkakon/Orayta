import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { ADMIN_MARK } from '@/lib/tehillim/server';
import type { TehillimAdminStats } from '@/types/tehillim';

export const dynamic = 'force-dynamic';

/** GET — חלוקות תהילים at a glance for the admin (readings the admin opened are left out). */
const DAY = 86_400_000;

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const now = Date.now();
  const real = { ipHash: { not: ADMIN_MARK } };
  const read = (since: number) => ({ status: 'done', doneAt: { gt: new Date(since) }, circle: real });
  const [total, opened30, active7, books, today, week, month, readers] = await Promise.all([
    prisma.tehillimCircle.count({ where: real }),
    prisma.tehillimCircle.count({ where: { ...real, createdAt: { gt: new Date(now - 30 * DAY) } } }),
    prisma.tehillimCircle.count({ where: { ...real, activeAt: { gt: new Date(now - 7 * DAY) } } }),
    prisma.tehillimCircle.aggregate({ where: real, _sum: { books: true } }),
    prisma.tehillimClaim.count({ where: read(now - DAY) }),
    prisma.tehillimClaim.count({ where: read(now - 7 * DAY) }),
    prisma.tehillimClaim.count({ where: read(now - 30 * DAY) }),
    prisma.tehillimClaim.groupBy({ by: ['readerHash'], where: read(now - 30 * DAY) }),
  ]);
  const stats: TehillimAdminStats = {
    total, opened30, active7, books: books._sum.books ?? 0, readToday: today, readWeek: week, readMonth: month, readers30: readers.length,
  };
  return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
}
