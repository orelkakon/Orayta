import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { candleKey, israelIso } from '@/lib/push/hilula';
import { pushIpHash } from '@/lib/push/server';

export const dynamic = 'force-dynamic';

/* In-process limiter — the counter is symbolic, so best-effort per instance is
   enough: a few candles per IP per day (households share an IP). */
const MAX_PER_DAY = 5;
const seen = new Map<string, number>();

export async function POST(req: NextRequest) {
  const day = israelIso(new Date());
  const key = `${day}|${pushIpHash(req)}`;
  const n = seen.get(key) ?? 0;
  if (seen.size > 5000) seen.clear();
  if (n >= MAX_PER_DAY) {
    const row = await prisma.globalCounter.findUnique({ where: { key: candleKey(day) } });
    return NextResponse.json({ candles: row?.value ?? 0, limited: true });
  }
  seen.set(key, n + 1);
  const row = await prisma.globalCounter.upsert({
    where: { key: candleKey(day) },
    update: { value: { increment: 1 } },
    create: { key: candleKey(day), value: 1 },
  });
  return NextResponse.json({ candles: row.value });
}
