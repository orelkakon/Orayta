import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { clientIp } from '@/lib/minyan/server';
import { withDeadline } from '@/lib/minyan/sources/cache';
import type { NearbySearchInput, NearbyAdminStats } from '@/types/nearbyStats';
import { nearestArea } from './area';
import { computeNearbyStats, STATS_DAYS } from './compute';

// Server-only: one stats row per nearby search, and the admin aggregation.

const DAY_MS = 86_400_000;
const IP_RETENTION_MS = 10 * DAY_MS;
/** A slow or sleeping database never holds a search back longer than this. */
const RECORD_DEADLINE_MS = 1500;

/** Wake the database while the search runs, so recording at the end is quick. */
export function warmNearbyStats(): void {
  prisma.$connect().catch(() => {});
}

/** Records a search; never throws and never delays the answer by more than ~1.5s. */
export async function recordNearbySearch(req: NextRequest, s: NearbySearchInput): Promise<void> {
  // The admin's own searches never count toward the stats.
  if (isAdmin(req)) return;
  const ipHash = createHash('sha256').update(`${clientIp(req)}|orayta_nearby_v1`).digest('hex');
  const write = prisma.nearbySearch.create({
    data: {
      feature: s.feature, area: nearestArea(s.lat, s.lng), via: s.via, radiusM: s.radiusM,
      results: s.results, nearestM: s.nearestM === null ? null : Math.round(s.nearestM),
      status: s.status, degraded: s.degraded, latencyMs: Math.round(s.latencyMs), ipHash,
    },
    select: { id: true },
  }).then(() => undefined).catch(err => { console.warn('[nearby-stats] record failed', err); });
  await withDeadline(write, RECORD_DEADLINE_MS, undefined);
}

export const searchVia = (req: NextRequest): 'gps' | 'place' =>
  req.nextUrl.searchParams.get('via') === 'place' ? 'place' : 'gps';

/** Admin: the last 30 days aggregated; IP hashes older than 10 days are erased first. */
export async function getNearbyStats(now = new Date()): Promise<NearbyAdminStats> {
  await prisma.nearbySearch.updateMany({
    where: { createdAt: { lt: new Date(now.getTime() - IP_RETENTION_MS) }, ipHash: { not: null } },
    data: { ipHash: null },
  });
  const [total, rows] = await Promise.all([
    prisma.nearbySearch.count(),
    prisma.nearbySearch.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - (STATS_DAYS + 1) * DAY_MS) } },
      select: {
        createdAt: true, feature: true, area: true, via: true, radiusM: true, results: true,
        nearestM: true, status: true, degraded: true, latencyMs: true, ipHash: true,
      },
      take: 100_000,
    }),
  ]);
  return computeNearbyStats(rows, total, now.getTime());
}
