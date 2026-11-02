/* Server-only: the two mikveh sources, each failing on its own. */
import type { MikvehProviderStatus } from '@/types/mikveh';
import { ckan } from '@/lib/minyan/sources/municipal';
import { ttlCache, errorDetail } from '@/lib/minyan/sources/cache';
import { SNAPSHOT_MIKVAOT, OSM_SNAPSHOT_DATE, snapshotNear } from '@/lib/minyan/sources/osmSnapshot';
import geoTable from './data/mikveh-geo.json';
import { GovMikvehRow, GeoEntry, MIKVEH_PACKAGE_ID, MIKVEH_RESOURCE_ID } from './dataset';
import { parseGov, parseOsmMikvaot, MikvehRecord } from './parse';

const GEO = geoTable as unknown as Record<string, GeoEntry>;

/** The whole national list is ~650 rows — fetched once a day, served stale if data.gov.il is down. */
const govCache = ttlCache<{ records: MikvehRecord[]; updatedAt: string | null }>(24 * 60 * 60 * 1000, 2, 30 * 24 * 60 * 60 * 1000);

export interface SourceOut { records: MikvehRecord[]; status: MikvehProviderStatus }

export async function govMikvaot(): Promise<SourceOut> {
  try {
    const hit = await govCache(MIKVEH_RESOURCE_ID, async () => {
      const [pkg, data] = await Promise.all([
        ckan<{ metadata_modified?: string }>('package_show', `id=${MIKVEH_PACKAGE_ID}`),
        ckan<{ records: GovMikvehRow[] }>('datastore_search', `resource_id=${MIKVEH_RESOURCE_ID}&limit=2000`),
      ]);
      const updatedAt = pkg.metadata_modified ? new Date(`${pkg.metadata_modified}Z`).toISOString() : null;
      return { records: parseGov(data.records, GEO, updatedAt), updatedAt };
    });
    return { records: hit.records, status: { source: 'gov', state: 'ok', updatedAt: hit.updatedAt } };
  } catch (err) {
    return { records: [], status: { source: 'gov', state: 'error', updatedAt: null, detail: errorDetail(err) } };
  }
}

/**
 * OSM mikvaot come from the offline snapshot only: they are a small
 * supplement (~70 places) and live Overpass is blocked for Vercel most of
 * the time, so waiting on it would only slow the page down.
 */
export function osmMikvaot(lat: number, lng: number, radiusM: number): SourceOut {
  return {
    records: parseOsmMikvaot(snapshotNear(SNAPSHOT_MIKVAOT, lat, lng, radiusM)),
    status: { source: 'osm', state: 'ok', updatedAt: OSM_SNAPSHOT_DATE, snapshot: true },
  };
}
