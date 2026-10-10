import { NextRequest, NextResponse } from 'next/server';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import type { GeocodeResult } from '@/types/minyan';

export const dynamic = 'force-dynamic';

/*
 * Manual-location fallback: address/city search via OpenStreetMap Nominatim.
 * Nominatim's usage policy: ≤1 request/second, identifying User-Agent, cache
 * results. We serialize upstream calls, cache for a day and limit per IP.
 */
const limited = makeRateLimiter(20, 60_000);
const cache = new Map<string, { at: number; data: GeocodeResult[] }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let lastCall = 0;

interface NominatimItem { display_name: string; lat: string; lon: string; }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Keeps the first three parts of Nominatim's long comma-separated label. */
function shortLabel(display: string): string {
  return display.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).join(', ');
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 120);
  if (q.length < 2) return NextResponse.json({ error: 'query too short' }, { status: 400 });
  if (limited(clientIp(req))) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return NextResponse.json(hit.data);

  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();

  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=il'
      + `&accept-language=he&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Orayta/1.0 (+https://orayta-eight.vercel.app)' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ error: 'geocoder unavailable' }, { status: 502 });
    const items = await res.json() as NominatimItem[];
    const data: GeocodeResult[] = items
      .map(i => ({ label: shortLabel(i.display_name), lat: Number(i.lat), lng: Number(i.lon) }))
      .filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng));
    if (cache.size > 1000) cache.delete(cache.keys().next().value as string);
    cache.set(key, { at: Date.now(), data });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'geocoder unavailable' }, { status: 502 });
  }
}
