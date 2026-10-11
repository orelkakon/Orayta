/**
 * OpenStreetMap via the Overpass API (server-only). Free, ODbL — attribution
 * "© OpenStreetMap contributors" is shown on the map and in each card.
 *
 * Provides: name, location, often address, sometimes phone/website/nusach,
 * rarely `service_times`. Freshness = latest of the element's last edit and
 * its `check_date` (survey date). We request `out meta` for the edit date.
 */
import type { ProviderId } from '@/types/minyan';
import { blankRecord, PlaceRecord, SourceResult, USER_AGENT } from './types';
import { ttlCache, snap, SNAP_SLACK_M } from './cache';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  timestamp?: string;
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
    + `);out center tags meta ${OVERPASS_RESULT_CAP};`;
}

function addressOf(t: Record<string, string>): string | null {
  if (t['addr:full']) return t['addr:full'];
  const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const parts = [street, t['addr:city']].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** OSM is user-edited: only pass through plain http(s) links. */
export function safeUrl(v: string | undefined): string | null {
  return v && /^https?:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}

/** Latest of several ISO-ish dates (YYYY-MM-DD or full ISO); null if none parse. */
export function latestDate(...vals: (string | undefined)[]): string | null {
  const ts = vals.map(v => (v ? Date.parse(v) : NaN)).filter(n => !Number.isNaN(n));
  return ts.length ? new Date(Math.max(...ts)).toISOString() : null;
}

/** An OSM `source` tag can reveal the data was copied from another provider. */
export function derivedFromTag(source: string | undefined): ProviderId | null {
  if (!source) return null;
  if (/wikidata/i.test(source)) return 'wikidata';
  if (/tel.?aviv|תל.?אביב|gisn\.tel-aviv/i.test(source)) return 'muni-telaviv';
  if (/be'?er.?sheva|באר.?שבע|data\.gov\.il/i.test(source)) return 'muni-beersheva';
  return null;
}

export function parseOverpass(elements: OverpassElement[]): PlaceRecord[] {
  const out: PlaceRecord[] = [];
  const seen = new Set<string>();
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const key = `${el.type}/${el.id}`;
    if (lat === undefined || lng === undefined || seen.has(key)) continue;
    const t = el.tags ?? {};
    // building=synagogue also matches converted buildings of other faiths.
    if (t.religion && t.religion !== 'jewish') continue;
    seen.add(key);
    const r = blankRecord('osm', key, lat, lng);
    r.name = t['name:he'] ?? t.name ?? null;
    r.altName = t.alt_name ?? t.old_name ?? null;
    r.address = addressOf(t);
    r.nusach = t['nusach'] ?? t['nusach:he'] ?? null;
    r.phone = t.phone ?? t['contact:phone'] ?? null;
    r.website = safeUrl(t.website ?? t['contact:website']);
    r.updatedAt = latestDate(el.timestamp, t.check_date);
    r.url = `https://www.openstreetmap.org/${key}`;
    r.derivedFrom = derivedFromTag(t.source);
    if (t.service_times) {
      r.schedule = {
        weekday: null, shabbat: null, general: t.service_times,
        updatedAt: latestDate(t['check_date:service_times']) ?? r.updatedAt,
      };
    }
    out.push(r);
  }
  return out;
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
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

const cache = ttlCache<{ records: PlaceRecord[]; capped: boolean }>(6 * 60 * 60 * 1000);

/** Records within the snapped cell + slack; the caller filters by exact distance. */
export async function osmSource(lat: number, lng: number, radiusM: number): Promise<SourceResult> {
  const cLat = snap(lat), cLng = snap(lng);
  try {
    const hit = await cache(`${cLat.toFixed(2)},${cLng.toFixed(2)},${radiusM}`, async () => {
      const elements = await queryOverpass(buildOverpassQuery(cLat, cLng, radiusM + SNAP_SLACK_M));
      return { records: parseOverpass(elements), capped: elements.length >= OVERPASS_RESULT_CAP };
    });
    return { records: hit.records, state: 'ok', datasetUpdatedAt: null, truncated: hit.capped };
  } catch {
    return { records: [], state: 'error', datasetUpdatedAt: null };
  }
}
