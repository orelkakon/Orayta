/**
 * Official municipal synagogue datasets on data.gov.il, read through the
 * documented CKAN API (datastore_search / package_show).
 *
 * data.gov.il terms allow free reuse provided the app names the site, the
 * dataset and its update date — the UI shows exactly that.
 *
 * Only datasets with coordinates are usable for a map. Surveyed 2026-10:
 *   באר שבע  — 270 records, name/address/coords, updated automatically (used)
 *   חיפה      — 226 records, address only, last updated 2020 (no coords)
 *   פתח תקווה — empty datastore, 2016 (unusable)
 */
import { haversineM } from '../geo';
import { blankRecord, PlaceRecord, SourceResult, USER_AGENT } from './types';
import { ttlCache } from './cache';

interface MuniDataset {
  provider: 'muni-beersheva';
  packageId: string;
  resourceId: string;
  /** Rough city bounds — the dataset is only fetched for searches near it. */
  center: { lat: number; lng: number };
  cityRadiusM: number;
}

export const BEERSHEVA: MuniDataset = {
  provider: 'muni-beersheva',
  packageId: 'synagogues-br7',
  resourceId: '40de91c6-1eb3-4f12-9cea-5c44484377d7',
  center: { lat: 31.2520, lng: 34.7915 },
  cityRadiusM: 9000,
};

export const datasetUrl = (d: MuniDataset) => `https://data.gov.il/dataset/${d.packageId}`;

interface BsRow {
  Id?: number; name?: string; OtherName?: string; street?: string;
  HouseNumbe?: number | string; neighborho?: string; lat?: number; lon?: number;
}

export function parseBeersheva(rows: BsRow[], datasetUpdatedAt: string | null): PlaceRecord[] {
  return rows.flatMap(row => {
    const lat = Number(row.lat), lng = Number(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0) return [];
    const r = blankRecord('muni-beersheva', String(row.Id ?? `${lat},${lng}`), lat, lng);
    // Some rows only carry the secondary name — use it rather than show none.
    const primary = row.name?.trim() || null, other = row.OtherName?.trim() || null;
    r.name = primary ?? other;
    r.altName = primary ? other : null;
    const street = [row.street?.trim(), row.HouseNumbe ? String(row.HouseNumbe) : ''].filter(Boolean).join(' ');
    r.address = [street, 'באר שבע'].filter(Boolean).join(', ');
    // The dataset carries no per-record dates — the dataset's update date applies.
    r.updatedAt = datasetUpdatedAt;
    r.url = datasetUrl(BEERSHEVA);
    return [r];
  });
}

const cache = ttlCache<{ records: PlaceRecord[]; updatedAt: string | null }>(24 * 60 * 60 * 1000, 5);

async function ckan<T>(action: string, params: string): Promise<T> {
  const res = await fetch(`https://data.gov.il/api/3/action/${action}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`data.gov.il HTTP ${res.status}`);
  const json = await res.json() as { success?: boolean; result?: T };
  if (!json.success || !json.result) throw new Error('data.gov.il: unsuccessful response');
  return json.result;
}

export async function beershevaSource(lat: number, lng: number, radiusM: number): Promise<SourceResult> {
  const d = BEERSHEVA;
  if (haversineM(lat, lng, d.center.lat, d.center.lng) > d.cityRadiusM + radiusM) {
    return { records: [], state: 'out-of-area', datasetUpdatedAt: null };
  }
  try {
    const hit = await cache(d.resourceId, async () => {
      const [pkg, data] = await Promise.all([
        ckan<{ metadata_modified?: string }>('package_show', `id=${d.packageId}`),
        ckan<{ records: BsRow[] }>('datastore_search', `resource_id=${d.resourceId}&limit=2000`),
      ]);
      const updatedAt = pkg.metadata_modified ? new Date(`${pkg.metadata_modified}Z`).toISOString() : null;
      return { records: parseBeersheva(data.records, updatedAt), updatedAt };
    });
    return { records: hit.records, state: 'ok', datasetUpdatedAt: hit.updatedAt };
  } catch {
    return { records: [], state: 'error', datasetUpdatedAt: null };
  }
}
