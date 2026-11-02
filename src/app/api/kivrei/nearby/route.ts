import { NextRequest, NextResponse } from 'next/server';
import { isValidCoord } from '@/lib/minyan/geo';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { clampKivreiRadius } from '@/lib/kivrei/radius';
import { kivreiNear, KIVREI_DATASET_DATE } from '@/lib/kivrei/server';
import type { KivreiNearbyResponse } from '@/lib/kivrei/types';

export const dynamic = 'force-dynamic';

const limited = makeRateLimiter(30, 60_000);

/**
 * Public: graves of tzadikim near a point, from the committed dataset
 * (Hebrew Wikipedia + OpenStreetMap, scripts/kivrei-build.ts), linked to the
 * site's rabbi directory. GET ?lat=32.98&lng=35.44&r=15000
 */
export async function GET(req: NextRequest) {
  if (limited(clientIp(req))) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  if (!sp.get('lat') || !sp.get('lng') || !isValidCoord(lat, lng)) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 });
  }
  const radiusM = clampKivreiRadius(Number(sp.get('r')));

  const body: KivreiNearbyResponse = {
    center: { lat, lng },
    radiusM,
    kivrei: await kivreiNear(lat, lng, radiusM),
    datasetDate: KIVREI_DATASET_DATE,
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
