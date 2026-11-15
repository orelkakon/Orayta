import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { dayKeys } from '@/lib/adminStatsUtils';
import { computeSourceStats, SourceDayRow } from '@/lib/audience/sourceStats';
import { computeDeviceStats, DEVICE_READ_DAYS } from '@/lib/audience/devices';
import { orMissing, purgeOldDevices, statsSalt } from '@/lib/audience/server';
import type { AudienceStats, DeviceRow } from '@/types/audience';

export const dynamic = 'force-dynamic';

/**
 * Traffic sources + new vs returning devices for the admin dashboard.
 * Both tables are applied by hand; until they exist each half answers
 * `available: false` with empty numbers. Any other DB error → 500.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    return NextResponse.json(await audience());
  } catch {
    return NextResponse.json({ error: 'db' }, { status: 500 }); // logged by orMissing
  }
}

async function audience(): Promise<AudienceStats> {
  await purgeOldDevices(true);
  const month = dayKeys(30);
  const read = dayKeys(DEVICE_READ_DAYS);

  const [sourceRows, deviceRows] = await Promise.all([
    orMissing<SourceDayRow[], null>(() => prisma.trafficSourceDaily.findMany({ where: { day: { gte: month[0] } } }), null),
    orMissing<DeviceRow[], null>(() => prisma.deviceDay.findMany({
      where: { day: { gte: read[0] } },
      select: { day: true, idHash: true, firstDay: true },
    }), null),
  ]);
  // "Collecting since" needs the first day ever, not the first in the window.
  const [firstSource, firstDevice] = await Promise.all([
    sourceRows ? orMissing(() => prisma.trafficSourceDaily.findFirst({ orderBy: { day: 'asc' }, select: { day: true } }), null) : null,
    deviceRows ? orMissing(() => prisma.deviceDay.findFirst({ orderBy: { day: 'asc' }, select: { day: true } }), null) : null,
  ]);

  const src = computeSourceStats(sourceRows ?? [], month);
  // Rows cover 38 days: the 30-day chart plus the earlier D7 cohorts.
  const dev = computeDeviceStats(deviceRows ?? [], month);
  return {
    sources: { available: sourceRows !== null, ...src, since: firstSource?.day ?? src.since },
    devices: { available: deviceRows !== null, configured: statsSalt() !== null, ...dev, since: firstDevice?.day ?? dev.since },
  };
}
