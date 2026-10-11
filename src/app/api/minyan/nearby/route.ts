import { NextRequest, NextResponse } from 'next/server';
import { clampRadius, isValidCoord } from '@/lib/minyan/geo';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { mergeRecords } from '@/lib/minyan/merge';
import { osmSource } from '@/lib/minyan/sources/osm';
import { wikidataSource } from '@/lib/minyan/sources/wikidata';
import { beershevaSource } from '@/lib/minyan/sources/municipal';
import { telAvivSource } from '@/lib/minyan/sources/telaviv';
import type { NearbyResponse, ProviderId, ProviderStatus } from '@/types/minyan';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const limited = makeRateLimiter(30, 60_000);

/**
 * Public: synagogues near a point, merged from every external source that
 * covers the area, with automatic reliability per entry. Sources are queried
 * in parallel and cached server-side; a failing source is reported in
 * `providers` and simply contributes nothing.
 * GET ?lat=31.78&lng=35.21&r=2000
 */
export async function GET(req: NextRequest) {
  if (limited(clientIp(req))) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  if (!sp.get('lat') || !sp.get('lng') || !isValidCoord(lat, lng)) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 });
  }
  const radiusM = clampRadius(Number(sp.get('r')));

  const ids: ProviderId[] = ['osm', 'wikidata', 'muni-beersheva', 'muni-telaviv'];
  const results = await Promise.all([
    osmSource(lat, lng, radiusM),
    wikidataSource(lat, lng, radiusM),
    beershevaSource(lat, lng, radiusM),
    telAvivSource(lat, lng, radiusM),
  ]);

  const providers: ProviderStatus[] = results.map((r, i) => ({ provider: ids[i], state: r.state, datasetUpdatedAt: r.datasetUpdatedAt }));
  // Every source that covers this area failed — that's an error, not "no synagogues".
  if (results.every(r => r.state !== 'ok')) {
    return NextResponse.json({ error: 'sources unavailable', providers }, { status: 502 });
  }

  const now = new Date();
  const body: NearbyResponse = {
    center: { lat, lng },
    radiusM,
    synagogues: mergeRecords(results.flatMap(r => r.records), { lat, lng }, radiusM, now),
    providers,
    truncated: results.some(r => r.truncated),
    fetchedAt: now.toISOString(),
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
