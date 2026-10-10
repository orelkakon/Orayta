import { NextRequest, NextResponse } from 'next/server';
import { findSynagogues } from '@/lib/minyan/osm';
import { clampRadius, isValidCoord } from '@/lib/minyan/geo';
import { scheduleStatus } from '@/lib/minyan/confidence';
import { clientIp, loadPlaceData, makeRateLimiter } from '@/lib/minyan/server';
import type { NearbyResponse, Synagogue } from '@/types/minyan';

export const dynamic = 'force-dynamic';

const limited = makeRateLimiter(30, 60_000);

/**
 * Public: synagogues near a point (OpenStreetMap) merged with community
 * minyan reports and admin-verified gabbai contacts, closest first.
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

  let found;
  try {
    found = await findSynagogues(lat, lng, radiusM);
  } catch {
    return NextResponse.json({ error: 'map data unavailable' }, { status: 502 });
  }

  const { times, contacts } = await loadPlaceData(found.synagogues.map(s => s.id));
  const synagogues: Synagogue[] = found.synagogues.map(s => {
    const t = times.get(s.id) ?? [];
    return {
      id: s.id, name: s.name, lat: s.lat, lng: s.lng, distanceM: s.distanceM,
      address: s.address, phone: s.phone, website: s.website,
      osmServiceTimes: s.serviceTimes,
      gabbai: contacts.get(s.id) ?? null,
      times: t,
      status: scheduleStatus(t),
    };
  });

  const body: NearbyResponse = {
    center: { lat, lng }, radiusM, synagogues, truncated: found.truncated, fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
