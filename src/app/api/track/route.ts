import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const METRICS = [
  'users', 'feed', 'content', 'today', 'pwa',
  'stories', 'quiz', 'rabbis', 'study', 'sikumim', 'chidushim', 'gematria', 'live',
] as const;
type Metric = (typeof METRICS)[number];

function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { metric?: string } | null;
  const metric = body?.metric;
  if (!metric || !METRICS.includes(metric as Metric)) {
    return NextResponse.json({ error: 'bad metric' }, { status: 400 });
  }
  const day = todayKey();
  await prisma.dailyStat.upsert({
    where: { day_metric: { day, metric } },
    update: { count: { increment: 1 } },
    create: { day, metric, count: 1 },
  });
  return NextResponse.json({ ok: true });
}
