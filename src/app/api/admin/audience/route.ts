import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { dayKeys } from '@/lib/adminStatsUtils';
import { computeSourceStats, SourceDayRow } from '@/lib/audience/sourceStats';
import { computeDeviceStats, DEVICE_READ_DAYS } from '@/lib/audience/devices';
import { purgeOldDevices, quietly, statsSalt } from '@/lib/audience/server';
import type { AudienceStats, DeviceRow } from '@/types/audience';

export const dynamic = 'force-dynamic';

/**
 * Traffic sources + new vs returning devices for the admin dashboard.
 * Both tables are applied by hand; until they exist each half answers
 * `available: false` with empty numbers.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  await purgeOldDevices(true);
  const month = dayKeys(30);
  const read = dayKeys(DEVICE_READ_DAYS);

  const [sourceRows, deviceRows] = await Promise.all([
    quietly<SourceDayRow[] | null>(() => prisma.trafficSourceDaily.findMany({ where: { day: { gte: month[0] } } }), null),
    quietly<DeviceRow[] | null>(() => prisma.deviceDay.findMany({
      where: { day: { gte: read[0] } },
      select: { day: true, idHash: true, firstDay: true },
    }), null),
  ]);
  // "Collecting since" needs the first day ever, not the first in the window.
  const [firstSource, firstDevice] = await Promise.all([
    sourceRows ? quietly(() => prisma.trafficSourceDaily.findFirst({ orderBy: { day: 'asc' }, select: { day: true } }), null) : null,
    deviceRows ? quietly(() => prisma.deviceDay.findFirst({ orderBy: { day: 'asc' }, select: { day: true } }), null) : null,
  ]);

  const src = computeSourceStats(sourceRows ?? [], month);
  // Rows cover 38 days: the 30-day chart plus the earlier D7 cohorts.
  const dev = computeDeviceStats(deviceRows ?? [], month);
  const stats: AudienceStats = {
    sources: { available: sourceRows !== null, ...src, since: firstSource?.day ?? src.since },
    devices: { available: deviceRows !== null, configured: statsSalt() !== null, ...dev, since: firstDevice?.day ?? dev.since },
  };
  return NextResponse.json(stats);
}
