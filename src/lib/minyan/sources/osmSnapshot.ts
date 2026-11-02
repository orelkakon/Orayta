/**
 * Offline OpenStreetMap snapshot (scripts/osm-snapshot.py, Geofabrik Israel
 * extract). Used whenever live Overpass doesn't answer — public Overpass
 * servers block or time out requests from Vercel most of the time.
 * Rows are flat: k = "node/123", la/lo = position, ts = last edit (date),
 * every other key is an OSM tag.
 */
import synagogueRows from '../data/osm-synagogues.json';
import mikvehRows from '../data/osm-mikvaot.json';
import meta from '../data/osm-meta.json';
import { haversineM } from '../geo';

export type SnapshotRow = { k: string; la: number; lo: number; ts: string } & Record<string, string | number>;

export interface SnapshotElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat: number;
  lon: number;
  timestamp: string;
  tags: Record<string, string>;
}

/** Date the snapshot was built (ISO). */
export const OSM_SNAPSHOT_DATE = new Date(`${meta.date}T00:00:00Z`).toISOString();

export const SNAPSHOT_SYNAGOGUES = synagogueRows as unknown as SnapshotRow[];
export const SNAPSHOT_MIKVAOT = mikvehRows as unknown as SnapshotRow[];

export function toElement(row: SnapshotRow): SnapshotElement {
  const [type, id] = row.k.split('/');
  const tags: Record<string, string> = {};
  for (const [key, v] of Object.entries(row)) {
    if (key !== 'k' && key !== 'la' && key !== 'lo' && key !== 'ts') tags[key] = String(v);
  }
  return { type: type as SnapshotElement['type'], id: Number(id), lat: row.la, lon: row.lo, timestamp: `${row.ts}T00:00:00Z`, tags };
}

/** Snapshot rows within `radiusM` of a point, as Overpass-shaped elements. */
export function snapshotNear(rows: SnapshotRow[], lat: number, lng: number, radiusM: number): SnapshotElement[] {
  const dLat = radiusM / 111_000;
  return rows
    .filter(r => Math.abs(r.la - lat) <= dLat && haversineM(lat, lng, r.la, r.lo) <= radiusM)
    .map(toElement);
}
