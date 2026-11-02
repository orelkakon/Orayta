import { NextRequest, NextResponse } from 'next/server';
import { clampRadius, isValidCoord } from '@/lib/minyan/geo';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { mergeRecords } from '@/lib/minyan/merge';
import { osmSource } from '@/lib/minyan/sources/osm';
import { wikidataSource } from '@/lib/minyan/sources/wikidata';
import { beershevaSource } from '@/lib/minyan/sources/municipal';
import { telAvivSource } from '@/lib/minyan/sources/telaviv';
import { withDeadline } from '@/lib/minyan/sources/cache';
import { recordNearbySearch, searchVia, warmNearbyStats } from '@/lib/nearbyStats/server';
import type { SourceResult } from '@/lib/minyan/sources/types';
import type { NearbyResponse, ProviderId, ProviderStatus } from '@/types/minyan';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Every source answers (or is given up on) within this — well under maxDuration. */
const SOURCE_DEADLINE_MS = 12_000;
const TIMED_OUT: SourceResult = { records: [], state: 'error', datasetUpdatedAt: null, detail: 'deadline' };

const limited = makeRateLimiter(30, 60_000);

/**
 * Public: synagogues near a point, merged from every external source that
 * covers the area, with automatic reliability per entry. Sources are queried
 * in parallel and cached server-side; a failing or slow source is reported in
 * `providers` and simply contributes nothing — the others are still shown.
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
  const started = Date.now();
  warmNearbyStats();

  const ids: ProviderId[] = ['osm', 'wikidata', 'muni-beersheva', 'muni-telaviv'];
  const results = await Promise.all([
    osmSource(lat, lng, radiusM),
    wikidataSource(lat, lng, radiusM),
    beershevaSource(lat, lng, radiusM),
    telAvivSource(lat, lng, radiusM),
  ].map(p => withDeadline(p, SOURCE_DEADLINE_MS, TIMED_OUT)));

  const providers: ProviderStatus[] = results.map((r, i) => ({
    provider: ids[i], state: r.state, datasetUpdatedAt: r.datasetUpdatedAt,
    ...(r.detail ? { detail: r.detail } : {}), ...(r.snapshot ? { snapshot: true } : {}),
  }));
  results.forEach((r, i) => { if (r.detail) console.warn(`[minyan] ${ids[i]} failed: ${r.detail}`); });
  // The snapshot is listed (live Overpass was down) but isn't a missing source.
  const degraded = results.flatMap((r, i) => r.state === 'error' ? [`${ids[i]}:error`] : r.snapshot ? [`${ids[i]}:snapshot`] : []);
  const stat = { feature: 'minyan' as const, lat, lng, via: searchVia(req), radiusM, degraded };
  // Every source that covers this area failed — that's an error, not "no synagogues".
  if (results.every(r => r.state !== 'ok')) {
    await recordNearbySearch(req, { ...stat, results: 0, nearestM: null, status: 'error', latencyMs: Date.now() - started });
    return NextResponse.json({ error: 'sources unavailable', providers }, { status: 502 });
  }

  const now = new Date();
  const synagogues = mergeRecords(results.flatMap(r => r.records), { lat, lng }, radiusM, now);
  const body: NearbyResponse = {
    center: { lat, lng },
    radiusM,
    synagogues,
    providers,
    truncated: results.some(r => r.truncated),
    fetchedAt: now.toISOString(),
  };
  await recordNearbySearch(req, {
    ...stat, results: synagogues.length, nearestM: synagogues[0]?.distanceM ?? null,
    status: results.some(r => r.state === 'error') ? 'partial' : 'ok', latencyMs: Date.now() - started,
  });
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
