import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { isUuid, validFirstDay } from '@/lib/audience/devices';
import { hashDevice, israelToday, notRecorded, orMissing, purgeOldDevices, recorded, statsSalt } from '@/lib/audience/server';

export const dynamic = 'force-dynamic';

// One call per device per day. A synagogue or school Wi-Fi puts many devices
// behind one IP, so the limit only stops scripted inflation.
const limited = makeRateLimiter(300, 10 * 60_000);

/**
 * A device was active today. Stores sha256(random id + server salt) for the
 * day, plus the day the device says it was first seen — nothing else. Rows
 * are deleted after 90 days. Answers `{ recorded }` so the client marks the
 * day only after a confirmed write.
 */
export async function POST(req: NextRequest) {
  if (isAdmin(req)) return notRecorded('admin');
  const salt = statsSalt();
  if (!salt) return notRecorded('disabled');
  if (limited(clientIp(req))) return notRecorded('rate_limited');

  const body = (await req.json().catch(() => null)) as { id?: unknown; firstDay?: unknown } | null;
  if (!body || !isUuid(body.id)) return notRecorded('bad_request');

  const day = israelToday();
  const idHash = hashDevice(body.id, salt);
  const firstDay = validFirstDay(body.firstDay, day);

  try {
    const row = await orMissing(() => prisma.deviceDay.upsert({
      where: { day_idHash: { day, idHash } },
      update: {},
      create: { day, idHash, firstDay },
    }), null);
    if (!row) return notRecorded('unavailable');
  } catch {
    return notRecorded('error');
  }
  await purgeOldDevices();
  return recorded();
}
