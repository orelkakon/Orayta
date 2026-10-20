import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hilulaCalendar, israelIso, candleKey } from '@/lib/push/hilula';
import type { HilulaResponse, HilulaRabbi } from '@/types/push';

export const dynamic = 'force-dynamic';

/** Today's hilulot, the next days that have one, and today's candle count. */
export async function GET() {
  const now = new Date();
  const [rabbis, counter] = await Promise.all([
    prisma.rabbi.findMany({
      where: { deathDate: { not: null } },
      select: { id: true, name: true, fullName: true, datePeriod: true, bio: true, imageUrl: true, deathDate: true, sortYear: true },
      orderBy: { sortYear: 'asc' },
    }),
    prisma.globalCounter.findUnique({ where: { key: candleKey(israelIso(now)) } }),
  ]);
  const strip = (r: HilulaRabbi): HilulaRabbi => ({
    id: r.id, name: r.name, fullName: r.fullName, datePeriod: r.datePeriod,
    bio: r.bio, imageUrl: r.imageUrl, deathDate: r.deathDate,
  });
  const cal = hilulaCalendar(rabbis, now);
  const body: HilulaResponse = {
    today: { ...cal.today, rabbis: cal.today.rabbis.map(strip) },
    upcoming: cal.upcoming.map(d => ({ ...d, rabbis: d.rabbis.map(strip) })),
    candles: counter?.value ?? 0,
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
