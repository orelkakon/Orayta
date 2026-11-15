import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { isUuid, validFirstDay } from '@/lib/audience/devices';
import { hashDevice, israelToday, purgeOldDevices, quietly, statsSalt } from '@/lib/audience/server';

export const dynamic = 'force-dynamic';

// One call per device per day; a synagogue's Wi-Fi shares one IP.
const limited = makeRateLimiter(60, 10 * 60_000);

/**
 * A device was active today. Stores sha256(random id + server salt) for the
 * day, plus the day the device says it was first seen — nothing else. Rows
 * are deleted after 90 days.
 */
export async function POST(req: NextRequest) {
  if (isAdmin(req)) return NextResponse.json({ ok: true });
  const salt = statsSalt();
  if (!salt) return NextResponse.json({ ok: true });
  if (limited(clientIp(req))) return NextResponse.json({ ok: true });

  const body = (await req.json().catch(() => null)) as { id?: unknown; firstDay?: unknown } | null;
  if (!body || !isUuid(body.id)) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  const day = israelToday();
  const idHash = hashDevice(body.id, salt);
  const firstDay = validFirstDay(body.firstDay, day);

  await quietly(() => prisma.deviceDay.upsert({
    where: { day_idHash: { day, idHash } },
    update: {},
    create: { day, idHash, firstDay },
  }), null);
  await purgeOldDevices();
  return NextResponse.json({ ok: true });
}
