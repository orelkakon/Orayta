import { NextRequest, NextResponse } from 'next/server';
import { isValidCoord } from '@/lib/minyan/geo';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { withDeadline } from '@/lib/minyan/sources/cache';
import { clampMikvehRadius } from '@/lib/mikveh/radius';
import { mergeMikvaot } from '@/lib/mikveh/merge';
import { govMikvaot, osmMikvaot, SourceOut } from '@/lib/mikveh/sources';
import type { MikvehNearbyResponse } from '@/types/mikveh';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const limited = makeRateLimiter(30, 60_000);
const GOV_TIMED_OUT: SourceOut = { records: [], status: { source: 'gov', state: 'error', updatedAt: null, detail: 'deadline' } };

/**
 * Public: mikvaot near a point — the Ministry of Religious Services list
 * (data.gov.il) merged with OpenStreetMap. A failing source is reported in
 * `providers` and the other one is still shown.
 * GET ?lat=31.78&lng=35.21&r=5000
 */
export async function GET(req: NextRequest) {
  if (limited(clientIp(req))) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  if (!sp.get('lat') || !sp.get('lng') || !isValidCoord(lat, lng)) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 });
  }
  const radiusM = clampMikvehRadius(Number(sp.get('r')));

  const gov = await withDeadline(govMikvaot(), 15_000, GOV_TIMED_OUT);
  const osm = osmMikvaot(lat, lng, radiusM);
  if (gov.status.detail) console.warn(`[mikveh] gov failed: ${gov.status.detail}`);

  const now = new Date();
  const body: MikvehNearbyResponse = {
    center: { lat, lng },
    radiusM,
    mikvaot: mergeMikvaot(gov.records, osm.records, { lat, lng }, radiusM),
    providers: [gov.status, osm.status],
    fetchedAt: now.toISOString(),
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
