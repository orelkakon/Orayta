/**
 * Synagogue locations from OpenStreetMap via the Overpass API (server-only).
 *
 * OSM is free (ODbL — attribution shown on the map) and has good coverage of
 * Israeli synagogues: names, often addresses, occasionally phones. It does NOT
 * carry reliable prayer schedules (the free-text `service_times` tag is rare),
 * so times come from our own community reports instead.
 */
import { haversineM } from './geo';

export interface OsmSynagogue {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  serviceTimes: string | null;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
export const OVERPASS_RESULT_CAP = 200;

export function buildOverpassQuery(lat: number, lng: number, radiusM: number): string {
  const around = `(around:${Math.round(radiusM)},${lat.toFixed(5)},${lng.toFixed(5)})`;
  return `[out:json][timeout:15];(`
    + `nwr["amenity"="place_of_worship"]["religion"="jewish"]${around};`
    + `nwr["building"="synagogue"]${around};`
    + `);out center tags ${OVERPASS_RESULT_CAP};`;
}

function addressOf(t: Record<string, string>): string | null {
  if (t['addr:full']) return t['addr:full'];
  const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const parts = [street, t['addr:city']].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** OSM is user-edited: only pass through plain http(s) links. */
function safeUrl(v: string | undefined): string | null {
  return v && /^https?:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}

export function parseOverpass(elements: OverpassElement[]): OsmSynagogue[] {
  const out: OsmSynagogue[] = [];
  const seen = new Set<string>();
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const id = `${el.type}/${el.id}`;
    if (lat === undefined || lng === undefined || seen.has(id)) continue;
    const t = el.tags ?? {};
    // building=synagogue also matches converted/historic buildings of other faiths.
    if (t.religion && t.religion !== 'jewish') continue;
    seen.add(id);
    out.push({
      id, lat, lng,
      name: t['name:he'] ?? t.name ?? null,
      address: addressOf(t),
      phone: t.phone ?? t['contact:phone'] ?? null,
      website: safeUrl(t.website ?? t['contact:website']),
      serviceTimes: t.service_times ?? null,
    });
  }
  return out;
}

/* ── Fetch with mirror fallback + in-process cache ───────────────────── */

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 300;
const cache = new Map<string, { at: number; data: OsmSynagogue[]; capped: boolean }>();

/** Snap to a ~1km grid so nearby users share one Overpass query. */
const GRID = 0.01;
const snap = (v: number) => Math.round(v / GRID) * GRID;
const SNAP_SLACK_M = 800; // max distance between a point and its grid center

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Orayta/1.0 (+https://orayta-eight.vercel.app)',
        },
        body: `data=${encodeURIComponent(query)}`,
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) { lastErr = new Error(`overpass HTTP ${res.status}`); continue; }
      const json = await res.json() as { elements?: OverpassElement[] };
      return json.elements ?? [];
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('overpass unavailable');
}

export async function findSynagogues(lat: number, lng: number, radiusM: number) {
  const cLat = snap(lat), cLng = snap(lng);
  const key = `${cLat.toFixed(2)},${cLng.toFixed(2)},${radiusM}`;
  let hit = cache.get(key);
  if (!hit || Date.now() - hit.at > CACHE_TTL_MS) {
    const elements = await queryOverpass(buildOverpassQuery(cLat, cLng, radiusM + SNAP_SLACK_M));
    hit = { at: Date.now(), data: parseOverpass(elements), capped: elements.length >= OVERPASS_RESULT_CAP };
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
    cache.set(key, hit);
  }
  const within = hit.data
    .map(s => ({ ...s, distanceM: Math.round(haversineM(lat, lng, s.lat, s.lng)) }))
    .filter(s => s.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
  return { synagogues: within, truncated: hit.capped };
}
